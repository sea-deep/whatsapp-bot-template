import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import { Logger } from "./utilities/logger";
import { env } from "./utilities/env";
import { appPipeline } from "./helpers/middleware";
import { stage } from "./structures/Stage";
import { sessionManager } from "./utilities/session";
import { Context } from "./structures/Context";

// Import sample routes/middlewares
import { Router } from "./helpers/router";
import { adminOnly } from "./middlewares/adminOnly";
import { cooldown } from "./middlewares/cooldown";

Logger.info(`Starting WhatsApp Bot in ${env.NODE_ENV} mode...`);

// 1. Hook Stage Middleware (Handles active scenes)
appPipeline.use(stage.middleware());

// 2. Sample Routing Middleware (Trigger onboarding scene)
appPipeline.use(Router.route(/^(hi|hello|start)/i, async (ctx) => {
  await ctx.scene.enter("onboarding");
}));

// 3. Sample Admin Command with Cooldown
appPipeline.use(Router.route("!stats", async (ctx, next) => {
  // Apply inline middlewares
  await adminOnly(ctx, async () => {
    await cooldown("stats", 10)(ctx, async () => {
      await ctx.reply("Bot is running perfectly on Baileys! Sessions are being managed robustly.");
    });
  });
}));

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const { version, isLatest } = await fetchLatestBaileysVersion();
  
  Logger.info(`Using WA v${version.join(".")}, isLatest: ${isLatest}`);

  const client = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: "silent" }) as any, // Silence the verbose Baileys logger
  });

  client.ev.on("creds.update", saveCreds);

  client.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      Logger.warn(`Connection closed. Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        connectToWhatsApp();
      } else {
        Logger.error("Logged out. Please delete the 'auth_info_baileys' folder and restart to scan a new QR code.");
      }
    } else if (connection === "open") {
      Logger.success("Client is ready and connected!");
    }
  });

  client.ev.on("messages.upsert", async (m) => {
    try {
      if (m.type !== "notify") return; // Only process new messages
      const message = m.messages[0];
      if (!message.message) return; // Skip protocol messages
      
      // Ignore messages from self to prevent loops
      if (message.key.fromMe) return;

      const senderId = message.key.participant || message.key.remoteJid;
      if (!senderId) return;

      const session = await sessionManager.get(senderId);
      const ctx = new Context(client, message, session);
      
      await appPipeline.execute(ctx);
    } catch (err) {
      Logger.error("Error processing message:", err);
    }
  });
  
  return client;
}

async function main() {
  try {
    await stage.loadScenes();
    await connectToWhatsApp();
  } catch (error) {
    Logger.error("Failed to initialize the bot:", error);
    process.exit(1);
  }
}

main();

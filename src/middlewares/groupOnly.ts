import { Context } from "../structures/Context";
import { Middleware } from "../helpers/middleware";
import { config } from "../configs/config";

export const groupOnly: Middleware = async (ctx: Context, next: () => Promise<void>) => {
  if (!ctx.isGroup) {
    await ctx.reply(config.messages.groupOnly);
    return; // Stop pipeline
  }
  await next();
};

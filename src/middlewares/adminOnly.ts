import { Context } from "../structures/Context";
import { Middleware } from "../helpers/middleware";
import { config } from "../configs/config";

export const adminOnly: Middleware = async (ctx: Context, next: () => Promise<void>) => {
  if (!config.admins.includes(ctx.senderId)) {
    await ctx.reply(config.messages.adminOnly);
    return; // Stop pipeline
  }
  await next();
};

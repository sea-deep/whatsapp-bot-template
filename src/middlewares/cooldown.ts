import { Context } from "../structures/Context";
import { Middleware } from "../helpers/middleware";
import { config } from "../configs/config";

const cooldowns = new Map<string, number>();

/**
 * Creates a cooldown middleware for a specific route/action.
 * @param actionName - A unique identifier for the action
 * @param seconds - Cooldown duration in seconds
 */
export function cooldown(actionName: string, seconds: number): Middleware {
  return async (ctx: Context, next: () => Promise<void>) => {
    const key = `${ctx.senderId}_${actionName}`;
    const now = Date.now();
    const expirationTime = (cooldowns.get(key) || 0) + seconds * 1000;

    if (now < expirationTime) {
      await ctx.reply(config.messages.cooldown);
      return; // Stop pipeline
    }

    cooldowns.set(key, now);
    setTimeout(() => cooldowns.delete(key), seconds * 1000);

    await next();
  };
}

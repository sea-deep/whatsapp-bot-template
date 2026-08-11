import { Context } from "../structures/Context";
import { Middleware } from "./middleware";

export class Router {
  static route(pattern: string | RegExp, mw: Middleware): Middleware {
    return async (ctx: Context, next: () => Promise<void>) => {
      const text = ctx.text;
      let matched = false;

      if (typeof pattern === "string") {
        matched = text.toLowerCase().startsWith(pattern.toLowerCase());
      } else {
        matched = pattern.test(text);
      }

      if (matched) {
        await mw(ctx, next);
      } else {
        await next();
      }
    };
  }
}

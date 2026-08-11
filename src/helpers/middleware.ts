import { Context } from "../structures/Context";

export type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;

export class MiddlewarePipeline {
  private middlewares: Middleware[] = [];

  use(mw: Middleware) {
    this.middlewares.push(mw);
  }

  async execute(ctx: Context) {
    let index = -1;
    const next = async () => {
      index++;
      if (index < this.middlewares.length) {
        await this.middlewares[index](ctx, next);
      }
    };
    await next();
  }
}

export const appPipeline = new MiddlewarePipeline();

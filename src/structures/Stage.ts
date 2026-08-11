import { Context } from "./Context";
import { WizardScene } from "./Scene";
import { resolveFiles } from "../utilities/pathResolver";
import { Logger } from "../utilities/logger";

export class Stage {
  public scenes: Map<string, WizardScene> = new Map();

  register(...scenes: WizardScene[]) {
    for (const scene of scenes) {
      this.scenes.set(scene.id, scene);
    }
  }

  async loadScenes() {
    try {
      const sceneFiles = await resolveFiles("scenes");
      let count = 0;
      for (const file of sceneFiles) {
        const module = await import(file);
        const scene = module.default;
        if (scene instanceof WizardScene) {
          this.register(scene);
          count++;
        }
      }
      Logger.success(`Loaded ${count} scenes into Stage.`);
    } catch (error) {
      Logger.error("Failed to load scenes:", error);
    }
  }

  async executeStep(ctx: Context, sceneId: string, cursor: number) {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      await ctx.scene.leave();
      return false;
    }

    const step = scene.steps[cursor];
    if (step) {
      await step(ctx);
      return true;
    } else {
      await ctx.scene.leave();
      return false;
    }
  }

  /**
   * Middleware handler to intercept messages if user is in a scene
   */
  middleware() {
    return async (ctx: Context, next: () => Promise<void>) => {
      if (ctx.session.__scene) {
        const cursor = ctx.session.__cursor || 0;
        const executed = await this.executeStep(ctx, ctx.session.__scene, cursor);
        // If the scene handled the message, we stop the pipeline (don't call next)
        if (executed) return;
      }
      
      // Not in a scene, or scene finished/invalid
      await next();
    };
  }
}

export const stage = new Stage();

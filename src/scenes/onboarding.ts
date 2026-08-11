import { WizardScene } from "../structures/Scene";
import { Context } from "../structures/Context";

const onboardingScene = new WizardScene(
  "onboarding",
  async (ctx: Context) => {
    await ctx.reply("Welcome to the Bot! What is your name?");
    await ctx.wizard.next();
  },
  async (ctx: Context) => {
    const name = ctx.text.trim();
    if (!name) {
      await ctx.reply("Please send a valid name.");
      return; // stay on current step
    }
    
    ctx.session.name = name;
    await ctx.reply(`Nice to meet you, ${name}! How old are you?`);
    await ctx.wizard.next();
  },
  async (ctx: Context) => {
    const age = parseInt(ctx.text.trim(), 10);
    if (isNaN(age)) {
      await ctx.reply("Please send a valid number for your age.");
      return;
    }

    await ctx.reply(`Awesome! You are ${ctx.session.name} and you are ${age} years old. Setup complete.`);
    await ctx.scene.leave();
  }
);

export default onboardingScene;

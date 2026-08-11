import { Context } from "./Context";

export type StepHandler = (ctx: Context) => Promise<void>;

export class WizardScene {
  public steps: StepHandler[];
  constructor(
    public id: string,
    ...steps: StepHandler[]
  ) {
    this.steps = steps;
  }
}

import { Client } from "whatsapp-web.js";

export interface Event {
  name: string;
  once?: boolean;
  execute: (client: Client, ...args: any[]) => Promise<void>;
}

import { proto, WASocket, WAMessage } from "@whiskeysockets/baileys";
import { SessionData, sessionManager } from "../utilities/session";
import { stage } from "./Stage";

export class Context {
  constructor(
    public client: WASocket,
    public message: proto.IWebMessageInfo,
    public session: SessionData
  ) {}

  /**
   * Safely extracts the text content of the message, handling extended text and media captions.
   */
  public get text(): string {
    const msg = this.message.message;
    if (!msg) return "";
    return (
      msg.conversation ||
      msg.extendedTextMessage?.text ||
      msg.imageMessage?.caption ||
      msg.videoMessage?.caption ||
      ""
    );
  }

  /**
   * The ID of the chat where the message was sent.
   */
  public get chatId(): string {
    return this.message.key?.remoteJid || "";
  }

  /**
   * The ID of the user who sent the message.
   */
  public get senderId(): string {
    return this.message.key?.participant || this.message.key?.remoteJid || "";
  }

  /**
   * Returns true if the message was sent in a group.
   */
  public get isGroup(): boolean {
    return this.chatId.endsWith("@g.us");
  }

  public scene = {
    enter: async (sceneId: string) => {
      this.session.__scene = sceneId;
      this.session.__cursor = 0;
      await this.saveSession();
      await stage.executeStep(this, sceneId, 0);
    },
    leave: async () => {
      delete this.session.__scene;
      delete this.session.__cursor;
      await this.saveSession();
    }
  };

  public get wizard() {
    return {
      next: async () => { 
        this.session.__cursor = (this.session.__cursor || 0) + 1; 
        await this.saveSession();
      },
      back: async () => { 
        this.session.__cursor = Math.max(0, (this.session.__cursor || 0) - 1); 
        await this.saveSession();
      },
      selectStep: async (index: number) => { 
        this.session.__cursor = index; 
        await this.saveSession();
      },
      cursor: this.session.__cursor || 0
    };
  }

  /**
   * Replies to the current message seamlessly using Baileys.
   */
  public async reply(content: string) {
    if (!this.chatId) return;
    return this.client.sendMessage(
      this.chatId,
      { text: content },
      { quoted: this.message as WAMessage }
    );
  }

  public async saveSession() {
    if (!this.senderId) return;
    await sessionManager.save(this.senderId, this.session);
  }
}

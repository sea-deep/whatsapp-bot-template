<div align="center">
  <h1>📱 WhatsApp Bot Template</h1>
  <p><i>A structured, conversational, and professional template for building robust <a href="https://wwebjs.dev/">whatsapp-web.js</a> bots in TypeScript.</i></p>
  
  <p>
    <a href="https://wwebjs.dev/"><img src="https://img.shields.io/badge/WhatsApp--Web.js-v1.23-green?style=for-the-badge&logo=whatsapp" alt="whatsapp-web.js" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-v20+-green?style=for-the-badge&logo=node.js" alt="Node.js" /></a>
  </p>
</div>

---

## 🧩 Where to Place Your Code

The template utilizes a robust conversational architecture focused on scenes and middleware:

- `src/configs/config.ts`: Define your bot's static configurations, admin numbers, and global reply messages here.
- `src/scenes/`: Place your conversational Wizards (multi-step flows) here.
- `src/events/`: Place your standard WhatsApp event listeners (like `qr`, `ready`) here.
- `src/middlewares/`: Add custom pipeline middlewares (like your own rate limiters or auth guards) here.

---

## ✨ Features

This template abstracts away the complexity of managing state over WhatsApp, providing a clean, Express-style middleware engine.

- **Middleware Pipeline Engine**: Seamlessly chain execution using `appPipeline.use(...)`. No more bulky switch statements for routing.
- **Wizard Scenes**: Build linear, multi-step conversational flows effortlessly using `ctx.scene.enter("id")` and `ctx.wizard.next()`. State is managed natively for you.
- **Regex & Keyword Routing**: Route messages organically instead of relying on `!` commands. Automatically trigger scenes based on keywords.
- **Flexible Session Storage**: Supports **Memory** (with a 24h TTL for space optimization), **MongoDB**, and **Redis** seamlessly via environment variables. Perfect for PaaS deployments (Railway, Render, etc.).
- **Built-in Execution Guards**: Intercept commands inline. Support for `adminOnly`, `privateOnly`, `groupOnly`, and per-user `cooldown` rates natively baked in.

---

## 🚀 Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) v20 or higher
- A WhatsApp Account (scan the QR code to authenticate)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/whatsapp-bot-template.git
   cd whatsapp-bot-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   > 🔑 *Open `.env` to configure your preferred Session Storage (`REDIS_URL` or `MONGO_URL`). If left blank, it defaults to a Memory Store.*

---

## 💻 Running the Bot

| Mode | Command | Description |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Runs the bot with hot-reloading via `tsc -w & node --watch dist/index.js`. |
| **Production** | `npm run build && npm start` | Compiles the TypeScript to `dist/` and starts the Node process. |

When the bot starts for the first time, a QR code will print to the terminal. Scan it using the "Linked Devices" feature on your WhatsApp mobile app.

---

## 📁 Detailed Project Structure

```text
whatsapp-bot-template/
├── src/
│   ├── configs/           # Centralized configuration (config.ts)
│   ├── structures/        # TypeScript classes (Context, Stage, Scene)
│   ├── utilities/         # Core engine (sessionManager, env, logger)
│   ├── helpers/           # Pipeline engine (middleware, router)
│   ├── middlewares/       # ➔ Your Reusable Guards (adminOnly, cooldown)
│   ├── scenes/            # ➔ Your Conversational Flows & Wizards
│   ├── events/            # ➔ Your Standard Events (qr, ready)
│   └── index.ts           # Main entry point (registers pipelines & launches bot)
├── .env.example           # Environment template
└── package.json           # Dependencies and scripts
```

---

## 🤝 Contributing, Issues, & Discussions

We welcome all contributions! If you have a question, want to suggest a feature, or found a bug:
- **Discussions**: Have an idea or need help? Start a thread in our [Discussions](#) tab.
- **Issues**: Found a bug? Open an [Issue](#) with reproducible steps.
- **Contributing**: Check out our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on submitting Pull Requests.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

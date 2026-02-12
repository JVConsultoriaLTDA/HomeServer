# HomeServer

Home automation stack running [n8n](https://n8n.io/) workflows exposed via [ngrok](https://ngrok.com/).

## Workflows

- **ExpenseTracker** — Telegram bot that receives voice messages describing expenses, uses Gemini to extract structured data, and logs to Google Sheets.
- **NutrientTracker** — Telegram bot that receives photos, audio, or text describing meals, uses Gemini to estimate nutritional info, and logs to Google Sheets.

## Setup

1. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

2. Start the stack:
   ```bash
   docker compose up -d
   ```

3. Open n8n at `http://localhost:5678`, import the workflow JSONs, and configure credentials (Telegram bot tokens, Google Gemini API key, Google Sheets OAuth2).

4. Replace `YOUR_SPREADSHEET_ID` in each workflow JSON with your actual Google Sheets document ID.

## TODO

- [ ] Externalize n8n credentials (Telegram bot tokens, Gemini API key, Google Sheets OAuth2) via environment variables so they can be version-controlled in `.env.example` and injected at runtime

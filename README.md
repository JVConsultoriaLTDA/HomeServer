# HomeServer

Home automation stack running [n8n](https://n8n.io/) workflows exposed via [ngrok](https://ngrok.com/).

## Workflows

- **ExpenseTracker** — Telegram bot that receives voice messages describing expenses, uses Gemini to extract structured data, and logs to Google Sheets.
- **NutrientTracker** — Telegram bot that receives photos, audio, or text describing meals, uses Gemini to estimate nutritional info, and logs to Google Sheets.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be installed and running (whale icon in menu bar)

## Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/jvlcapi/HomeServer.git
   cd HomeServer
   ```

2. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |----------|-------------|
   | `NGROK_AUTHTOKEN` | Your ngrok authentication token ([get one here](https://dashboard.ngrok.com/get-started/your-authtoken)) |
   | `WEBHOOK_URL` | Your ngrok public URL (check http://localhost:4040 after starting) |

3. Start the stack:
   ```bash
   docker compose up -d
   ```

4. Access the services:
   - **n8n**: http://localhost:5678
   - **ngrok dashboard**: http://localhost:4040

5. In n8n, import the workflow JSONs and configure credentials:
   - Telegram bot token
   - Google Gemini API key
   - Google Sheets OAuth2

6. Replace `YOUR_SPREADSHEET_ID` in each workflow JSON with your actual Google Sheets document ID.

## Usage

```bash
# Start
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f    # Ctrl+C to exit

# Check status
docker compose ps

# Update n8n
docker compose pull && docker compose up -d
```

### Shell aliases (optional)

Add to your `~/.zshrc`:

```bash
alias home-server-up="docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml up -d"
alias home-server-down="docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml down"
alias home-server-logs="docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml logs -f"
alias home-server-status="docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml ps"
```

Then run `source ~/.zshrc`.

## Notes

- n8n data is persisted in a Docker volume (`n8n_data`) and survives restarts
- The ngrok URL changes on every restart — update `WEBHOOK_URL` in `.env` if it changes
- Check the current ngrok URL at http://localhost:4040

## TODO

- [ ] Externalize n8n credentials (Telegram bot tokens, Gemini API key, Google Sheets OAuth2) via environment variables so they can be version-controlled in `.env.example` and injected at runtime

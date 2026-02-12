# HomeServer

Home automation stack running [n8n](https://n8n.io/) workflows exposed via [ngrok](https://ngrok.com/).

## Workflows

### 1. ExpenseTracker
- **Function**: Receives voice messages describing expenses, uses Gemini to extract structured data (Description, Value, Category, Date, Split, Type), and logs to Google Sheets.
- **Features**:
  - **Auto-Categorization**: Determines if an expense is `BUSINESS` or `PERSONAL` based on keywords (e.g., "empresa", "reembolso").
  - **Multi-Sheet Support**: Routes data to different sheets (`SHEET_NAME_MAIN` or `SHEET_NAME_SECONDARY`) based on the expense type.
  - **Dynamic Analysis**: Extracts date relative to the message time ("ontem", "hoje").

### 2. NutrientTracker
- **Function**: Receives photos, audio, or text describing meals, uses Gemini to estimate nutritional info, and logs to Google Sheets.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be installed and running.

## Setup

### 1. Environment Variables (`.env`)
1. Clone the repo and navigate to the directory:
   ```bash
   git clone https://github.com/jvlcapi/HomeServer.git
   cd HomeServer
   ```
2. Copy `.env.example` (or create `.env`) and fill in your values:
   ```bash
   cp .env.example .env
   ```
   **Required Variables:**
   ```properties
   # General
   NGROK_AUTHTOKEN="your_ngrok_token"
   WEBHOOK_URL="your_ngrok_url"

   # Expense Tracker Configuration
   SHEET_NAME_MAIN="Your Main Sheet Name"
   SHEET_NAME_SECONDARY="Your Secondary Sheet Name"
   SPREADSHEET_ID_EXPENSE="your_spreadsheet_id"

   # Nutrient Tracker Configuration
   SPREADSHEET_ID_NUTRIENT="your_spreadsheet_id"

   # API Keys & Tokens
   TELEGRAM_BOT_TOKEN_EXPENSE="your_expense_bot_token"
   TELEGRAM_BOT_TOKEN_NUTRIENT="your_nutrient_bot_token"
   GOOGLE_GEMINI_API_KEY="your_gemini_api_key_AIza..."
   ```

### 2. Start the Stack
```bash
docker compose up -d
```
This will start n8n (port 5678) and ngrok (port 4040).

### 3. Configure n8n
1. Access **n8n** at http://localhost:5678.
2. Import the workflow JSONs from `ExpenseTracker/` and `NutrientTracker/`.
3. **Configure Credentials**:
   - **Telegram API**: Create credentials using the tokens from `.env` (or let n8n use the environment variables if configured in the node).
   - **Google Gemini API**: Create a credential using your API Key.
   - **Google Sheets OAuth2 API**: Create a credential using your GCP Client ID/Secret.
     - *Note*: You must set up a project in Google Cloud Console, enable Sheets API, and create OAuth credentials.
     - The `Redirect URL` in GCP should be: `https://<your-ngrok-url>/rest/oauth2-credential/callback`

### 4. Configure Google Apps Script (For Expense Charts)
1. Open your target Google Spreadsheet.
2. Go to `Extensions` > `Apps Script`.
3. Copy the content of [`google-apps-script-financeiro.js`](ExpenseTracker/google-apps-script-financeiro.js).
4. **Important**: Go to **Project Settings** (gear icon) > **Script Properties** and add:
   - `SHEET_NAME_MAIN`: Same as in `.env`
   - `SHEET_NAME_SECONDARY`: Same as in `.env`
5. Run the `criarResumoEGrafico` function to generate charts.

### 5. Configure Google Apps Script (For Nutrient Charts)
1. Open your target Google Spreadsheet (for nutrition).
2. Ensure your data sheet is named **"Tabela"**.
3. Go to `Extensions` > `Apps Script`.
4. Copy the content of [`google-apps-script-nutricional.js`](NutrientTracker/google-apps-script-nutricional.js).
5. Run the `criarResumoNutricional` function to generate charts.

## Usage

```bash
# Start/Restart
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f
```

### Shell Aliases (Optional)
Add to your `~/.zshrc`:
```bash
alias home-server-up="docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml up -d"
alias home-server-down="docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml down"
alias home-server-logs="docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml logs -f"
```

## Troubleshooting
- **n8n Error "Access to env vars denied"**: Ensure `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` is set in `docker-compose.yml` (it is by default in this repo).
- **Ngrok URL Changes**: Update `WEBHOOK_URL` in `.env` and restart if the tunnel restarts.

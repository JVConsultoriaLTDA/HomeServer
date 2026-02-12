====================================
  HOME SERVER - QUICK GUIDE
====================================

PREREQUISITE:
  Docker Desktop must be running (whale icon in menu bar)

------------------------------------
  START THE SERVER
------------------------------------

1. Open Docker Desktop (Applications > Docker)
2. Wait for the whale icon to stop animating
3. In terminal, run:

   docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml up -d

4. Done. Access:
   - n8n:             http://localhost:5678
   - ngrok dashboard: http://localhost:4040

------------------------------------
  STOP THE SERVER
------------------------------------

1. In terminal, run:

   docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml down

2. (Optional) Close Docker Desktop to free up memory

------------------------------------
  VIEW LOGS
------------------------------------

   docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml logs -f

   (Ctrl+C to exit logs)

------------------------------------
  CHECK STATUS
------------------------------------

   docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml ps

------------------------------------
  UPDATE n8n
------------------------------------

   docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml pull
   docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml up -d

------------------------------------
  SHORTCUTS (optional)
------------------------------------

Add to your ~/.zshrc for short commands:

   alias home-server-up="docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml up -d"
   alias home-server-down="docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml down"
   alias home-server-logs="docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml logs -f"
   alias home-server-status="docker compose -f ~/Documents/GitHub/HomeServer/docker-compose.yml ps"

Then run: source ~/.zshrc

After that just use:
   server-up
   server-down
   server-logs
   server-status

------------------------------------
  NOTES
------------------------------------

- Your n8n data is persisted in a Docker volume (n8n_data), it survives restarts
- The ngrok URL changes on every restart. Update WEBHOOK_URL in docker-compose.yml if it changes
- To check the current ngrok URL: http://localhost:4040

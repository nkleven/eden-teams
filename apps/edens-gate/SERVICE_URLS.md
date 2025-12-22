# Edens Gate - Service URLs

## Production Services

| Service | Local Development | Production URL | Description |
|---------|------------------|----------------|-------------|
| **Edens Gate** | http://localhost:3000 | TBD | Unified dashboard (this app) |
| **Eden Worker** | http://localhost:3000 | TBD | Task processing & job orchestration |
| **Eden Prophet** | http://localhost:3000 | https://prophet.nwiss.net | AI model training & predictions |
| **Eden Teams** | http://localhost:5173 | https://teams.kellskreations.com | Collaboration & team management |
| **Eden Market** | http://localhost:4000 | TBD | Data marketplace |
| **Eden Shepard** | http://localhost:8000 | https://shep.nwis.co.in | Service orchestration & monitoring |
| **Eden Exodus** | http://localhost:5173 | TBD | Data migration & transformation |
| **Eden Genesis** | Open `index.html` | https://genesis.kellzkreations.com | IFTTT-style automation |
| **Eden Scroll Reader** | http://localhost:8080/ui | TBD | Document processing API |

## Quick Access

All services can be accessed from:
- **Dashboard**: Click "Open App" button on service cards
- **Navigation**: Click the external link icon (↗) next to service names in the sidebar

## Notes

- Local development URLs assume default ports
- Some services may require authentication (Azure AD/Entra ID)
- Production URLs are live; local URLs require running the respective service

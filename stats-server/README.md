# Statistiques anonymes (retour J+1 / J+7)

Pour Tedy (VPS). Node 18+, aucune dépendance.

1. `STATS_TOKEN=<mot-secret-de-ton-choix> PORT=8787 node server.js` (ou pm2 / systemd).
2. Mettre le serveur derrière HTTPS (nginx/caddy) : `https://stats.exemple.com/ping` → `localhost:8787/ping`.
3. Dans `inde/game.js`, renseigner `STATS_URL = 'https://stats.exemple.com/ping'` (vide = désactivé), puis republier.
4. Résultats : `GET /stats?token=<mot-secret>` → par jour d'arrivée : nombre de nouveaux joueurs, % de retour J+1 et J+7.

Données stockées : un identifiant aléatoire, le jour et la langue. Ni nom, ni e-mail, ni IP. Le token ne doit jamais être commité.

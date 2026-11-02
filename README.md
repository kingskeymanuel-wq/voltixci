# Atelier Dépannage IT

Application web de dépannage pour centre d'appels, pensée pour les débutants.

**Diagnostic par capture d'écran** : collez une capture (Ctrl + V), glissez-la ou choisissez un fichier. L'application lit le message d'erreur, reconnaît l'application concernée et le code, l'explique et propose les étapes de résolution illustrées.

## Ce que contient l'application

- **Académie** : 8 parcours façon application d'apprentissage (leçons, formations sur les réparations, exercices, missions de dépannage avec des collègues fictifs), XP, séries, badges et tableau de progression
- **Fiches en mode pas à pas** : une étape à la fois, avec l'écran à cliquer

- **Diagnostic** : capture d'écran ou description → erreur expliquée, gestes immédiats, fiches à suivre
- **64 fiches illustrées pas à pas** : Cisco (Finesse, téléphones IP, files, audio, SIP), Microsoft Teams, Outlook, Microsoft Engage (CRM), Office, Windows, réseau, imprimantes, navigateur, comptes, sécurité, matériel
- **93 codes d'erreur expliqués** : écrans bleus, Windows Update, HTTP, Office, Microsoft Engage / Dynamics 365, codes SIP, codes de raison agent Cisco, messages des téléphones, Jabber et Finesse
- **Guides Windows pour débutant**, **boîte à scripts** de réparation (.bat), **commandes**, **check du matin**
- **Journal des incidents** (enregistré sur l'appareil, export CSV pour Excel)

## Comment la capture est analysée

1. **Lecture automatique (toujours active)** : le texte de la capture est lu dans le navigateur (OCR Tesseract, servi par ce serveur), puis comparé au dictionnaire des codes et aux fiches.
2. **Analyse IA (optionnelle)** : si la variable `ANTHROPIC_API_KEY` est définie sur Render, la capture est aussi analysée par Claude, qui comprend les messages même sans code connu.

## Déploiement sur Render

Le fichier `render.yaml` décrit le service : Node, `npm install`, `node server.js`.

Variables d'environnement facultatives :

| Variable | Rôle |
|---|---|
| `ANTHROPIC_API_KEY` | Active l'analyse IA des captures |
| `ACCESS_CODE` | Code que l'équipe saisit pour utiliser l'analyse IA (évite qu'un inconnu consomme la clé) |
| `ANTHROPIC_MODEL` | Modèle utilisé (défaut : `claude-sonnet-5-5`) |
| `ANALYSES_PER_HOUR` | Limite d'analyses IA par adresse et par heure (défaut : 40) |

Sans clé, l'application fonctionne entièrement avec la lecture automatique.

## Structure

- `public/index.html` : l'application (un seul fichier)
- `server.js` : serveur (application, moteur OCR, API d'analyse)
- `sources/` : le code découpé (mise en page, fiches, codes d'erreur, illustrations, académie, diagnostic)

Photos : [Unsplash](https://unsplash.com), licence Unsplash (usage libre). Elles sont chargées depuis images.unsplash.com ; si elles ne se chargent pas, l'application affiche ses illustrations.

## Lancer en local

```
npm install
npm start
```
puis ouvrir http://localhost:10000

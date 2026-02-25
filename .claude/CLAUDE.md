# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is a new, empty project. Update this file as the codebase is built out to document build commands, architecture decisions, and development workflows.

## Langue

Toujours répondre en français.

## Context7

Utilise toujours Context7 lorsque j'ai besoin de générer du code, d'étapes de configuration ou d'installation, ou de documentation de bibliothèque/API. Cela signifie que tu dois automatiquement utiliser les outils MCP Context7 pour résoudre l'identifiant de bibliothèque et obtenir la documentation de bibliothèque sans que j'aie à le demander explicitement.

## Aperçu de l'objectif du projet

À compléter au fur et à mesure que le projet est défini.

## Aperçu de l'architecture globale

À compléter au fur et à mesure que l'architecture est établie.

## Style visuel

- Interface claire et minimaliste
- Pas de mode sombre pour le MVP

## Contraintes et Politiques

- NE JAMAIS exposer les clés API au client

## Dépendances

- Préférer les composants existants plutôt que d'ajouter de nouvelles bibliothèques UI

## Tests d'interface

À la fin de chaque développement qui implique l'interface graphique :
- Tester avec playwright-skill, l'interface doit être responsive, fonctionnel et répondre au besoin développé

## Documentation

- PRD : [PRD.md](../PRD.md)
- Architecture : [ARCHITECTURE.md](../ARCHITECTURE.md)

## Spécifications

Toutes les spécifications doivent être rédigées en français, y compris les specs OpenSpec (sections Purpose et Scenarios). Seuls les titres de Requirements doivent rester en anglais avec les mots-clés SHALL/MUST pour la validation OpenSpec.

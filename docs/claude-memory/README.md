# ⚠️ Mémoire Claude — PRIVÉ — À RETIRER AVANT DE PASSER LE REPO EN PUBLIC

Ce dossier est un **snapshot de la mémoire Claude** du projet, copié ici
uniquement pour transférer l'état de travail vers une autre machine **tant que
le repo est privé**.

Il contient du **contenu personnel** (contexte familial, stratégie LinkedIn,
préférences de workflow Claude) qui **NE DOIT PAS être publié**.

## 🔴 AVANT DE RENDRE LE REPO PUBLIC

1. Supprimer ce dossier : `git rm -r docs/claude-memory && git commit`
2. Purger l'historique si nécessaire (le dossier reste dans les anciens commits) :
   `git filter-repo --path docs/claude-memory --invert-paths` (ou BFG).

## Restaurer sur une autre machine

Copier ces `.md` vers le dossier mémoire Claude local de la machine :
`~/.claude/projects/<hash-du-projet>/memory/`
(le `<hash>` est dérivé du chemin absolu du projet ; recréer le dossier si absent).

Le travail technique (specs, plans, journal, backlog) est de toute façon dans
`docs/` et n'a pas besoin de ce snapshot.

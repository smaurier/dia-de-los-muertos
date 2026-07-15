---
name: lecon-multi-pieces
description: "Échec du chantier \"toutes les pièces d'un coup\" (2026-07-13) — rollback total à fbf0180 ; méthode à suivre la prochaine fois"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1d898911-6f52-44bb-982c-a89e2d2183bf
---

Le 2026-07-13, tentative de construire TOUTES les pièces de plan-maison-v1.png en une passe (shells + lettres + couloirs). Trois itérations ratées (pièce dans la pièce, pas de couloir, couloir mal placé), Sylvain a demandé un rollback total : `git reset --hard fbf0180` (= dernier push avant le chantier, cuisine meublée). Commits supprimés récupérables au reflog (dernier : 5a2827d).

**Why :** le plan a une boussole non standard (O en haut, N à droite) et un couloir en L implicite — je l'ai mal lu plusieurs fois. Construire 8 pièces + collisions + murs d'un coup multiplie les erreurs et rend chaque correction illisible pour Sylvain qui valide visuellement.

**How to apply :** la prochaine fois, UNE pièce à la fois : (1) transcrire le plan et faire valider la transcription (ASCII + coords) AVANT tout code ; (2) construire le couloir seul, validation visuelle ; (3) ajouter les pièces une par une, commit par pièce. Jamais toucher salon/cuisine. Voir [[salon-roadmap-2026-07]] et [[sylvain-contexte]] (itératif visuel).

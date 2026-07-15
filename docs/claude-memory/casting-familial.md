---
name: casting-familial
description: Noms définitifs des 20 personnages famille + rôle narratif clé de Tío Abuelo Aurelio
metadata: 
  node_type: memory
  type: project
  originSessionId: 1d898911-6f52-44bb-982c-a89e2d2183bf
---

Casting validé par Sylvain (2026-07-12). Commit `9889b81`.

**Clé narrative :** Tío Abuelo Aurelio = le mort. Grand-oncle sur le canapé = l'adulte fantôme de la spec. Pas de reflet dans le miroir. Photo sur l'ofrenda ch8. `excludeFromSocialGraph: true`.

| id | Nom | Tier | Notes |
|----|-----|------|-------|
| maman | Mamá Elena | T2 | ✅ GLB |
| papa | Papá Carlos | T2 | à générer |
| oncle1 | Tío Héctor | T2 | rig partagé homme adulte |
| oncle2 | Tío Ramón | T2 | rig partagé |
| oncle3 | Tío Beto | T2 | rig partagé |
| tante1 | Tía Lupita | T2 | rig partagé femme adulte |
| tante2 | Tía Consuelo | T2 | rig partagé |
| enfant4 | Mariana | T2 | enfant sage à table |
| cousin1 | Toño | T1 | cousin cache-cache |
| cousine1 | Fernanda | T1 | |
| cousine2 | Camila | T1 | |
| oncle-jeune | Tío Andrés | T1 | 4 enfants |
| tante-jeune | Tía Verónica | T1 | femme d'Andrés |
| enfant1 | Mateo | T1 | |
| enfant2 | Valentina | T1 | |
| enfant3 | Diego | T1 | |
| soeur | Sofía | T3 | sœur d'Emi |
| grande-tante | Tía Abuela Rosa | T3 | assoupie fauteuil |
| bebe | el bebé | T3 | |
| — | Tío Abuelo Aurelio | spécial | ✅ GLB, le mort |
| — | Emi (héros) | joueur | ✅ GLB |

**Rigs partagés (8-9 maillages uniques) :**
- Homme adulte base → Carlos, Héctor, Ramón, Beto, Andrés
- Femme adulte base → Lupita, Consuelo, Verónica, Rosa, Sofía
- Enfant garçon → Mateo, Diego, Toño
- Enfant fille → Valentina, Fernanda, Camila, Mariana

**Why:** économiser les générations Hunyuan — textures différentes sur même squelette Mixamo.
**How to apply:** générer 4-5 bases uniques, pas 19 modèles distincts.

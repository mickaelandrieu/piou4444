---
description: Run the full local quality checklist (typecheck, lint, tests, build) before committing
---

# /before-commit

Exécute la check-list complète de qualité avant tout commit, dans l'ordre :

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test` (avec coverage si la session le permet)
4. `npm run build`

(Les tests E2E Playwright et les scans sécu OSV/gitleaks tournent en CI,
inutile de les rejouer localement systématiquement — sauf si la spec en
cours touche au funnel utilisateur ou à des dépendances.)

## Sortie attendue

### Cas vert
- Résumé en une ligne : `✅ typecheck · ✅ lint · ✅ test · ✅ build`
- Proposer à l'utilisateur de procéder au commit (sans lancer le commit
  automatiquement).

### Cas rouge
- Arrêter à la première étape en échec.
- Afficher l'erreur précise (fichier + ligne + message).
- Proposer un fix concret si la cause est identifiable, sinon poser une
  question diagnostique.

## Règle stricte

Ne **JAMAIS** lancer `git commit` automatiquement. L'agent prépare, l'humain
décide.

Ne **JAMAIS** suggérer `--no-verify`, `--no-gpg-sign`, ou tout flag qui
contournerait les hooks. Si un hook plante, la cause se corrige.

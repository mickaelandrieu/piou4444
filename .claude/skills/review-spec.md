---
description: Review a product spec against CLAUDE.md principles, DO NOT list, and structural conventions
---

# /review-spec

Vérifie la conformité d'une spec aux principes du projet.

## Arguments

- Optionnel : numéro de la spec (ex. `003`). Si non fourni, prend la spec la
  plus récente en statut `proposé`.

## Checks à effectuer

### Structure

- [ ] En-tête complet : Statut, Date, Périmètre
- [ ] Statut ∈ {`proposé`, `validé`, `livré`, `obsolète`}
- [ ] Date au format `YYYY-MM-DD`
- [ ] Si elle remplace une autre spec : champ `Remplace` présent et la spec
      référencée est marquée `obsolète` (à signaler comme à mettre à jour)
- [ ] Section *Critères d'acceptation* présente, mesurable

### Règles non négociables (CLAUDE.md §5)

- [ ] La spec ne propose pas de retirer le disclaimer médical
- [ ] La spec ne mentionne pas "TDAH" comme étiquette à afficher
- [ ] Tout traitement de PII a une base légale documentée
- [ ] Toute capture email respecte le consentement explicite

### DO NOT (CLAUDE.md §9)

- [ ] Aucun mécanisme de bypass du paywall n'est mentionné
- [ ] Aucun nouveau SaaS sans mise à jour prévue de `specs/architecture.md`
- [ ] Aucune dépendance non edge-compatible côté serveur sans contournement

### Qualité

- [ ] Si la spec introduit du code en production : section testing est
      explicite (quels comportements testés)
- [ ] Si la spec touche l'archi : impact sur `architecture.md` mentionné

## Sortie attendue

- **✅ Conforme** — liste les checks verts, signaler la spec prête pour
  validation utilisateur.
- **🟡 Points à corriger** — liste numérotée précise, chaque point reformulé
  comme une action concrète.

Ne propose JAMAIS de modifier la spec automatiquement. Demande à l'utilisateur
de valider chaque correction.

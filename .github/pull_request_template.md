## Spec implémentée

<!-- Référence obligatoire. Exemple : "Implémente spec 003 (commit 3/4 — CLAUDE.md + hooks + skills)" -->

## Résumé

<!-- 2-3 bullets, ce qui change et pourquoi -->

-
-

## Check-list de conformité

- [ ] Une spec dans `specs/` couvre ce changement (ou cette PR met à jour la spec en même temps)
- [ ] CI verte : typecheck, lint, tests unit, tests E2E, OSV-Scanner, gitleaks
- [ ] Aucune règle de `CLAUDE.md` §9 (DO NOT) enfreinte
- [ ] Si nouveau sous-traitant SaaS introduit : `specs/architecture.md` mis à jour
- [ ] Si modification du moteur de scoring ou de l'interprétation : tests ajoutés / mis à jour
- [ ] Si touche aux UIs : disclaimer médical encore visible sur toutes les étapes

## Plan de test

<!-- Pour les changements purement back/logique : les tests automatisés suffisent. Pour les changements UI, lister 2-3 étapes manuelles de vérification. -->

## Notes pour la revue produit

<!-- Ce qu'il faut savoir pour comprendre le changement sans lire le code -->

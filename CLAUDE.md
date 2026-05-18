# CLAUDE.md — Conventions et garde-fous du projet

Document lu à chaque session d'agent. Court par design.

---

## 1. Mission

Outil web d'auto-évaluation attentionnelle basé sur l'**ASRS v1.1** (OMS).
**Non médical, non diagnostique.** Vend une lecture compréhensible d'un
screening validé scientifiquement, pas un test.

## 2. Modèle de contribution

**Toutes les contributions techniques de ce projet sont produites par Claude
Code.** L'utilisateur valide les specs et le comportement produit, pas le code
ligne à ligne. Conséquences directes :

- La **CI doit être verte** avant tout merge (status check `quality` requis).
- Les **PR doivent référencer la spec implémentée** (template
  `.github/pull_request_template.md`).
- Les **tests sont le contrat** : si un comportement n'a pas de test qui le
  protège, il sera réécrit ou cassé tôt ou tard. Pas de raccourci.
- Pas d'amendement de commits déjà poussés ; correction = nouveau commit.

## 3. Source de vérité

`specs/` est la source de vérité produit. Convention :

- 1 spec = 1 fichier numéroté (`NNN-titre.md`)
- Statut : `proposé` → `validé` → `livré` → `obsolète`
- Aucune feature ne s'implémente sans spec à jour
- Une spec qui en remplace une autre la cite explicitement (champ `Remplace`)

Skills utilitaires : `/new-spec`, `/review-spec`, `/before-commit`.

## 4. Stack figée

- **Front** : Astro 5 + îlots React 18 + Tailwind v4 + TypeScript
- **Hosting** : Cloudflare Pages (free, build CF natif)
- **DB + Auth** : Supabase (région EU)
- **Paiement** : Stripe Checkout + Stripe Tax
- **Email** : Brevo (transactionnel + marketing automation)
- **Tests** : Vitest + @testing-library/react + Playwright + MSW
- **Sécurité** : OSV-Scanner + gitleaks + ESLint + plugin-security
- **Pre-commit** : lefthook (typecheck + lint + tests sur fichiers changés)
- **CI** : GitHub Actions (`.github/workflows/ci.yml`)

Tout changement de cette stack passe par une spec dédiée.

## 5. Règles produit non négociables

- **Disclaimer médical permanent** sur toutes les surfaces (UI, emails,
  exports PDF). Texte canonique dans `src/components/Disclaimer.tsx`.
- **Aucune mention « TDAH »** dans le code, les UI, les emails. Le produit
  ne diagnostique pas.
- **RGPD strict** : pas de stockage de PII non justifié par une base légale
  documentée. Sous-traitants listés dans `specs/architecture.md`.
- **Pas de dark pattern** sur la capture email : opt-in newsletter explicite,
  case décochée par défaut, possibilité de continuer sans email.
- **Pas de discount précoce** dans les relances d'abandon paywall (entraîne
  l'attente — cf. spec 002 §5.3).

## 6. Définition de prêt à merger

Une PR est prête quand TOUS les points suivants sont verts :

- [ ] `npm run typecheck` (astro check)
- [ ] `npm run lint` (eslint, 0 erreur, 0 warning)
- [ ] `npm run test` (vitest, couverture ≥ seuils §7)
- [ ] `npm run build` (astro build avec adapter Cloudflare)
- [ ] `npm run test:e2e` (Playwright sur les parcours critiques)
- [ ] OSV-Scanner (aucune CVE high/critical non exemptée)
- [ ] gitleaks (aucun secret détecté)
- [ ] La PR référence une spec
- [ ] Aucune règle §9 enfreinte

Toute exception est explicite (commentaire dans la PR, exemption datée dans
`.osv-scanner.toml`), jamais silencieuse.

## 7. Conventions de tests (behavior-driven)

> Chaque comportement spécifié dans `specs/` doit avoir au moins un test
> qui échoue si ce comportement casse.

Cibles par surface :

- Logique pure (`src/lib/`) : ≥ 95 % lignes, frontières + transitions de
  niveaux explicitement testées
- Endpoints API : 100 % des cas spécifiés (succès + chaque erreur référencée
  dans la spec)
- Composants React : smoke test + interactions clés (clic, saisie)
- Funnel utilisateur : E2E Playwright sur golden path + 2-3 cas d'erreur
- Webhooks tiers (Stripe, Brevo) : signature, idempotence, payload malformé,
  replay

**Pas de tests bidons** pour gonfler la couverture. Si un fichier n'a pas
de comportement à tester, l'exclure explicitement de `coverage.include`.

## 8. Conventions de commits et PR

Format : `type: sujet en minuscules`

Types : `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `migrate`,
`specs`, `style`.

Exemples :
- `feat: capture email avant test complet (spec 002 §3.2-C)`
- `fix: idempotence webhook Stripe sur replay (spec 004)`
- `specs: add 005 — comparaison populationnelle anonymisée (proposé)`

PR : un seul changement logique, idéalement < 400 lignes diff. Si plus
gros, découper. Référencer la spec dans le titre ou le corps.

## 9. Liste DO NOT

- Ne **pas** supprimer ou court-circuiter le disclaimer médical.
- Ne **pas** bypasser le paywall en code (pas de flag `__skipPaywall`,
  pas de query param magique).
- Ne **pas** committer `.env`, secrets, clés Stripe/Supabase/Brevo,
  tokens d'API. La pre-commit gitleaks bloque ; ne pas la désactiver.
- Ne **pas** ajouter un sous-traitant SaaS sans mise à jour de
  `specs/architecture.md` et de la politique de confidentialité.
- Ne **pas** mentionner « TDAH » dans les UI, emails, textes
  d'interprétation, copy marketing.
- Ne **pas** stocker de PII sans base légale documentée dans
  `specs/architecture.md`.
- Ne **pas** modifier l'historique git après push (rebase interactif sur
  branche partagée, force push sur main).
- Ne **pas** utiliser `--no-verify` pour skipper lefthook ou
  `--no-gpg-sign` pour bypasser une signature. Si un hook plante, fixer
  la cause, pas le hook.
- Ne **pas** ajouter une dépendance sans s'assurer qu'elle est
  edge-compatible (Cloudflare Workers runtime) si elle est utilisée
  côté serveur Astro.

## 10. Workflow opérationnel

1. Une demande arrive → identifier la spec impactée (ou en proposer une
   nouvelle via `/new-spec`)
2. Rédiger / mettre à jour la spec → demander validation produit
3. Implémenter en commits atomiques (un par section logique de la spec)
4. À chaque commit, `/before-commit` valide localement
5. Ouvrir la PR avec template rempli, vérifier CI verte
6. Une fois mergée, marquer la spec comme `livrée`

## 11. Pointeurs

- `README.md` : démarrage, stack, scoring
- `specs/` : source de vérité produit
- `specs/architecture.md` : état courant de l'archi (créé en spec 003)
- `src/lib/` : moteur de scoring + interprétation (pur, testable)
- `tests/` : mocks MSW + setup vitest
- `e2e/` : tests Playwright
- `.claude/skills/` : skills custom du projet

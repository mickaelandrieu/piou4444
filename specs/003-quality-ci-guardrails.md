# 003 — Qualité logicielle, CI/CD & garde-fous

- **Statut** : livré
- **Date** : 2026-05-18
- **Remplace** : aucune. Insérée *avant* l'ancienne 003 (auth + paiement), qui
  devient 004. Justification : aucun code monétisé ne doit être introduit
  avant que les fondations de qualité et de sécurité ne soient en place.
- **Périmètre** : outillage. Aucune feature produit nouvelle. Aucun changement
  de comportement perçu par l'utilisateur final.

---

## 1. Intention

Mettre en place les garde-fous qui empêchent **deux types de dérive** :

- **Drift technique** — régression silencieuse, dépendance vulnérable
  introduite, faille de configuration. Risque inacceptable une fois le code
  de paiement et la persistance des résultats utilisateurs en place (004 et
  suivantes).
- **Drift produit** — feature implémentée sans spec, spec contournée par un
  raccourci, principes non négociables (disclaimer médical, RGPD, conformité)
  effacés par inadvertance.

L'objectif de cette spec est de figer une **définition de prêt** mécaniquement
vérifiable, et d'instrumenter cette définition dans la CI, dans les hooks
git et dans la mémoire opérationnelle (CLAUDE.md, skills).

## 2. Définition opérationnelle de la qualité

On rejette explicitement « 100 % de lignes couvertes » comme métrique : c'est
une cible qui se gagne avec des tests bidons et qui ne dit rien du
comportement réel.

On adopte une définition **behavior-driven** :

> **Chaque comportement spécifié dans `specs/` doit avoir au moins un test
> qui échoue si ce comportement casse.**

Cette définition se décline par surface :

| Surface | Cible |
|---|---|
| Logique pure (`lib/scoring`, `lib/interpretation`, futures fonctions de calcul) | ≥ 95 % de couverture lignes via Vitest |
| Endpoints API (`/api/score/*`, futurs webhooks Stripe/Brevo) | 100 % des cas spécifiés : succès + chaque erreur référencée |
| Composants React purs | smoke test de rendu + interactions clés |
| Parcours utilisateur critiques (funnel complet) | E2E Playwright sur le golden path + 2-3 cas d'erreur explicites |
| Webhooks de tiers (Stripe, Brevo) | signature, idempotence, payload malformé, replay |

## 3. Stack de tests (décisions figées)

| Couche | Outil | Justification |
|---|---|---|
| Runner unit + integration | **Vitest** | Vite-native, parfaite intégration Astro, syntaxe Jest, rapide |
| DOM virtuel pour composants | **happy-dom** (via Vitest) | Plus léger que jsdom, suffisant pour nos cas |
| Tests composants React | **@testing-library/react** | Standard de fait, encourage les tests centrés utilisateur |
| Tests E2E | **Playwright** | Headless en CI gratuit, multi-browser, support iframe Stripe |
| Mocks HTTP (Stripe, Brevo, Supabase) | **MSW** (Mock Service Worker) | Intercepte au niveau réseau, mêmes mocks en unit/integration/E2E |
| Couverture | **Vitest coverage v8** | Inclus avec Vitest, sortie LCOV pour CI |

**Conventions** :
- Tests unitaires co-localisés avec le code : `src/lib/scoring.test.ts` à côté de `src/lib/scoring.ts`.
- Tests E2E centralisés : `e2e/*.spec.ts`.
- Mocks MSW dans `tests/mocks/`.
- Pas de tests d'intégration séparés ; ils sont fusionnés avec les tests unitaires de chaque endpoint (Vitest peut appeler les handlers Astro directement).

## 4. Sécurité (décisions figées)

| Outil | Rôle | Déclenchement |
|---|---|---|
| **OSV-Scanner** | Scan CVEs sur `package-lock.json` via la base OSV.dev | CI + pre-commit |
| **gitleaks** | Détection de secrets accidentellement commités | pre-commit (bloquant) + CI |
| **npm audit** | Baseline native, complément à OSV-Scanner | CI uniquement (non bloquant — purement informatif) |
| **eslint-plugin-security** | Patterns dangereux dans le code (regex catastrophiques, eval, etc.) | CI |

**Politique de seuils** :
- CVE *high* ou *critical* avec patch disponible → CI rouge (bloque le merge).
- CVE *medium* ou *low* → rapporté, non bloquant.
- Secret détecté → CI rouge **et** pre-commit rouge (bloque dès le commit local).
- Audit avec patch impossible (pas de fix amont) → ticket dédié, exemption documentée dans `.osv-scanner-ignore` avec justification + date de revue.

## 5. CI GitHub Actions

Un seul workflow, `.github/workflows/ci.yml`, déclenché sur **push** vers
n'importe quelle branche et sur **pull_request** vers `main`.

```yaml
jobs:
  quality:
    steps:
      - checkout
      - setup-node@v4 (Node 22 LTS)
      - cache: npm + ~/.cache/ms-playwright
      - npm ci
      - npm run typecheck           # astro check
      - npm run lint                # eslint
      - npm run test                # vitest run --coverage
      - npx playwright install --with-deps chromium
      - npm run test:e2e            # playwright test
      - osv-scanner --lockfile package-lock.json
      - gitleaks detect --no-banner
```

**Garanties** :
- Un job unique, séquentiel (les étapes sont rapides individuellement, < 3 min total).
- Cache npm + Playwright pour rester sous 1 min sur les builds suivants.
- Aucune dépendance à un service tiers (pas de SaaS de tests, tout tourne dans le runner GitHub).
- Free tier GitHub : 2 000 min/mois en privé, illimité en public. Une CI à ~3 min = ~660 runs/mois gratuits. Couverture confortable pour un projet solo.

**Cloudflare Pages garde son rôle de déploiement** (déclenché par push) — orthogonal à la CI. Si la CI passe, le déploiement CF s'effectue. Si la CI échoue, le déploiement CF s'effectue quand même (CF ne lit pas la CI) mais aucune merge vers `main` ne sera autorisée par les branch protection rules. À configurer : *« require status checks before merging »* = `quality`.

## 6. Pre-commit local — lefthook

`lefthook.yml` à la racine, exécuté automatiquement sur chaque `git commit`.

```yaml
pre-commit:
  parallel: true
  commands:
    typecheck:
      run: npm run typecheck
    lint:
      run: npx eslint --max-warnings 0 {staged_files}
      glob: "*.{ts,tsx,astro}"
    unit-tests:
      run: npm run test -- --run --changed
    secrets:
      run: gitleaks protect --staged
```

**Choix de lefthook plutôt que Husky** : plus rapide (exécution parallèle native), config plus simple, pas de scripts shell éparpillés, et préserve l'expérience git native (pas de hook géré par Node, pas de surcoût Node au boot).

Installation déclenchée automatiquement via `prepare` dans `package.json`
(`lefthook install`).

## 7. CLAUDE.md (anti-drift, racine du repo)

Document court, à la racine, lu à chaque tour par tout agent (Claude Code,
contributeurs humains). Doit tenir en une lecture rapide.

Contenu figé :

1. **Mission produit en une phrase** — auto-évaluation attentionnelle non médicale.
2. **Source de vérité** — `specs/` ; aucun code sans spec à jour ; toute évolution = nouvelle spec.
3. **Stack figée** — Astro 5 + îlots React + Tailwind v4 + Cloudflare Pages + Supabase + Stripe + Brevo. Tout changement passe par une spec.
4. **Règles produit non négociables** :
   - disclaimer médical permanent sur toutes les surfaces (UI, emails, exports)
   - aucune mention « TDAH » dans le code, les UI, les emails
   - RGPD : pas de stockage de PII non justifié par une base légale documentée
   - pas de double opt-in masqué, pas de dark pattern sur la capture email
5. **Définition de prêt** — typecheck + lint + tests unit + tests E2E + OSV-scan + gitleaks tous verts. Toute exception = ticket explicite, jamais silencieux.
6. **Conventions de tests** — la définition behavior-driven §2 de cette spec.
7. **Conventions de commit** — `type: sujet` (feat / fix / chore / docs / test / refactor / migrate / specs). Pas d'amendement de commits déjà poussés.
8. **Workflow** — branche par feature, PR vers main, CI verte requise, merge via squash.
9. **Liste « DO NOT »** :
   - ne pas supprimer ou court-circuiter le disclaimer
   - ne pas bypasser le paywall en code (pas de flag `__skipPaywall`)
   - ne pas committer `.env`, secrets, clés Stripe/Supabase
   - ne pas ajouter un sous-traitant SaaS sans mise à jour de `specs/architecture.md` et de la politique de confidentialité

## 8. Skills Claude Code custom

Trois skills minimales, placées dans `.claude/skills/`, invocables par
`/new-spec`, `/review-spec` et `/before-commit`.

| Skill | Rôle |
|---|---|
| `new-spec` | Scaffold une nouvelle spec depuis un template, incrémente le numéro, met à jour `specs/README.md` index |
| `review-spec` | Revue d'une spec contre la liste « DO NOT » et les principes de CLAUDE.md ; sortie : conforme / liste de points à corriger |
| `before-commit` | Exécute la check-list complète (typecheck, lint, test, E2E rapide, OSV-scan, gitleaks) et résume ce qui passe / ce qui bloque |

Pas de hooks Claude Code automatiques V1 (on s'appuie sur lefthook côté git
pour le déterminisme — les hooks Claude Code peuvent être ajoutés plus tard
si on identifie des automatismes spécifiques à l'usage agent).

## 9. `specs/architecture.md` — document vivant

Créé dans cette spec, mis à jour à chaque spec qui touche l'infra. Contient :
- schéma Mermaid de la stack courante (Astro + CF Pages + Supabase + Stripe + Brevo, à compléter à mesure)
- matrice RGPD des sous-traitants (nom, données traitées, base légale, localisation, DPA signée)
- table des secrets et variables d'environnement (sans valeurs, juste les clés)

Pas une spec numérotée — c'est un document d'état courant, append/mise à jour.

## 10. Tests rétroactifs sur 001

Avant de fermer 003, on couvre la base de code existante. Cela force le
harnais à être *réel* dès le départ.

- `src/lib/scoring.test.ts` — tous les seuils, frontières, tous les niveaux (faible/modéré/élevé), screener + complet + dimensions + contextuel
- `src/lib/interpretation.test.ts` — chaque combinaison `level × dimension`, recommandations selon niveau, bullets
- `src/pages/api/score/screener.test.ts` — succès, payload manquant, payload malformé, valeurs hors borne
- `src/pages/api/score/full.test.ts` — idem
- `e2e/funnel.spec.ts` — parcours intro → screener bas signal → arrêt, parcours intro → screener haut → complet → résultat, navigation back, recommencer
- `e2e/disclaimer.spec.ts` — vérifie présence du disclaimer sur chaque étape

Cible : ~25-30 tests, ~2-3 h d'écriture.

## 11. Critères d'acceptation

La spec 003 est considérée livrée quand :

- [ ] `npm run test` passe avec >95 % de couverture sur `src/lib/`
- [ ] `npm run test:e2e` passe sur le funnel 001 complet
- [ ] `npm run typecheck`, `npm run lint` verts
- [ ] OSV-Scanner et gitleaks intégrés en CI et en pre-commit, exécutions vertes sur `main`
- [ ] `.github/workflows/ci.yml` opérationnel, status check `quality` requis pour merger
- [ ] Branch protection sur `main` configurée (à faire manuellement dans le dashboard GitHub, hors code)
- [ ] `lefthook.yml` actif, hook pre-commit testé
- [ ] `CLAUDE.md` rédigé et placé à la racine
- [ ] 3 skills `.claude/skills/{new-spec,review-spec,before-commit}` créées et testées
- [ ] `specs/architecture.md` créé avec schéma Mermaid V1 et matrice RGPD V1
- [ ] README à jour : section *« Qualité & CI »* ajoutée

## 12. Hors périmètre

- Tests de charge / performance — V2+
- Audit RGPD externe — quand le volume justifie
- Tests d'accessibilité automatisés (axe-core en E2E) — bonne idée mais reportée à une spec dédiée si on identifie un besoin réel
- SAST avancé (Semgrep, CodeQL) — `eslint-plugin-security` suffit V1
- Monitoring runtime (Sentry, Logflare) — viendra avec 004 et l'introduction du paiement

## 13. Risques

| Risque | Impact | Mitigation |
|---|---|---|
| CI lente, devient un irritant | Le dev contourne ou désactive | Cache agressif npm + Playwright, viser < 3 min total |
| Pre-commit lefthook trop strict, dev frustré | Skip via `--no-verify` | Pas de skip systématique : si le hook plante, fix la cause, pas le hook. Inscrit dans CLAUDE.md |
| Faux positif OSV-Scanner bloque les déploiements | Bug bloquant | `.osv-scanner-ignore` documenté, exception nominative + date de revue ≤ 30 j |
| Skills custom Claude Code obsolètes / mal utilisées | Drift quand même | Documentées dans CLAUDE.md, revue à chaque spec qui les utilise |
| Couverture utilisée comme métrique de vanité | Tests bidons | La définition behavior-driven est dans CLAUDE.md, code review attentive |

# Attention & Fonctionnement Cognitif — Screener

Outil web d'auto-évaluation attentionnelle basé sur l'**ASRS v1.1** (OMS).
**Non médical, non diagnostique.**

> Source de vérité produit : voir [`specs/`](./specs). Chaque évolution
> significative du produit est tracée sous forme d'une nouvelle spec numérotée.

## Vision produit

Funnel en 2 étages :

1. **Screening rapide** — 6 questions (ASRS v1.1, Partie A)
2. **Questionnaire complet** — 12 questions ASRS supplémentaires + 5 questions
   de contexte (impact travail / quotidien / temps / oubli / stress)
3. **Lecture structurée** — score global + sous-scores par dimension
   (attention / organisation / impulsivité) + impact fonctionnel + recommandations
   non médicales

Le produit ne vend pas un test : il vend une lecture compréhensible d'un
screening validé scientifiquement.

## Architecture

- **Frontend** : Astro 5 + îlots React 18 + TypeScript + Tailwind CSS v4
- **Hébergement cible** : Cloudflare Pages (adapter `@astrojs/cloudflare`)
- **Backend** : endpoints API Astro (server-rendered), moteur de scoring
  déterministe pur
- **Stockage** : aucun pour 001 (état client uniquement, anonymisation totale).
  Persistance introduite dans une spec ultérieure.

```
src/
  pages/
    index.astro                 page statique + îlot React de flow
    api/
      score/screener.ts         POST { answers } → ScreenerResult
      score/full.ts             POST { asrsAnswers, contextualAnswers } → FullResult
  layouts/
    Layout.astro                wrapper + disclaimer permanent
  components/
    ScreeningFlow.tsx           îlot React : intro → screener → result → full → contextual → result
    Disclaimer.tsx, ProgressBar.tsx, QuestionCard.tsx, ResultView.tsx
  lib/
    questions.ts                ASRS 18 items + 5 questions contextuelles
    scoring.ts                  moteur de scoring (screener + complet + dimensions)
    interpretation.ts           textes pédagogiques + recommandations par niveau
  styles/
    global.css                  Tailwind v4 + thème (couleurs brand/signal)
astro.config.mjs                adapter Cloudflare + intégration React + plugin Tailwind
```

## Logique de scoring

Échelle ASRS — 0 (Jamais) à 4 (Très souvent).

**Screener (6 items)**
- 0–6 : signal faible
- 7–12 : signal modéré
- 13+ : signal élevé

**Complet (18 items)** — score global normalisé sur le max (72) :
- < 30 % : faible
- 30–55 % : modéré
- ≥ 55 % : élevé

Mêmes seuils ratio appliqués aux sous-dimensions et au score contextuel.

**Mapping ASRS → dimensions**
- Attention : items 7, 8, 9, 10, 11
- Organisation / exécution : items 1, 2, 3, 4
- Impulsivité / agitation : items 5, 6, 12, 13, 14, 15, 16, 17, 18

## Conformité

- Disclaimer permanent (header + footer + entre chaque étape) : *outil non médical,
  basé sur l'ASRS v1.1, ne constitue pas un diagnostic*.
- Aucune mention « TDAH confirmé ».
- Lorsque le signal est élevé : suggestion explicite de consulter un
  professionnel + rappel « ce résultat ne constitue pas un diagnostic ».

## Démarrage

```bash
npm install
npm run dev
```

Application disponible sur http://localhost:4321.

Build production :

```bash
npm run build
```

Sortie dans `dist/`, déployable sur Cloudflare Pages (auto-détection
build command `npm run build`, output directory `dist`).

## Évolutions possibles (V2+)

- Comparaison populationnelle anonymisée
- Export PDF du profil
- Suivi longitudinal
- Recommandations personnalisées avancées
- Version B2B (coaching / RH / accompagnement)

## Faire évoluer le produit

Toute évolution produit passe par une nouvelle entrée dans [`specs/`](./specs)
(convention détaillée dans `specs/README.md`). On n'écrase pas l'historique :
chaque spec cite et précise ce qu'elle remplace.

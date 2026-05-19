# Specs

Source de vérité produit. Chaque évolution significative du produit (nouvelle
feature, changement de scope, V2…) est tracée ici sous forme d'un document
numéroté et daté.

## Convention

- Un fichier par évolution, préfixé d'un numéro à 3 chiffres :
  `NNN-titre-court.md`.
- Le numéro est incrémenté, **on ne ré-écrit pas l'historique** : si une spec
  remplace ou raffine une spec antérieure, elle la cite et explique le delta.
- Chaque spec contient un en-tête minimal :
  - `Statut` : `proposé` | `validé` | `livré` | `obsolète`
  - `Date` : date d'introduction (YYYY-MM-DD)
  - `Remplace` (optionnel) : référence(s) à la/aux spec(s) antérieure(s)
- La description du produit reste rédigée pour être lue par un humain
  (PM / dev / nouvel arrivant), pas par un outil.

## Index

| # | Titre | Statut | Date |
|---|---|---|---|
| 001 | Vision produit initiale — Attention & Fonctionnement Cognitif Screener | livré (MVP) | 2026-05-18 |
| 002 | Modèle économique & funnel de conversion | proposé | 2026-05-18 |
| 003 | Qualité logicielle, CI/CD & garde-fous | livré | 2026-05-18 |

## Documents transverses (non numérotés)

- `architecture.md` : document vivant sur l'état courant et la trajectoire
  technique. Mis à jour à chaque spec qui touche l'infra.

## Liens utiles

- README racine : démarrage, stack, scoring
- `src/lib/questions.ts` : items ASRS v1.1 + questions contextuelles
- `src/lib/scoring.ts` : seuils et logique de scoring
- `src/lib/interpretation.ts` : textes pédagogiques et recommandations

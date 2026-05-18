# 001 — Vision produit initiale

- **Statut** : livré (MVP)
- **Date** : 2026-05-18
- **Périmètre** : fondations du produit — funnel ASRS 6 → ASRS 18 → interprétation
  contextualisée → recommandations non médicales.

---

## 1. Vision produit

Créer un outil web permettant à un utilisateur de :

- réaliser un screening attentionnel rapide (6 questions)
- puis, si pertinent, compléter le questionnaire complet ASRS v1.1 (18 questions)
- obtenir une interprétation claire, pédagogique et non médicale de son
  fonctionnement attentionnel

Le produit s'appuie sur l'ASRS v1.1 comme base scientifique de screening, mais
ajoute une couche de compréhension et de contextualisation absente des outils
bruts.

## 2. Positionnement (critique)

**Le produit n'est pas :**
- un diagnostic médical
- un test clinique équivalent à un entretien psychiatrique
- une alternative à une évaluation professionnelle

**Le produit est :**
- un outil d'auto-évaluation comportementale
- un outil de screening et d'orientation
- un outil de compréhension du fonctionnement cognitif

## 3. Parcours utilisateur (funnel en 2 étages)

### Étape 1 — Screener gratuit (ASRS 6 items)

**Objectif :**
- détecter un signal faible / modéré / élevé
- engager l'utilisateur sans friction

**Contenu :**
- 6 questions issues du ASRS v1.1 (version officielle screener)
- échelle de réponse :
  - Jamais (0)
  - Rarement (1)
  - Parfois (2)
  - Souvent (3)
  - Très souvent (4)

**Output :**
- score de screening
- classification :
  - faible probabilité
  - signal modéré
  - signal élevé

**CTA conditionnel :** si modéré ou élevé → proposer passage au test complet.

### Étape 2 — Questionnaire complet (ASRS v1.1 – 18 items)

**Objectif :**
- affiner le profil attentionnel
- mesurer la fréquence et la consistance des symptômes

**Contenu :**
- 18 questions ASRS v1.1 complètes
- même échelle de réponse (0 à 4)

**Output :**
- score global
- sous-scores par dimension fonctionnelle :
  - attention
  - organisation / exécution
  - impulsivité / agitation

### Étape 3 — Enrichissement contextuel (différenciation produit)

Ajout de questions non cliniques pour contextualiser les scores :
- impact au travail / études
- impact vie quotidienne
- organisation et gestion du temps
- oubli / désorganisation
- stress associé aux difficultés

Objectif : traduire le score en impact fonctionnel réel.

### Étape 4 — Résultat utilisateur (valeur produit principale)

**1. Résumé global**

Ex : *« Votre profil indique des difficultés attentionnelles significatives avec
un impact modéré à élevé sur votre organisation quotidienne. »*

**2. Lecture structurée (axes)**
- Attention : faible / modéré / élevé
- Organisation / exécution : faible / modéré / élevé
- Impulsivité / agitation : faible / modéré / élevé
- Impact fonctionnel global : faible / modéré / élevé

**3. Interprétation pédagogique**

Explication en langage simple :
- difficultés de maintien attentionnel
- surcharge cognitive possible
- fragmentation de l'attention
- difficulté de priorisation

Toujours sans terminologie médicale diagnostique.

**4. Recommandations**

Selon score :
- **Faible** : conseils généraux d'organisation
- **Modéré** : stratégies comportementales, outils de gestion du temps
- **Élevé** : suggestion de consultation professionnelle, mention explicite
  *« ce résultat ne constitue pas un diagnostic »*

## 4. Règles de conformité & sécurité

- interdiction de présenter un diagnostic
- interdiction de mentionner « TDAH confirmé »
- interdiction de se substituer à un professionnel de santé
- disclaimer visible en permanence :
  *« outil d'auto-évaluation basé sur l'ASRS v1.1, non médical »*

## 5. Logique de scoring (MVP)

**Score par question :**
- Jamais = 0
- Rarement = 1
- Parfois = 2
- Souvent = 3
- Très souvent = 4

**ASRS 6 items :**
- 0–6 : faible signal
- 7–12 : signal modéré
- 13+ : signal élevé

**ASRS 18 items :**
- score global + normalisation (max = 72)
- segmentation par dimensions fonctionnelles (heuristique simple MVP)
  - attention : items 7, 8, 9, 10, 11
  - organisation / exécution : items 1, 2, 3, 4
  - impulsivité / agitation : items 5, 6, 12, 13, 14, 15, 16, 17, 18
- seuils par ratio : < 30 % faible, 30–55 % modéré, ≥ 55 % élevé

## 6. Architecture technique (MVP)

**Frontend :**
- React / Next.js
- questionnaire step-by-step (1 question par écran recommandé)

**Backend :**
- API simple (Next.js API routes)
- moteur de scoring déterministe

**Stockage :**
- aucun pour le MVP (état client)
- anonymisation totale

## 7. Différenciation produit

Ce produit ne vend pas un test.
Il vend une lecture **structurée et compréhensible** d'un screening validé
scientifiquement.

## 8. Évolutions possibles (V2+)

- comparaison populationnelle anonymisée
- export PDF du profil
- suivi longitudinal (évolution dans le temps)
- recommandations personnalisées avancées
- version B2B (coaching / accompagnement / RH)

## 9. Critères de succès MVP

- taux de complétion > 60 %
- conversion screener → test complet > 20–40 %
- compréhension du résultat (feedback utilisateur positif)
- action post-test (consultation / lecture / auto-amélioration)

## 10. Résumé exécutif

**Produit =** funnel ASRS 6 → ASRS 18 → interprétation contextualisée →
recommandations non médicales.

**Objectif =** transformer un outil de screening clinique brut en expérience de
compréhension cognitive exploitable par le grand public.

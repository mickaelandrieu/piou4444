# 002 — Modèle économique & funnel de conversion

- **Statut** : proposé
- **Date** : 2026-05-18
- **Remplace** : aucune spec antérieure ; raffine 001 en ajoutant la couche
  monétisation et capture utilisateur sans toucher au moteur d'évaluation.
- **Périmètre** : décisions produit/business uniquement. Ne traite pas
  l'authentification ni la persistance du profil (→ spec 003), ni le dashboard
  utilisateur (→ spec 004).

---

## 1. Contexte & décisions cadrantes

L'expérience MVP (spec 001) est entièrement gratuite, anonyme, sans capture.
Cette spec introduit la monétisation tout en préservant la promesse produit :
une lecture pédagogique d'un screening validé scientifiquement.

Trois décisions structurantes ont été arrêtées en amont :

| Décision | Choix retenu | Implication forte |
|---|---|---|
| Modèle de prix | **Paiement à l'unité** (one-shot), pas d'abonnement | Pas de récurrent à gérer V1 ; re-monétisation = re-test |
| Capture email | **Progressive**, pendant le funnel, avant le test complet | Compromis conversion / captation (cf. §3) |
| Durée d'accès aux résultats | **Limitée à 12 mois** post-achat | Re-test annuel naturel, justifié par la pertinence clinique |
| Tease pré-paywall | **Niveau global seul** (faible / modéré / élevé) | Transparence ; pas d'axes pré-payés visibles |

Les choix « captation email immédiate » et « accès limité » ont été pesés. La
veille montre qu'une capture *à l'atterrissage* tue la conversion d'entrée
(−40 à −60 % vs capture progressive). On garde donc l'intention (élargir la
base de contacts pour la nurture marketing) mais on déplace le moment de
capture juste après le screener gratuit — l'utilisateur a déjà investi 6
questions et veut son résultat.

## 2. Objectifs de cette spec

- définir le **funnel monétisé** (étapes, moments de friction, événements
  trackés)
- fixer **le prix, la durée d'accès, la TVA et la politique de remboursement**
- choisir la **stack paiement et emailing** (build / buy)
- spécifier les **workflows email** (transactionnel + relance marketing)
- énoncer les **métriques de succès** et l'instrumentation associée

## 3. Funnel détaillé

### 3.1 Vue d'ensemble

```
Landing
  └─ Screener gratuit (6 questions, anonyme)          ← spec 001
       ├─ Score faible → message d'auto-évaluation positive (pas d'upsell)
       └─ Score modéré / élevé
            └─ Mur de capture email (« recevez votre lecture détaillée »)
                 └─ Test complet (18 + contextuelles)  ← spec 001
                      └─ Tease résultat (niveau global seul)
                           └─ Paywall (CTA achat)
                                └─ Stripe Checkout
                                     └─ Résultat complet débloqué (12 mois)
```

### 3.2 Étape par étape

**Étape A — Landing**
- Pas de capture, pas de friction. Promesse claire, CTA unique :
  *« Commencer le screening (6 questions, gratuit)»*.
- Évent : `landing_view`.

**Étape B — Screener 6 items (gratuit, anonyme)**
- Comportement identique à 001. Aucun changement.
- Évent : `screener_started`, `screener_completed { score, signal }`.

**Étape C — Mur email** (déclenché si signal ≥ modéré, sinon écran de
fin classique)
- Copy : *« Votre profil mérite une lecture détaillée. Entrez votre email
  pour continuer — vous recevrez aussi votre résultat par mail. »*
- 1 seul champ (email), case RGPD pré-décochée pour la newsletter, double
  opt-in **désactivé** sur ce flow (la suite du parcours sert de confirmation
  implicite ; double opt-in réservé à l'inscription newsletter pure).
- Évent : `email_captured { source: "screener_wall" }`.
- Échap : lien discret *« continuer sans email »* qui laisse passer sans
  capture (anti-friction légale + UX). Évent : `email_capture_skipped`.

**Étape D — Test complet 18 items + contextuelles**
- Inchangé vs 001.
- Évent : `full_test_started`, `full_test_completed`.

**Étape E — Tease résultat**
- Affiche : niveau global (1 mot) + 1 phrase pédagogique non clinique.
- Le détail par axes, l'interprétation et les recommandations sont floutés.
- CTA primaire : *« Débloquer ma lecture complète — 12,90 € »*.
- CTA secondaire : *« Recevoir un rappel par email »* (envoie l'email D+1 si
  pas d'achat ; cf §6.2 workflow Abandon).
- Évent : `paywall_view`.

**Étape F — Stripe Checkout**
- Stripe Checkout hébergé (pas custom V1). Stripe Tax activé.
- Pas de création de compte demandée à cette étape — l'email Stripe sert
  d'identifiant. Compte créé automatiquement après paiement (cf. spec 003).
- Évent : `checkout_started`, `checkout_completed { amount, currency }`,
  `checkout_abandoned`.

**Étape G — Résultat complet + envoi email**
- Page de résultat complète accessible immédiatement après paiement (redirect
  Stripe → page protégée par token signé court-terme, puis session après
  création de compte automatique).
- Email transactionnel : reçu + lien permanent vers le résultat (valide 12
  mois).
- Évent : `result_unlocked`.

## 4. Modèle économique

| Paramètre | Valeur V1 | Justification |
|---|---|---|
| Prix | **12,90 € TTC** | Anchor entre gratuit et 49 €+ des évaluations en ligne complètes ; psychologiquement accessible, suffisamment au-dessus du seuil de gratuité perçue |
| Devise | EUR uniquement V1 | Marché cible FR-first, simplifie la TVA |
| TVA | **Stripe Tax activé**, prix TTC affiché | Conformité UE automatique, OSS géré par Stripe |
| Durée d'accès | **12 mois** à compter de la date de paiement | Pertinence clinique du re-test annuel ; copy : *« vos résultats restent accessibles 12 mois »*, pas *« accès limité »* |
| Remboursement | Exception légale produit numérique : pas de rétractation dès que le **test complet est démarré** (clairement acceptée case obligatoire avant Stripe). Remboursement plein avant. | Conformité DGCCRF / Art. L221-28 13° du Code de la consommation |
| Garantie qualité | Remboursement discrétionnaire 14 j en cas d'insatisfaction documentée (canal support unique) | Confiance ; coût absorbable au volume V1 |
| Re-test | Achat séparé à plein tarif après expiration (V1). Pas de promo loyauté V1. | À revoir V2 selon volume |

## 5. Stack paiement & email

### 5.1 Paiement — Stripe (décision figée)

- **Stripe Checkout** hébergé V1 (pas custom). Migration vers Payment Element
  possible V2 si besoin de skin custom.
- **Stripe Tax** activé.
- **Stripe Customer** créé à partir de l'email capturé en §3.2-C → réutilisé
  pour le matching de session post-paiement.
- **Webhook** unique côté app : `checkout.session.completed` →
  - crée le compte utilisateur (cf. spec 003),
  - écrit l'`access_expires_at = now + 12 mois`,
  - déclenche l'email transactionnel de reçu + résultat.
- **Idempotency** : on stocke `stripe_session_id` unique en DB ; le webhook
  est idempotent.

### 5.2 Emailing — recommandation : Brevo

**Recommandation : Brevo (ex-Sendinblue)**, un seul outil pour transactionnel
+ marketing.

| Critère | Brevo | Resend + Loops (alternative) |
|---|---|---|
| RGPD / hébergement UE | ✅ natif (FR) | Resend US ; Loops US |
| Transactionnel | ✅ inclus | Resend (très bon DX) |
| Marketing / automation visuelle | ✅ inclus (plan Business) | Loops |
| Free tier viable MVP | 300 emails/j, contacts illimités | Resend 3k/mois, Loops 1k contacts |
| Coût à l'échelle visée V1 (≤ 5k contacts) | ~0–25 €/mois | ~0–60 €/mois (2 outils) |
| Nombre de SDK à intégrer | 1 | 2 |

→ **Décision : Brevo seul V1.** Si la deliverability transactionnelle se
révèle insuffisante au monitoring (taux d'arrivée < 98 %), basculer le
transactionnel sur Resend (séparation marketing / transactionnel = best
practice deliverability) — c'est un swap localisé, pas un re-design.

### 5.3 Workflows email (configurés dans Brevo, déclenchés par webhook app)

Tous les emails sont en français, single-column, < 200 mots, 1 CTA unique,
mentions légales + lien de désinscription en pied.

| ID | Trigger | Délai | Objet | Contenu | Audience |
|---|---|---|---|---|---|
| `T-01` | `checkout.session.completed` | immédiat | Votre lecture est prête | Reçu + lien vers résultat complet (signé, 12 mois) | Acheteurs |
| `T-02` | Réinitialisation mot de passe (spec 003) | immédiat | Réinitialiser votre accès | Lien sécurisé 1 h | Comptes |
| `M-01 Welcome` | `email_captured` (étape C) | immédiat | Votre résultat de screening | Résultat screener + invitation à compléter le test | Captés gratuits |
| `M-02 Abandon screener→complet` | `email_captured` ∧ pas de `full_test_started` à J+1 | J+1 | Vous étiez à mi-chemin | Rappel + bénéfice pédagogique, pas de promo | Captés non engagés |
| `M-03 Abandon paywall` | `paywall_view` ∧ pas de `checkout_completed` à H+1, J+1, J+3 | H+1 / J+1 / J+3 | (3 emails) | E1 = rappel ; E2 = social proof + FAQ ; E3 = réassurance (remboursement, conformité), **pas de discount** | Vue paywall sans achat |
| `M-04 Pré-expiration accès` | `access_expires_at − 14 j` | J−14 puis J−1 | Vos résultats expirent bientôt | Invitation à re-tester (re-évaluation longitudinale) | Acheteurs |
| `M-05 Newsletter` (opt-in explicite) | manuel / cadence mensuelle | — | Variable | Contenu pédagogique TDAH / attention | Opt-in newsletter uniquement |

Règles transverses :
- **Pas de discount dans M-03**. La veille montre que l'introduction
  d'un discount précoce dégrade le LTV et entraîne l'attente.
- **Désinscription** : un clic, audit log conservé 3 ans.
- **Suppression sur demande** : workflow RGPD documenté dans spec 003.

## 6. Conformité & garde-fous

- **CGV** dédiées à publier avant lancement : produit numérique, exception
  rétractation, durée d'accès, support, remboursement discrétionnaire.
- **Mentions légales** + **politique de confidentialité** mises à jour pour
  inclure : Stripe (sous-traitant paiement), Brevo (sous-traitant emailing),
  base légale = exécution du contrat + intérêt légitime (relance achat) +
  consentement (newsletter).
- **Cookies** : bandeau conforme CNIL ; analytics consenti uniquement (cf.
  §7).
- **Disclaimer médical 001 préservé partout**, y compris dans les emails.

## 7. Métriques & instrumentation

### 7.1 Funnel cible V1 (hypothèses de référence, à valider)

Pour 1 000 visiteurs landing :

| Étape | Taux attendu | Volume |
|---|---|---|
| `landing_view` → `screener_started` | 60 % | 600 |
| `screener_started` → `screener_completed` | 85 % | 510 |
| `screener_completed` ∧ signal ≥ modéré | 65 % | ~330 |
| Mur email → `email_captured` | 55 % | ~180 |
| `email_captured` → `full_test_completed` | 60 % | ~108 |
| `paywall_view` → `checkout_completed` | 20–25 % | ~22–27 |
| Récup abandon paywall via M-03 (+ relatif) | +15 % | ~3–4 |
| **Conversion globale visiteur → acheteur** | **~2,5–3,1 %** | 25–31 / 1 000 |

### 7.2 Instrumentation

- **Analytics produit** : PostHog (auto-hébergé UE) ou Plausible (FR) — choix
  arrêté en spec 004 ; pour V1, événements listés §3.2 envoyés côté serveur
  uniquement (pas dépendant du consentement cookie côté client).
- **Tableau de bord opérationnel** : sortie quotidienne par mail des KPIs
  funnel.
- **Attribution** : `utm_*` capturé au landing, stocké sur le User à la
  capture email, ré-écrit au paiement (last-touch non-direct).

## 8. Risques

| Risque | Impact | Mitigation |
|---|---|---|
| Conversion paywall < 10 % | Modèle non viable | A/B copy CTA + tease ; descendre prix à 9,90 € avant de couper la feature |
| Deliverability Brevo dégradée sur transactionnel | Acheteurs ne reçoivent pas leur résultat | Monitoring taux d'arrivée hebdo ; swap vers Resend si < 98 % |
| Plainte CNIL sur capture email progressive | Risque légal | Texte de mention claire au champ + opt-in newsletter séparé non pré-coché |
| Confusion entre lien magique 12 mois et compte utilisateur | Support saturé | Création de compte auto post-paiement avec mot de passe envoyé (cf. spec 003) |
| Re-vente du lien signé (résultats partagés) | Perte revenu marginale | Token lié au User + IP fingerprint soft ; tolérance V1 |

## 9. Hors périmètre (renvoyé à des specs ultérieures)

- Authentification & gestion de compte → **spec 003**
- Dashboard utilisateur, historique, export PDF → **spec 004**
- Abonnement / pass familial / B2B → V2+
- Multi-devises, marchés non-FR → V2+

## 10. Critères d'acceptation

La spec 002 est considérée livrée quand :

- [ ] page de checkout en production avec Stripe Tax et CGV liées
- [ ] webhook `checkout.session.completed` idempotent et testé
- [ ] mur de capture email opérationnel avec opt-in newsletter séparé
- [ ] workflows `T-01`, `M-01`, `M-02`, `M-03` (3 emails), `M-04` configurés
      dans Brevo et déclenchés par événements applicatifs
- [ ] événements §3.2 émis et visibles dans l'outil analytics
- [ ] disclaimer médical présent sur toutes les surfaces (landing, paywall,
      emails)
- [ ] politique de confidentialité et CGV publiées

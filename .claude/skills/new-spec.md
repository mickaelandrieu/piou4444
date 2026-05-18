---
description: Scaffold a new product spec with incremented numbering and update the specs index
---

# /new-spec

Crée une nouvelle spec dans `specs/` :

1. Lister `specs/` pour trouver le dernier numéro de spec (regex `^(\d{3})-`).
2. Incrémenter de 1 (zero-padding sur 3 chiffres).
3. Demander à l'utilisateur (si non fourni en argument) :
   - le titre court (sera slugifié pour le nom de fichier)
   - le titre complet (apparaît dans le H1 du document)
   - le périmètre en 1 phrase
4. Créer le fichier `specs/NNN-titre-court.md` avec ce squelette :

```markdown
# NNN — Titre complet

- **Statut** : proposé
- **Date** : <YYYY-MM-DD du jour>
- **Remplace** : (optionnel)
- **Périmètre** : <phrase de périmètre>

---

## 1. Contexte & intention

...

## 2. Décisions arrêtées

...

## 3. Implémentation

...

## 4. Risques

...

## 5. Critères d'acceptation

- [ ] ...

## 6. Hors périmètre

...
```

5. Mettre à jour `specs/README.md` en ajoutant une ligne dans le tableau d'index.

6. Rappeler à l'utilisateur : la spec démarre en `proposé`. Pas
   d'implémentation avant son passage à `validé`.

Ne crée jamais une spec avec un numéro déjà utilisé. Ne modifie jamais une
spec en statut `livré` (créer une nouvelle spec qui la remplace via le champ
`Remplace`).

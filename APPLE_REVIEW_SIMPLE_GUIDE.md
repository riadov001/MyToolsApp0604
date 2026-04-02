# MyToolsApp — Guide de Test Apple Review
*Simple · Rapide · Complet*

---

## COMPTE DE TEST (à copier dans App Store Connect)

| | |
|--|--|
| **Email** | `review@testapp.com` |
| **Mot de passe** | `Test123456` |
| **Rôle** | Administrateur — accès complet |
| **Garage de test** | Garage MyTools Demo (SIRET: 12345678901234) |

> **Note pour le reviewer** : MyToolsApp est une application B2B strictement réservée aux administrateurs des garages partenaires du réseau MyTools (France). L'accès est validé via le SIRET ou la raison sociale de l'établissement.

---

## ÉTAPE 1 — Premier lancement

1. **Ouvrir l'app** → Écran de consentement RGPD s'affiche
2. Cocher les **3 cases obligatoires** (Confidentialité · Cookies · Données professionnelles)
3. Cocher optionnellement : Notifications · Emails · Agenda
4. Appuyer sur **"Accepter et continuer"**

---

## ÉTAPE 2 — Authentification Firebase

### 2a. Connexion Email (compte de démo)
1. Saisir `review@testapp.com` / `Test123456`
2. Appuyer sur **"Se connecter"**
3. ✅ Tableau de bord Admin s'affiche

### 2b. Connexion Google
1. Appuyer sur **"Continuer avec Google"**
2. Sélectionner un compte Google
3. ✅ Connexion via Firebase → tableau de bord
4. Si compte inexistant → formulaire d'inscription garage (SIRET requis)

### 2c. Sign in with Apple *(iOS uniquement)*
1. Appuyer sur **"Continuer avec Apple"**
2. Valider avec Face ID ou mot de passe Apple
3. ✅ Connexion via Firebase → tableau de bord
4. Si compte inexistant → formulaire d'inscription garage (SIRET requis)

### 2d. Face ID
1. Se connecter une première fois avec email
2. Profil → Sécurité → Activer Face ID → Autoriser
3. Se déconnecter → bouton Face ID apparaît
4. ✅ Connexion en 1 tap avec Face ID

---

## ÉTAPE 3 — Inscription Garage (SIRET / Raison Sociale)

*Accès : écran de connexion → "Créer un compte"*

**Étape 1 — Recherche entreprise**
- Saisir un SIRET (14 chiffres) → vérification automatique via API INSEE
- **OU** saisir la raison sociale → bouton Rechercher
- ✅ Fiche entreprise s'affiche (nom, adresse, SIRET, TVA, forme juridique)
- Appuyer **"C'est mon entreprise"**

**Étape 2 — Informations personnelles**
- Nom du garage · Prénom · Nom · Email · Mot de passe
- ✅ Via Google : email et nom pré-remplis, pas de mot de passe requis
- Accepter les CGU → **"Créer mon compte"**

**Étape 3 — Confirmation**
- ✅ Email de validation envoyé (flux standard)
- ✅ Connexion directe (flux Google/Apple)

---

## ÉTAPE 4 — CRUD Devis

| Action | Chemin |
|--------|--------|
| Voir la liste | Onglet **Devis** |
| Créer un devis | Devis → **+** → formulaire client + services + photos |
| Voir le détail | Devis → sélectionner un devis |
| Modifier le statut | Détail → changer le statut (En attente / Accepté / Refusé) |
| Supprimer | Détail → icône corbeille → confirmation |

**Photos** : au moins 1 photo obligatoire (caméra ou galerie) → permission iOS demandée

---

## ÉTAPE 5 — CRUD Factures

| Action | Chemin |
|--------|--------|
| Voir la liste | Onglet **Factures** |
| Créer une facture | Factures → **+** → lignes de services → totaux automatiques |
| Télécharger PDF | Détail → bouton **"Voir le PDF"** → visionneuse |
| Modifier le statut | Détail → changer le statut |
| Supprimer | Détail → corbeille → confirmation |

---

## ÉTAPE 6 — CRUD Réservations

| Action | Chemin |
|--------|--------|
| Voir la liste | Onglet **Réservations** |
| Créer | Réservations → **+** → sélectionner client + date + service |
| Confirmer | Détail → **"Confirmer"** |
| Annuler | Détail → **"Annuler"** |
| Ajouter au calendrier iOS | Détail → **"Ajouter au calendrier"** → autoriser → ✅ dans l'app Calendrier |

---

## ÉTAPE 7 — CRUD Services

| Action | Chemin |
|--------|--------|
| Voir la liste | Menu → **Services** |
| Créer un service | Services → **+** → nom, description, prix, durée |
| Modifier | Services → sélectionner → modifier → Enregistrer |
| Supprimer | Services → swipe ou corbeille → confirmation |

---

## ÉTAPE 8 — OCR / DCAN (Analyse IA)

*Accès : création de devis → section "Analyse véhicule" ou icône scan*

1. Appuyer sur **"Scanner le DCAN"** (Document Certificat d'Immatriculation)
2. Prendre une photo de la carte grise / document véhicule
3. ✅ Gemini AI analyse l'image → immatriculation, marque, modèle extraits automatiquement
4. Champs pré-remplis dans le formulaire de devis
5. Corriger si nécessaire → continuer

**En cas d'image illisible** → message d'erreur clair, pas de crash

---

## ÉTAPE 9 — Profil & Sécurité

| Fonction | Chemin |
|----------|--------|
| Voir le profil | Onglet **Profil** |
| Modifier les infos | Profil → Modifier |
| Changer mot de passe | Profil → Sécurité → Changer mot de passe |
| Activer Face ID | Profil → Sécurité → Connexion biométrique |
| Gérer notifications | Profil → Notifications |
| Politique de confidentialité | Profil → Confidentialité |
| Mentions légales | Profil → Mentions légales |
| **Supprimer le compte** | Profil → Zone critique → Supprimer mon compte |

### Suppression de compte (obligatoire Apple depuis 2022)
1. Profil → Zone critique → **Supprimer mon compte**
2. Liste des données supprimées s'affiche
3. Cocher la case RGPD de confirmation
4. ✅ Compte supprimé + déconnexion automatique
> ⚠️ Ne pas confirmer avec le compte demo Apple

---

## ÉTAPE 10 — Tests Réseau

| Scénario | Résultat attendu |
|----------|-----------------|
| Mode avion au lancement | Message d'erreur clair, pas de crash |
| Perte réseau pendant requête | Timeout 15s → message → retry possible |
| API principale indisponible | Bascule automatique sur serveur de secours |

---

## RÉSUMÉ DES PERMISSIONS DEMANDÉES

| Permission | Quand | Optionnel |
|------------|-------|-----------|
| Appareil photo | Création de devis / Scan DCAN | Non |
| Bibliothèque photos | Création de devis | Non |
| Face ID | Activation dans Profil → Sécurité | Oui |
| Calendrier | Ajouter un RDV | Oui |
| Notifications | Écran de consentement (1er lancement) | Oui |

---

## NOTES POUR APP STORE CONNECT

```
MyToolsApp est une application B2B réservée aux administrateurs et employés
des garages partenaires du réseau MyTools (France uniquement).

L'accès nécessite :
1. Un compte validé par le réseau MyTools
2. La validation du numéro SIRET de l'établissement

Le compte de démonstration fourni (review@testapp.com / Test123456) est
un compte administrateur avec données de test complètes permettant de
tester toutes les fonctionnalités sans affecter de vraies données.

Fonctionnalités principales :
- Authentification Firebase (email, Google Sign-In, Sign in with Apple)
- Inscription garage via SIRET ou raison sociale (France uniquement)
- Gestion CRUD : devis, factures, réservations, services
- Analyse OCR des documents véhicules via IA (Gemini)
- Connexion biométrique Face ID / Touch ID
- Synchronisation calendrier natif iOS
- Notifications push en temps réel

Aucun tracking publicitaire. Données traitées conformément au RGPD.
Suppression de compte disponible dans Profil > Zone critique.
```

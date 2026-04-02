# Plan de Test — MyToolsApp v2.0.1 vs v1.0.0
*208 fichiers modifiés · 45 771 lignes ajoutées · Build #15*

---

## Résumé des Changements Majeurs

| Domaine | v1.0.0 (MyJantes) | v2.0.1 (MyToolsApp) |
|---------|-------------------|----------------------|
| Nom de l'app | MyJantes | MyToolsApp |
| Bundle ID | `com.myjantes.app` | `app.mytoolsmobile.mytoolsgroup.eu` |
| Version | 1.0.0 | 2.0.1 |
| Build | 1 | 15 |
| Tablette iPad | Non | Oui |
| Rôles utilisateurs | Client uniquement | Client + Admin + Employé |
| Authentification sociale | Absente | Google + Apple (Firebase) |
| Face ID / Touch ID | Absent | Présent |
| Calendrier natif | Absent | Présent |
| Notifications push | Basique | Complet avec polling |
| OCR / IA (Gemini) | Absent | Présent |
| Suppression de compte | Absente | Présente (RGPD) |
| Consentement RGPD | Absent | Présent (1er lancement) |
| PDF factures | Absent | Présent |
| Gestion clients (admin) | Absente | Complète |
| Logs système (admin) | Absents | Présents |
| Fallback API | Absent | saas2 → saas3 automatique |

---

## 1. AUTHENTIFICATION — Tests Prioritaires

### 1.1 Connexion Email / Mot de passe
| # | Test | v1.0.0 | v2.0.1 | Attendu |
|---|------|--------|--------|---------|
| A1 | Connexion avec identifiants valides | ✅ | Modifié | Se connecter → redirigé selon le rôle |
| A2 | Connexion avec mauvais mot de passe | ✅ | Modifié | Message d'erreur en français |
| A3 | Connexion avec email inconnu | ✅ | Modifié | Message d'erreur explicite |
| A4 | Champ mot de passe avec toggle visibilité | Absent | ✅ Nouveau | L'œil affiche/masque le mot de passe |
| A5 | Bouton "Mot de passe oublié" | Basique | Modifié | Redirige vers écran reset |
| A6 | Persistance de session (quitter/rouvrir l'app) | Basique | Renforcé | Reste connecté après fermeture |

### 1.2 Connexion Sociale — NOUVEAU en v2.0.1
| # | Test | Attendu |
|---|------|---------|
| A7 | Bouton "Continuer avec Google" visible | S'affiche sur iOS, Android et web |
| A8 | Connexion Google avec compte existant | Token Firebase → API → connexion réussie |
| A9 | Connexion Google avec compte inexistant | Message "compte non trouvé" + proposition d'inscription |
| A10 | Bouton "Continuer avec Apple" visible sur iOS | S'affiche uniquement sur iOS (absent sur web/Android) |
| A11 | Connexion Apple avec compte existant | Authentification Apple → Token Firebase → connexion |
| A12 | Connexion Apple avec compte inexistant | Message "compte non trouvé" |
| A13 | Annulation connexion Google/Apple en cours | Retour à l'écran de connexion, pas de crash |
| A14 | Connexion sociale sans email (compte Apple sans email) | Message "aucune adresse email associée" |

### 1.3 Face ID / Touch ID — NOUVEAU en v2.0.1
| # | Test | Attendu |
|---|------|---------|
| A15 | Activer Face ID dans Profil > Sécurité | Toggle → demande autorisation Face ID → activé |
| A16 | Relancer l'app avec Face ID activé | Bouton Face ID s'affiche sur l'écran de connexion |
| A17 | Connexion via Face ID (succès) | Identification → connexion directe au compte |
| A18 | Connexion via Face ID (annulée) | Retour à l'écran de connexion, pas de crash |
| A19 | Désactiver Face ID dans Profil | Toggle OFF → plus de bouton biométrique |
| A20 | Face ID après changement de compte | Ne pas reconnecter l'ancien compte |

### 1.4 Consentement RGPD — NOUVEAU en v2.0.1
| # | Test | Attendu |
|---|------|---------|
| A21 | Premier lancement (app fraîchement installée) | Écran RGPD s'affiche AVANT le login |
| A22 | Bouton "Accepter" sans cocher les 3 cases | Bouton désactivé (grisé) |
| A23 | Cocher les 3 cases et accepter | Redirigé vers l'écran de connexion |
| A24 | Relancer l'app après acceptation | Écran RGPD ne s'affiche plus |
| A25 | Lien "Politique de confidentialité" cliquable | Ouvre la page web correspondante |
| A26 | Lien "Mentions légales" cliquable | Ouvre la page web correspondante |

---

## 2. REDIRECTION PAR RÔLE — NOUVEAU en v2.0.1

| # | Test | Attendu |
|---|------|---------|
| R1 | Connexion avec compte `admin` | Redirigé vers Dashboard Admin (/(admin)/...) |
| R2 | Connexion avec compte `employe` | Redirigé vers Dashboard Admin (même espace) |
| R3 | Connexion avec compte `client` | Redirigé vers espace Client (/(main)/...) |
| R4 | Client tente d'accéder à une URL admin | Redirigé vers son espace client |
| R5 | Admin tente d'accéder à une URL client | Accès autorisé ou redirigé proprement |

---

## 3. ESPACE ADMIN — NOUVEAU en v2.0.1

### 3.1 Dashboard
| # | Test | Attendu |
|---|------|---------|
| D1 | Affichage des indicateurs (revenus, devis, factures, clients) | Données réelles de l'API chargées |
| D2 | Pull-to-refresh sur le dashboard | Rechargement des données |
| D3 | Affichage en mode sombre | Couleurs adaptées |

### 3.2 Gestion des Devis (Admin)
| # | Test | Attendu |
|---|------|---------|
| Q1 | Liste des devis avec filtres par statut | Filtres fonctionnels (en attente, accepté, refusé) |
| Q2 | Créer un nouveau devis | Formulaire complet → soumission → confirmation |
| Q3 | Photos obligatoires pour la création | Ne peut pas soumettre sans au minimum 1 photo |
| Q4 | Prendre une photo avec la caméra | Demande autorisation → capture → ajoutée au devis |
| Q5 | Choisir une photo depuis la galerie | Bibliothèque photos s'ouvre → sélection → ajoutée |
| Q6 | Modifier le statut d'un devis | Statut mis à jour → visible dans la liste |
| Q7 | Supprimer un devis | Confirmation → supprimé de la liste |
| Q8 | Voir le détail d'un devis | Toutes les informations et photos visibles |

### 3.3 Gestion des Factures (Admin)
| # | Test | Attendu |
|---|------|---------|
| F1 | Liste des factures | Chargement depuis l'API |
| F2 | Créer une facture avec lignes de services | Lignes dynamiques + totaux calculés automatiquement |
| F3 | Télécharger / voir une facture en PDF | PDF s'affiche correctement |
| F4 | Modifier le statut d'une facture | Mise à jour visible |
| F5 | Photos optionnelles sur facture | Peut être créée sans photo |

### 3.4 Gestion des Réservations (Admin)
| # | Test | Attendu |
|---|------|---------|
| RV1 | Liste des réservations | Chargement et affichage |
| RV2 | Créer une réservation | Formulaire → soumission |
| RV3 | Confirmer une réservation | Statut → "Confirmé" |
| RV4 | Annuler une réservation | Statut → "Annulé" |

### 3.5 Gestion des Clients — NOUVEAU en v2.0.1
| # | Test | Attendu |
|---|------|---------|
| C1 | Liste des clients | Chargement depuis l'API |
| C2 | Voir la fiche d'un client | Infos + historique devis/factures/RDV |
| C3 | Créer un nouveau client | Formulaire → création → apparaît dans la liste |
| C4 | Rechercher un client | Filtre en temps réel |

### 3.6 OCR / Analyse IA (Gemini) — NOUVEAU en v2.0.1
| # | Test | Attendu |
|---|------|---------|
| AI1 | Prendre une photo d'un document véhicule | Caméra s'ouvre → capture |
| AI2 | Envoyer la photo pour analyse OCR | Indicateur de chargement → résultat affiché |
| AI3 | Résultat OCR pré-remplit les champs | Immatriculation, marque, modèle extraits |
| AI4 | Erreur OCR (image illisible) | Message d'erreur clair, pas de crash |

### 3.7 Logs Système (Admin Root uniquement) — NOUVEAU en v2.0.1
| # | Test | Attendu |
|---|------|---------|
| L1 | Accès aux logs depuis le menu admin | Liste des logs serveur visible |
| L2 | Filtrer par niveau (info, warn, error) | Filtre fonctionnel |
| L3 | Exporter les logs en CSV | Fichier téléchargé |
| L4 | Vider les logs | Confirmation → liste vide |

---

## 4. ESPACE CLIENT — Existant et Renforcé

### 4.1 Devis Client
| # | Test | v1.0.0 | v2.0.1 |
|---|------|--------|--------|
| CQ1 | Liste des devis | ✅ | Modifié + filtres |
| CQ2 | Voir le détail d'un devis | ✅ | Enrichi |
| CQ3 | Accepter un devis | ✅ | Confirmé côté API |
| CQ4 | Refuser un devis | ✅ | Confirmé côté API |
| CQ5 | Demander un nouveau devis | ✅ | Photos obligatoires maintenant |

### 4.2 Factures Client
| # | Test | v1.0.0 | v2.0.1 |
|---|------|--------|--------|
| CF1 | Liste des factures | ✅ | Modifié |
| CF2 | Télécharger une facture PDF | Absent | ✅ Nouveau |

### 4.3 Réservations Client
| # | Test | v1.0.0 | v2.0.1 |
|---|------|--------|--------|
| CR1 | Liste des RDV | ✅ | Modifié |
| CR2 | Demander un RDV | ✅ | Modifié |
| CR3 | Ajouter au calendrier iOS — NOUVEAU | Absent | ✅ Nouveau |

**Test CR3 détaillé :**
1. Ouvrir un RDV confirmé
2. Appuyer sur "Ajouter au calendrier"
3. iOS demande l'autorisation calendrier → Autoriser
4. L'événement apparaît dans l'app Calendrier native avec la bonne date/heure

---

## 5. NOTIFICATIONS — Renforcé en v2.0.1

| # | Test | Attendu |
|---|------|---------|
| N1 | Autoriser les notifications au premier lancement | Alerte iOS → Autoriser → enregistrement |
| N2 | Refuser les notifications | L'app continue de fonctionner normalement |
| N3 | Recevoir une notification de mise à jour de devis | Notification visible dans le Centre de notifications |
| N4 | Appuyer sur une notification | Ouvre directement le devis/facture/RDV concerné |
| N5 | Son de notification personnalisé | Son joué à la réception |
| N6 | Préférences notifications dans le Profil | Toggle ON/OFF fonctionnel |

---

## 6. PROFIL ET PARAMÈTRES

| # | Test | v1.0.0 | v2.0.1 |
|---|------|--------|--------|
| P1 | Voir ses informations de profil | ✅ | Modifié |
| P2 | Modifier ses informations | ✅ | Modifié |
| P3 | Changer de mot de passe | ✅ | Modifié |
| P4 | Activer/désactiver Face ID | Absent | ✅ Nouveau |
| P5 | Préférences de notifications | Basique | Renforcé |
| P6 | Accéder à la politique de confidentialité | Absent | ✅ Nouveau |
| P7 | Accéder aux mentions légales | Absent | ✅ Nouveau |
| P8 | Supprimer son compte (2 étapes) | Absent | ✅ Nouveau |
| P9 | Se déconnecter | ✅ | Renforcé (clear tokens) |

### Test P8 — Suppression de compte (CRITIQUE pour Apple)
1. Profil > Zone critique > Supprimer mon compte
2. **Étape 1** : Liste des données qui seront supprimées s'affiche
3. **Étape 2** : Case à cocher RGPD + bouton "Confirmer la suppression"
4. Après confirmation : déconnexion → retour à l'écran login
5. Tenter de se reconnecter avec le même compte → erreur "compte supprimé"

---

## 7. COMPORTEMENT RÉSEAU ET ROBUSTESSE

| # | Test | Attendu |
|---|------|---------|
| NET1 | Mode avion au lancement | Message d'erreur clair, pas de crash |
| NET2 | Perte réseau pendant une requête | Timeout 15s → message d'erreur → possibilité de retry |
| NET3 | API principale indisponible (saas2) | Bascule automatique sur saas3 — NOUVEAU |
| NET4 | Reconnexion réseau après perte | L'app reprend normalement, pull-to-refresh fonctionne |
| NET5 | Token expiré | Déconnexion automatique → retour login |

---

## 8. COMPATIBILITÉ APPAREILS

| # | Test | Attendu |
|---|------|---------|
| DEV1 | iPhone SE (375pt, petit écran) | Aucun texte coupé, boutons accessibles |
| DEV2 | iPhone 16 Pro Max (Dynamic Island) | Contenu sous le Dynamic Island, insets corrects |
| DEV3 | iPad (supportsTablet: true — NOUVEAU) | Interface adaptée en mode paysage/portrait |
| DEV4 | Mode sombre | Thème sombre complet, pas de texte illisible |
| DEV5 | Mode clair | Thème clair complet |
| DEV6 | Rotation (blocage portrait) | Bloqué en portrait conformément à la config |

---

## 9. BUGS CORRIGÉS DEPUIS v1.0.0 — À RÉGRESSER

| # | Bug corrigé | Comment tester |
|---|-------------|----------------|
| BUG1 | Crash au démarrage (Firebase init) | Lancer l'app à froid, vérifier qu'elle démarre sans crash |
| BUG2 | Google Sign-In ne fonctionnait pas | Tester la connexion Google de bout en bout |
| BUG3 | Token social login type mismatch (null vs string) | Se connecter avec Google/Apple → vérifier que les tokens sont sauvegardés |
| BUG4 | Persistance de session perdue au redémarrage | Se connecter, fermer l'app, rouvrir → rester connecté |
| BUG5 | Animation library crash sur iOS | Naviguer entre tous les écrans sans crash |
| BUG6 | NSFaceIDUsageDescription manquant | Sur iOS : activer Face ID → pas de crash au premier usage |
| BUG7 | RECORD_AUDIO permission non justifiée | Vérifier que l'app ne demande jamais l'accès au micro |

---

## 10. ORDRE DE PRIORITÉ DES TESTS

### 🔴 Priorité 1 — Bloquants pour Apple Review
1. A21-A26 : Consentement RGPD (1er lancement)
2. A7-A14 : Connexion Google et Apple (Sign in with Apple obligatoire)
3. A15-A20 : Face ID (NSFaceIDUsageDescription maintenant ajouté)
4. P8 : Suppression de compte (obligatoire depuis 2022)
5. Q4-Q5 : Caméra et galerie (permissions critiques)
6. NET1 : Mode avion sans crash

### 🟠 Priorité 2 — Fonctionnalités clés v2.0.1
7. R1-R5 : Redirection par rôle
8. D1-D3 : Dashboard admin
9. AI1-AI4 : OCR / Analyse Gemini
10. CF2 : Téléchargement PDF
11. CR3 : Ajout au calendrier natif
12. N1-N6 : Notifications

### 🟡 Priorité 3 — Régression v1.0.0
13. A1-A6 : Connexion email/mot de passe
14. CQ1-CQ5 : Devis client
15. CF1 : Factures client
16. BUG1-BUG7 : Tous les bugs corrigés

---

## 11. Environnement de Test Recommandé

| Appareil | iOS | Priorité |
|----------|-----|----------|
| iPhone 16 Pro (ou simulateur) | iOS 18+ | Obligatoire |
| iPhone SE 3ème gen | iOS 16+ | Obligatoire |
| iPad Air (si disponible) | iOS 17+ | Recommandé |

**Compte de test :** `review@testapp.com` / `Test123456` (rôle admin)
**API :** `https://saas2.mytoolsgroup.eu/api` (fallback : saas3)

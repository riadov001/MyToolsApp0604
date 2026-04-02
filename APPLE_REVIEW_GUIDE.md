# MyTools — Guide Complet Apple App Store Review
*Version 2.0.1 — Mis à jour le 02/04/2026*

---

## 1. Informations Générales de l'Application

| Champ | Valeur |
|-------|--------|
| Nom de l'app | MyToolsApp |
| Bundle Identifier | `app.mytoolsmobile.mytoolsgroup.eu` |
| Version | 2.0.1 |
| Build Number | 15 |
| EAS Project ID | `2429ee3a-9dd5-4767-9532-175f1db29ff3` |
| Owner Expo | `mytoolsgroup` |
| Plateforme | iOS (iPhone + iPad) |
| Catégorie principale | Business (Économie et entreprise) |
| Catégorie secondaire | Utilities (Utilitaires) |
| Classification d'âge | 4+ |
| Langue principale | Français |
| Orientation | Portrait uniquement |

---

## 2. Compte de Démonstration (OBLIGATOIRE pour Apple)

> Apple **rejette systématiquement** les apps sans compte de démonstration fonctionnel.
> Ces identifiants doivent être saisis dans **App Store Connect > App Review Information > Sign-In Information**.

| Champ | Valeur |
|-------|--------|
| Email | `review@testapp.com` |
| Mot de passe | `Test123456` |
| Rôle | Admin (accès complet à toutes les fonctionnalités) |

### Notes pour le reviewer (à copier dans App Store Connect > Notes)

```
MyToolsApp est un portail professionnel pour les garages du réseau MyJantes,
spécialisé dans la rénovation et personnalisation de jantes automobiles.

L'application propose deux espaces :
- Espace Admin/Employé : gestion complète (devis, factures, réservations, clients)
- Espace Client : consultation et suivi des dossiers

Le compte de démonstration fourni (review@testapp.com / Test123456) est un compte admin
avec données de test préconfigurées.

PERMISSIONS UTILISÉES :
- Appareil photo : photographier les véhicules/jantes pour les devis
- Galerie photos : sélectionner des photos existantes pour les devis
- Face ID : connexion biométrique optionnelle (l'utilisateur l'active dans son profil)
- Calendrier : ajouter un rendez-vous au calendrier natif iOS
- Notifications : alertes pour devis, factures et rendez-vous
- Connexion réseau : communication avec l'API backend (saas2.mytoolsgroup.eu)

L'application n'effectue aucun suivi publicitaire. Aucun SDK de tracking n'est intégré.
Données personnelles traitées uniquement dans le cadre du service garage.
```

---

## 3. Parcours du Reviewer (Flux Complet)

### Premier lancement
1. **Écran de consentement RGPD** → 3 cases obligatoires à cocher (confidentialité, cookies, traitement des données) → bouton "Accepter et continuer" s'active
2. **Écran de connexion** → saisir `review@testapp.com` / `Test123456` → "Se connecter"
3. **Tableau de bord Admin** s'affiche avec statistiques et modules

### Navigation principale (onglets)
| Onglet | Contenu |
|--------|---------|
| Accueil | Dashboard : revenus, clients, devis, factures, réservations |
| Devis | Liste avec statuts, création, modification, suppression |
| Factures | Historique, visualisation PDF, création |
| Réservations | Calendrier et liste, confirmation, annulation |
| Clients | Fiches clients, historique |
| Profil | Paramètres, notifications, sécurité, suppression de compte |

### Fonctionnalités clés à tester
- **Créer un devis** : Devis > + > remplir le formulaire > joindre photo (caméra ou galerie)
- **Télécharger une facture PDF** : Factures > sélectionner une facture > Télécharger
- **Ajouter un RDV au calendrier** : Réservations > détail > "Ajouter au calendrier"
- **Activer Face ID** : Profil > Sécurité > Connexion biométrique (toggle)
- **Suppression de compte** : Profil > Zone critique > Supprimer mon compte → confirmation en 2 étapes (NE PAS CONFIRMER)

---

## 4. Permissions iOS — Configuration Complète

Toutes les permissions sont déclarées dans `app.json > expo > ios > infoPlist` :

| Permission | Clé infoPlist | Justification |
|------------|---------------|---------------|
| Appareil photo | `NSCameraUsageDescription` | Photographier les véhicules et pièces lors des devis |
| Bibliothèque photos (lecture) | `NSPhotoLibraryUsageDescription` | Sélectionner des photos de véhicules pour les devis |
| Bibliothèque photos (écriture) | `NSPhotoLibraryAddUsageDescription` | Enregistrer des photos dans la bibliothèque |
| Calendrier | `NSCalendarsUsageDescription` | Synchroniser les rendez-vous avec le calendrier natif |
| Face ID | `NSFaceIDUsageDescription` | Connexion biométrique sécurisée et rapide ✅ |
| Notifications | `NSUserNotificationsUsageDescription` | Alertes pour devis, factures et rendez-vous |
| Chiffrement | `ITSAppUsesNonExemptEncryption: NO` | HTTPS standard uniquement (TLS/SSL exempt) |

**Permissions NOT utilisées (non déclarées) :**
- ❌ Microphone / NSMicrophoneUsageDescription — non utilisé
- ❌ Localisation / NSLocationWhenInUseUsageDescription — non utilisé
- ❌ ATT / NSUserTrackingUsageDescription — aucun tracking publicitaire
- ❌ Contacts — non utilisé
- ❌ Bluetooth — non utilisé

---

## 5. Déclarations de Confidentialité (App Privacy dans App Store Connect)

### Données collectées et liées à l'identité

| Type de donnée | Catégorie | Usage | Lié à l'identité | Suivi |
|----------------|-----------|-------|-------------------|-------|
| Nom | Coordonnées | Fonctionnalité de l'app | Oui | Non |
| Adresse email | Coordonnées | Fonctionnalité de l'app | Oui | Non |
| Numéro de téléphone | Coordonnées | Fonctionnalité de l'app | Oui | Non |
| User ID | Identifiants | Fonctionnalité de l'app | Oui | Non |
| Photos de véhicules | Contenu utilisateur | Fonctionnalité de l'app | Oui | Non |

### Données NON collectées
- Localisation géographique
- Données financières ou bancaires
- Données de santé
- Historique de navigation
- Historique de recherche
- Données publicitaires
- Diagnostics / crash reports envoyés à des tiers

### URL de Politique de Confidentialité
```
https://www.mytoolsgroup.eu/privacy
```

---

## 6. Conformité Apple — Exigences Critiques

### ✅ Suppression de compte (obligatoire depuis juin 2022)
- Accessible depuis : **Profil > Zone critique > Supprimer mon compte**
- Processus en 2 étapes : liste des données supprimées + confirmation par checkbox RGPD
- Backend : endpoint `DELETE /api/users/me` — supprime le compte dans l'API externe et enregistre localement

### ✅ Connexion Sign in with Apple (obligatoire si Google Sign-In présent)
- `expo-apple-authentication` intégré
- Affiché uniquement sur iOS (caché sur web/Android)
- Token Firebase vérifié côté serveur via Firebase Admin SDK

### ✅ Politique de confidentialité accessible in-app
- Accessible depuis l'écran de consentement RGPD (premier lancement)
- Accessible depuis Profil > Mentions légales / Confidentialité

### ✅ Consentement RGPD
- Affiché obligatoirement au premier lancement
- 3 cases distinctes (pas de case "tout accepter" unique)
- Mémorisé via AsyncStorage

### ✅ Pas de références à d'autres plateformes
- Aucune mention d'Android, Google Play ou de prix/promotions hors App Store

### ✅ Mode avion / erreur réseau
- Timeout 15 secondes sur toutes les requêtes
- Messages d'erreur clairs en français
- Aucun crash en cas de perte réseau

### ✅ Support des Safe Areas
- `useSafeAreaInsets()` utilisé sur tous les écrans
- Compatible iPhone SE, iPhone 16 Pro Max (Dynamic Island)

### ✅ Mode sombre et mode clair
- `userInterfaceStyle: "automatic"` dans app.json
- Thème adaptatif via `useColors()` hook

### ✅ ErrorBoundary global
- `components/ErrorBoundary.tsx` wrappé autour de l'app entière
- Bouton "Relancer l'application" en cas de crash critique

---

## 7. Checklist Complète Avant Soumission

### App Store Connect
- [ ] Compte Apple Developer actif (99 $/an)
- [ ] App créée dans App Store Connect avec Bundle ID `app.mytoolsmobile.mytoolsgroup.eu`
- [ ] **Identifiants de demo renseignés** dans App Review Information > Sign-In Information
- [ ] **Notes reviewer** copiées dans App Review Information > Notes
- [ ] URL politique de confidentialité : `https://www.mytoolsgroup.eu/privacy`
- [ ] URL de support renseignée
- [ ] Description courte (≤30 car.) : `Portail client MyJantes`
- [ ] Sous-titre (≤30 car.) : `Devis, factures et rendez-vous`
- [ ] Description longue (voir section 8)
- [ ] Mots-clés (≤100 car.) : `jantes,renovation,peinture,automobile,devis,garage,voiture,factures,rdv`
- [ ] Catégorie : Business / Utilities
- [ ] Classification d'âge : 4+
- [ ] Screenshots iPhone 6.7" (1290×2796 px) — minimum 3
- [ ] Screenshots iPhone 6.1" (1179×2556 px) — minimum 3
- [ ] Icône app 1024×1024 PNG sans transparence ni coins arrondis
- [ ] Privacy labels remplis (section 5 ci-dessus)
- [ ] "Does this app use encryption?" → **No** (HTTPS standard uniquement)
- [ ] "Does this app contain, display or access third-party content?" → Non

### Technique
- [ ] `NSFaceIDUsageDescription` présent dans app.json ✅ (ajouté le 02/04/2026)
- [ ] `ITSAppUsesNonExemptEncryption: NO` dans infoPlist ✅
- [ ] `RECORD_AUDIO` Android permission supprimée ✅ (non utilisée)
- [ ] Build de production créé via Replit Expo Launch (iOS)
- [ ] API primaire `https://saas2.mytoolsgroup.eu/api` accessible ✅
- [ ] API de secours `https://saas3.mytoolsgroup.eu/api` configurée ✅
- [ ] Firebase `FIREBASE_SERVICE_ACCOUNT_JSON` configuré ✅
- [ ] Compte de démo `review@testapp.com` fonctionnel sur l'API externe
- [ ] Écran de suppression de compte opérationnel
- [ ] Pas de crash au lancement (testé sur simulateur iPhone)
- [ ] Consentement RGPD s'affiche au premier lancement (après suppression de l'app)

---

## 8. Textes App Store Connect (Copier-Coller)

### Description courte (max 30 caractères)
```
Portail client MyJantes
```

### Sous-titre (max 30 caractères)
```
Devis, factures et rendez-vous
```

### Description longue
```
MyToolsApp est l'application officielle du réseau MyJantes, spécialisé dans la rénovation et personnalisation de jantes automobiles.

POUR LES CLIENTS
• Demandez un devis gratuit en quelques étapes
• Joignez des photos de vos jantes directement depuis l'app
• Acceptez ou refusez vos devis en un tap
• Prenez rendez-vous après acceptation de votre devis
• Consultez et téléchargez vos factures en PDF
• Communiquez directement avec votre garage

POUR LES PROFESSIONNELS (Admin / Employés)
• Tableau de bord avec indicateurs clés (revenus, devis, factures)
• Gestion complète des devis, factures et réservations
• Gestion du fichier clients
• Analyse des documents par IA (OCR Gemini)

SÉCURITÉ ET CONFIDENTIALITÉ
• Connexion sécurisée avec Face ID / Touch ID
• Connexion sociale via Google ou Apple
• Données protégées conformément au RGPD
• Suppression de compte complète disponible dans l'app

NOTIFICATIONS
• Alertes en temps réel pour chaque mise à jour de devis, facture ou rendez-vous
• Gestion des préférences de notification dans le profil
```

### Mots-clés (max 100 caractères)
```
jantes,renovation,automobile,devis,garage,factures,rdv,voiture,peinture,carrosserie
```

---

## 9. Raisons de Rejet Courantes et Solutions Appliquées

| Motif de rejet Apple | Règle | Solution dans l'app |
|----------------------|-------|---------------------|
| Pas de compte de démonstration | Guideline 2.1 | Compte `review@testapp.com` préconfigurée |
| Pas de suppression de compte | Guideline 5.1.1(v) | Profil > Zone critique > Supprimer mon compte |
| NSFaceIDUsageDescription manquant | Guideline 5.1.1 | ✅ Ajouté dans app.json le 02/04/2026 |
| Pas de Sign in with Apple | Guideline 4.8 | `expo-apple-authentication` intégré sur iOS |
| Description de permission vague | Guideline 5.1.1 | Descriptions détaillées et spécifiques en français |
| Politique de confidentialité manquante | Guideline 5.1.1 | URL dans App Store Connect + écran in-app |
| App crash au lancement | Guideline 2.1 | ErrorBoundary global + API avec fallback automatique |
| Contenu uniquement web/WebView | Guideline 2.5.6 | Navigation native, caméra, biométrie, calendrier natif |
| Références à d'autres plateformes | Guideline 2.3 | Aucune mention Android/Google Play dans l'UI |
| Chiffrement non déclaré | Export compliance | `ITSAppUsesNonExemptEncryption: NO` configuré |
| Permissions non justifiées | Guideline 5.1.1 | Toutes les permissions avec clé infoPlist et justification |
| App ne fonctionne pas sans réseau | Guideline 2.1 | Messages d'erreur clairs, timeout 15s, aucun crash |
| RGPD non conforme (EU) | Guideline 5.1.1 | Écran de consentement obligatoire au premier lancement |

---

## 10. Informations Techniques pour Apple

### Chiffrement
L'application utilise **uniquement HTTPS (TLS/SSL)** pour toutes les communications réseau. Ce chiffrement est standard et exempté de la réglementation sur l'export (EAR exemption). Réponse dans App Store Connect : **Non** (pas de chiffrement non-exempt).

### Droits (Entitlements) iOS
| Droit | Valeur | Raison |
|-------|--------|--------|
| `com.apple.developer.applesignin` | `Default` | Sign in with Apple |
| Push Notifications | Activé | Alertes devis/factures/RDV |
| Associated Domains | Non utilisé | — |

### Connexion réseau
- **API primaire** : `https://saas2.mytoolsgroup.eu/api` (réponse ~300ms)
- **API de secours** : `https://saas3.mytoolsgroup.eu/api` (fallback automatique)
- **Firebase Auth** : `https://identitytoolkit.googleapis.com` (Sign in with Google/Apple)
- **Timeout** : 15 secondes par requête

### Architecture
- Framework : Expo SDK 54 / React Native 0.81
- Routage : Expo Router (navigation native)
- Auth : Firebase (Google/Apple) + JWT Bearer Token + Session cookie
- Stockage local : expo-secure-store (tokens), AsyncStorage (préférences)
- Backend proxy : Express.js sur Replit (port 5000 en prod)

---

## 11. URLs de Référence

| Ressource | URL |
|-----------|-----|
| API principale | `https://saas2.mytoolsgroup.eu/api` |
| API de secours | `https://saas3.mytoolsgroup.eu/api` |
| App déployée (PWA) | `https://official-saa-s-3-my-tools-pwa-v-240326-prod-root98.replit.app` |
| Politique de confidentialité | `https://www.mytoolsgroup.eu/privacy` |
| Apple Developer | `https://developer.apple.com` |
| App Store Connect | `https://appstoreconnect.apple.com` |
| Expo Dashboard | `https://expo.dev` |

---

## 12. Screenshots Requises

### Tailles obligatoires
| Appareil | Résolution | Requis |
|----------|-----------|--------|
| iPhone 6.7" (15 Pro Max / 16 Pro Max) | 1290 × 2796 px | ✅ Obligatoire |
| iPhone 6.1" (15 / 16) | 1179 × 2556 px | ✅ Obligatoire |
| iPad 12.9" (si supportsTablet: true) | 2048 × 2732 px | Recommandé |

### Ordre recommandé des screenshots
1. Écran de connexion avec logo MyTools
2. Tableau de bord admin (stats : revenus, devis, clients)
3. Liste des devis avec statuts colorés
4. Formulaire de création de devis (avec photo de jante)
5. Détail d'une facture avec bouton PDF
6. Profil utilisateur / paramètres de sécurité (Face ID)

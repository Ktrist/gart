# BACKLOG PROJET :  GART - Le jardin du bon (MOBILE)

Ce document liste les fonctionnalités attendues pour l'application de vente de produits frais.
L'application doit gérer des **Cycles de Vente** (périodes d'ouverture limitées) et un paiement sécurisé.

## 🟢 ÉPIC 1 : Cycles de Vente & Accueil (Priorité Haute)
L'utilisateur ne doit pas pouvoir commander si le cycle est fermé.

- [ ] **US-1.1 : Status de la Boutique**
  - En tant qu'utilisateur, je veux voir immédiatement sur la Home si la vente est Ouverte ou Fermée.
  - *Tech:* Vérifier les dates d'ouverture API. Afficher Banner Vert/Rouge.
- [ ] **US-1.2 : Message Informatif**
  - En tant qu'utilisateur, je veux savoir quand ouvre la prochaine vente si c'est fermé.
  - *Tech:* Afficher "Prochaine vente le : [Date]".

## 🍅 ÉPIC 2 : Produits & Gestion des Stocks
- [ ] **US-2.1 : Liste Produits**
  - En tant qu'utilisateur, je veux voir les produits avec : Photo, Nom, Prix (unité/kg) et **Stock restant**.
- [ ] **US-2.2 : Gestion du Stock (UI)**
  - En tant qu'utilisateur, je ne peux pas ajouter plus de produits que le stock disponible.
  - *Tech:* Désactiver le bouton "Ajouter" si `cartQuantity >= productStock`.
- [ ] **US-2.3 : Filtres**
  - En tant qu'utilisateur, je veux filtrer par catégories (Légumes, Fruits, etc.).

## 🛒 ÉPIC 3 : Panier & Validation
- [ ] **US-3.1 : Gestion Panier**
  - En tant qu'utilisateur, je veux voir le récapitulatif et le total de mon panier.
- [ ] **US-3.2 : Choix du Retrait**
  - En tant qu'utilisateur, je veux choisir mon point de retrait (Ferme ou Dépôt) avant de payer.

## 💳 ÉPIC 4 : Paiement Stripe & Sécurité
- [ ] **US-4.1 : Initialisation Paiement**
  - En tant qu'utilisateur, je veux saisir ma carte bancaire de façon sécurisée.
  - *Tech:* Utiliser `@stripe/stripe-react-native`.
- [ ] **US-4.2 : Vérification Stock Pre-Flight**
  - *Backend Task:* Avant de confirmer le paiement, vérifier une dernière fois que le stock est toujours disponible (pour éviter les conflits).
- [ ] **US-4.3 : Confirmation**
  - En tant qu'utilisateur, je reçois une confirmation de commande "Payé" et un récapitulatif.

## 👤 ÉPIC 5 : Authentification & Profil Utilisateur (MVP étendu)

### Création de Compte & Authentification
- [ ] **US-5.1 : Inscription**
  - En tant que nouvel utilisateur, je veux créer un compte avec email et mot de passe.
  - *Tech:* Firebase Auth ou Supabase Auth (OAuth, email/password).
  - *Champs:* Nom, Prénom, Email, Mot de passe, Téléphone (optionnel).
  - *Validation:* Email unique, mot de passe fort (8+ caractères).

- [ ] **US-5.2 : Connexion**
  - En tant qu'utilisateur existant, je veux me connecter avec mes identifiants.
  - *Tech:* Formulaire de connexion, gestion des erreurs (identifiants incorrects).
  - *Options:* "Se souvenir de moi", "Mot de passe oublié".

- [ ] **US-5.3 : Mot de Passe Oublié**
  - En tant qu'utilisateur, je veux réinitialiser mon mot de passe si je l'ai oublié.
  - *Tech:* Envoi d'email de réinitialisation, lien temporaire sécurisé.

- [ ] **US-5.4 : Profil Utilisateur**
  - En tant qu'utilisateur connecté, je veux voir et modifier mes informations personnelles.
  - *Champs modifiables:* Nom, Prénom, Téléphone, Adresse de livraison par défaut.
  - *Tech:* Écran "Mon Profil" avec formulaire d'édition.

- [ ] **US-5.5 : Déconnexion**
  - En tant qu'utilisateur, je veux pouvoir me déconnecter de mon compte.
  - *Tech:* Bouton de déconnexion, suppression du token local.

### Historique & Suivi des Commandes
- [ ] **US-5.6 : Historique des Commandes**
  - En tant qu'utilisateur connecté, je veux voir la liste de toutes mes commandes passées.
  - *Affichage:* Date, Numéro de commande, Montant total, Statut (En préparation, Prête, Récupérée).
  - *Tech:* API GET `/api/orders?userId={id}`, liste triée par date décroissante.

- [ ] **US-5.7 : Détail d'une Commande**
  - En tant qu'utilisateur, je veux voir le détail complet d'une commande (produits, quantités, point de retrait, date).
  - *Affichage:* Liste des produits, prix unitaires, quantités, total, point de retrait, horaire de retrait suggéré.
  - *Tech:* Écran de détail accessible depuis l'historique.

- [ ] **US-5.8 : Téléchargement de Factures**
  - En tant qu'utilisateur, je veux télécharger la facture PDF de mes commandes passées.
  - *Tech:* Backend génère PDF (librairie PDFKit ou jsPDF), endpoint GET `/api/orders/{orderId}/invoice.pdf`.
  - *Options:* Bouton "Télécharger la facture" sur chaque commande, sauvegarde dans le dossier Downloads.

- [ ] **US-5.9 : Statut de Commande en Temps Réel**
  - En tant qu'utilisateur, je veux être notifié quand ma commande change de statut.
  - *Statuts:* "Paiement confirmé" → "En préparation" → "Prête à récupérer" → "Récupérée".
  - *Tech:* Push notifications + mise à jour de l'historique.

### Produits Favoris & Listes
- [ ] **US-5.10 : Ajouter aux Favoris**
  - En tant qu'utilisateur, je veux marquer certains produits comme favoris pour les retrouver facilement.
  - *Tech:* Icône cœur sur chaque produit (Shop screen), sauvegardé dans API `/api/users/{userId}/favorites`.
  - *Persistance:* Favoris liés au compte utilisateur.

- [ ] **US-5.11 : Page Favoris**
  - En tant qu'utilisateur, je veux voir la liste de mes produits favoris.
  - *Tech:* Nouvel onglet ou section dans le profil, affichage identique à la Shop screen.
  - *Actions:* Ajouter au panier directement depuis les favoris, retirer des favoris.

- [ ] **US-5.12 : Recommandations Basées sur l'Historique**
  - En tant qu'utilisateur, je veux voir des suggestions de produits basées sur mes achats précédents.
  - *Tech:* Algorithme simple (produits les plus achetés par l'utilisateur), section "Vos produits habituels" sur la Home.

### Persistance du Panier
- [ ] **US-5.13 : Sauvegarde du Panier**
  - En tant qu'utilisateur connecté, je veux retrouver mon panier même si je ferme l'application.
  - *Tech:* AsyncStorage local + synchronisation avec API si disponible.
  - *Comportement:* Restaurer panier + point de retrait au démarrage.

---

## 🔔 ÉPIC 6 : Notifications Push & Alertes

### Notifications de Disponibilité
- [ ] **US-6.1 : Alerte Nouveau Cycle de Vente**
  - En tant qu'utilisateur, je veux être notifié quand un nouveau cycle de vente s'ouvre.
  - *Tech:* Push notification "🟢 La vente est ouverte ! Découvrez les produits de la semaine".
  - *Timing:* J-1 à 18h00 + le jour d'ouverture à 09h00.

- [ ] **US-6.2 : Alerte Fin de Cycle Proche**
  - En tant qu'utilisateur, je veux être notifié quand le cycle de vente va bientôt fermer.
  - *Tech:* Push notification "⏰ Plus que 24h pour commander !".
  - *Timing:* J-1 avant fermeture à 18h00.

- [ ] **US-6.3 : Alerte Produit Favori Disponible**
  - En tant qu'utilisateur, je veux être notifié quand un produit de mes favoris redevient disponible.
  - *Tech:* Push notification "❤️ Vos Tomates Grappe sont de retour !".
  - *Condition:* Produit était en rupture ET maintenant disponible.

- [ ] **US-6.4 : Alerte Stock Limité sur Favoris**
  - En tant qu'utilisateur, je veux être notifié quand un produit de mes favoris arrive en stock limité (≤5 unités).
  - *Tech:* Push notification "⚠️ Stock limité : Plus que 3 kg de Carottes Bio !".
  - *Fréquence:* Une seule notification par cycle pour éviter le spam.

### Notifications de Rupture & Stock
- [ ] **US-6.5 : Alerte Rupture de Stock (Produit dans le Panier)**
  - En tant qu'utilisateur, je veux être notifié si un produit dans mon panier est maintenant en rupture de stock.
  - *Tech:* Push notification "❌ Rupture : Les Haricots Verts ne sont plus disponibles".
  - *Action:* Ouvrir l'app et afficher le panier avec message d'erreur.

- [ ] **US-6.6 : Alerte Commande Prête**
  - En tant qu'utilisateur, je veux être notifié quand ma commande est prête à être récupérée.
  - *Tech:* Push notification "✅ Votre commande est prête ! Retrait disponible à La Ferme".
  - *Timing:* Envoyée par le producteur via dashboard admin.

- [ ] **US-6.7 : Rappel de Retrait**
  - En tant qu'utilisateur, je veux un rappel si je n'ai pas encore récupéré ma commande.
  - *Tech:* Push notification "📦 N'oubliez pas de récupérer votre commande aujourd'hui !".
  - *Timing:* J de retrait à 10h00, uniquement si commande non marquée comme récupérée.

### Configuration des Notifications
- [ ] **US-6.8 : Préférences de Notifications**
  - En tant qu'utilisateur, je veux pouvoir activer/désactiver certains types de notifications.
  - *Options:* Cycles de vente, Favoris, Commandes, Promotions.
  - *Tech:* Section "Notifications" dans le profil utilisateur.
  - *Persistance:* Préférences sauvegardées dans API.

---

## 📊 ÉPIC 7 : Admin & Producteur (Futur)
- [ ] **US-7.1 : Dashboard Producteur**
  - En tant que producteur, je veux voir le tableau de bord des commandes en cours.
- [ ] **US-7.2 : Gestion des Stocks Manuellement**
  - En tant que producteur, je veux mettre à jour les stocks en temps réel.
- [ ] **US-7.3 : Marquer Commande comme Prête**
  - En tant que producteur, je veux notifier les clients que leur commande est prête.
- [ ] **US-7.4 : Statistiques de Vente**
  - En tant que producteur, je veux voir les produits les plus vendus et le chiffre d'affaires par cycle.
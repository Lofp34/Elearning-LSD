# Description du Projet : Web-App E-learning Mobile (PWA)

## 1. Objectif produit (V1)
Créer une web-app e-learning mobile (PWA) où un apprenant :
1. Crée un compte (Prénom, Nom, Email).
2. Écoute des audios structurés en 3 parties.
3. Répond à un quiz de 5 questions après chaque audio.
4. Répond à un quiz de 10 questions à la fin de chaque partie.
5. Ses scores et sa progression sont enregistrés (Neon Postgres) pour vérification de la complétion.

---

## 2. Utilisateurs et droits

### Apprenant
- Accès aux contenus assignés (ex : "Audioprothésistes – Client X").
- Voit sa progression, ses scores, ce qu'il reste à faire.

### Admin (Toi)
- Crée/édite la structure (parties, audios, questions).
- Suit la progression individuelle et globale.
- Exporte un reporting (CSV).

*(Option V1.1 : "Manager client" qui voit uniquement ses équipes)*

---

## 3. Structure pédagogique (Contenu)

### Partie 1 — Mental
1. Posture & service
2. Confiance & calme
3. Résilience & rejet
4. Éthique & confiance
5. Discipline & énergie

### Partie 2 — Pyramide de la vente
1. Structure/pyramide
2. Prise de contact
3. Découverte
4. Argumentation
5. Objections
6. Closing

### Partie 3 — Techniques
1. Écoute active
2. Questionnement structuré
3. Reformulation synthèse
4. Épreuve & storytelling
5. Rythme & engagement

### Règles d’évaluation
- **Quiz audio** : 5 questions.
- **Quiz de partie** : 10 questions.
- **Validation** : Score enregistré + statut (réussi/non) selon seuil (ex : 70%) configurable.

---

## 4. UX Cible (Mobile-first, "Anti-friction")

### Principes
- 1 action évidente par écran.
- Progression visible en permanence.
- Lecture audio propre (pause/reprise, mémorisation à la seconde près).
- Validation de complétion par preuve + quiz.

### Navigation (V1)
Barre basse (3 onglets) :
1. **Parcours**
2. **Progression**
3. **Profil**
*(L’admin aura un 4e onglet ou un accès spécifique)*

---

## 5. Parcours Apprenant (User Journey)

### A. Invitation → Création de compte
- Lien envoyé (unique par client/cohorte).
- **Écran 1** : "Bienvenue".
- **Écran 2** : Création compte (Prénom, Nom, Email).

### B. Écran "Parcours" (Home)
- 3 cartes (Mental / Pyramide / Techniques).
- Affiche : % terminé, prochain audio (CTA "Continuer").

### C. Écran "Audio"
- Titre + durée.
- Player (Play/Pause, +/- 15s).
- Barre de progression.
- **Déverrouillage Quiz** : si audio écouté à ≥ 90% (ou durée - 30s).
- CTA final : "Quiz".

### D. Quiz 5 questions (Post-audio)
- 1 question par écran.
- Feedback immédiat ou final.
- Si score < seuil : "Réécouter / Refaire".

### E. Quiz 10 questions (Fin de partie)
- Débloqué quand tous les audios de la partie sont validés.

### F. Écran "Progression"
- Checklist claire (ex: Partie 1 : 5/5 + Quiz final).
- Badges (Terminé, À refaire, En cours).

---

## 6. Interface UI (Cahier des charges)

1. **Splash / Bienvenue** : Titre, Logo, CTA "Créer mon compte".
2. **Auth** : Email + Magic Link (priorité UX).
3. **Parcours (Home)** : Cartes Parties, Bloc "À faire maintenant".
4. **Détail Partie** : Liste des audios avec état (verrouillé/à faire/validé).
5. **Lecteur Audio** : Player accessible, indicateur écoute, CTA Quiz conditionnel.
6. **Quiz** : QCM, 4 choix max, navigation fluide.
7. **Profil** : Identité, progression globale.
8. **Admin (V1)** : Tableau apprenants (Nom, Email, % global, Scores), Export CSV.

---

## 7. Suivi et "Preuve de complétion"
- Tracking des événements : play, pause, timeupdate, ended.
- Calculs : % écouté, temps cumulé, date validation.
- **Règle** : Audio validé = Écoute complétée + Quiz 5Q réussi.

---

## 8. Données (Neon Postgres)
Entités clés : `users`, `clients/cohorts`, `enrollments`, `parts`, `audios`, `questions`, `quiz_attempts`, `answers`, `listen_events`.

---

## 9. Stockage Audios
- V1 : Stockage objet (S3-compatible ou Blob lié au front).
- Priorité : Chargement rapide, streaming.

---

## 10. MVP V1 (Scope verrouillé)
- Auth Email (Magic Link).
- Parcours 3 parties.
- Player Audio + Reprise.
- Quiz 5Q + 10Q.
- Enregistrement progression/scores.
- Admin dashboard minimal + Export CSV.

**Hors scope V1** : IA personnalisation, transcription, certificats PDF complexes, mode offline.

---

## 11. Décisions Produit (V1)
- Connexion : Magic Link.
- Déverrouillage quiz : 90% écoute audio.
- Seuil réussite : 70%.
- Format : QCM uniquement.
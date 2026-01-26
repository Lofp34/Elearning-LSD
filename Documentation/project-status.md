# Project Status (MVP)

## Objectif
Créer une Web-App E-learning Mobile (PWA) pour la formation commerciale (Mental, Vente, Techniques) avec suivi strict de la progression (Audio + Quiz).

## Perimetre (scope)
- In: Auth (email + mot de passe), Player Audio (avec reprise), Quiz (5Q/10Q), Progression (Neon Postgres), Admin Dashboard (Tableau + Export CSV).
- Out: IA de personnalisation, Mode Offline complet, Génération PDF complexes (V1), Transcriptions.

## Ce qui est en place
- Documentation initiale (`description-projet.md`).
- Guide des skills (`GUIDE_SKILLS.md`).
- Bootstrap Next.js (App Router + TypeScript) au root du repo.
- Dossier audios V1 (`Audio_elearning/`).
- Routes Blob (list/upload) + page de listing audio.
- Ecran d'accueil (bienvenue/creation de compte) + page Parcours (UI).
- Routes auth (signup/login/logout) + pages connexion.
- Schema Prisma (User) et utilitaires auth (hash + session).
- Pages Parcours detaillees (liste audios par partie) + placeholders progression/profil.
- Quizz audio statiques (5 questions) et page quiz par audio.
- Tracking progression (ecoutes completes + quiz valides) + APIs.
- Affichage statut audio + score quiz sur les cartes de parcours.
- Carte "A faire maintenant" adaptee au prochain audio a ecouter.
- Page d'accueil plus pedagogique (explication du parcours).
- Branding "Laurent SERRE, developpement" affiche avec le logo sur toutes les pages.

## Decisions prises
- **Stack** : Next.js (Frontend Design) + Neon (Database) + Vercel (Déploiement).
- **Auth** : Email + mot de passe (simple et efficace).
- **Validation** : Déverrouillage quiz après 90% d'écoute. Seuil de réussite 70%.
- **Stockage Audio** : Vercel Blob (V1).
- **Git** : Les MP3 ne sont pas versionnes (stockage Blob uniquement).

## Risques / Blocages
- **Contenu Audio** : Besoin des fichiers audio pour le remplissage de la base.
- **Lecture Audio Mobile** : Assurer que la lecture continue écran éteint (si possible en PWA/Web) ou gère bien les interruptions.

## Prochaine etape (proposee)
1. Mettre en place la base de données (Schema Prisma) selon la description.
2. Construire l'auth email+password (hash + sessions).
3. Creer les ecrans UI mobile-first (parcours, audio, quiz, progression, admin).
4. Integrer le stockage audio (Vercel Blob) et le tracking d'ecoute.

## Journal des evolutions
- 2026-01-26: Initialisation du projet et de la documentation.
- 2026-01-26: Bootstrap Next.js (App Router + TypeScript) ajoute au repo.
- 2026-01-26: Passage des audios vers Vercel Blob (MP3 retires du repo).
- 2026-01-26: Routes Blob (list/upload) et page `/audio` ajoutees.
- 2026-01-26: UI initiale (Welcome + Parcours) ajoutee.
- 2026-01-26: Auth email+password (routes + page connexion) ajoutee.
- 2026-01-26: Pages Parcours detaillees + pages Progression/Profil ajoutees.
- 2026-01-26: Quizz audio statiques ajoutes (par audio).
- 2026-01-26: Tracking ecoute/quiz et affichage progression ajoute.
- 2026-01-26: Statuts d'audio et scores de quiz affiches par carte.
- 2026-01-26: Carte "A faire maintenant" adaptee au prochain audio.
- 2026-01-26: Page d'accueil rendue plus pedagogique.
- 2026-01-26: Branding unifie sur toutes les pages.

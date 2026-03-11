# Project Status (Socle E-learning B2B)

Date de mise a jour: 2026-03-10

## Objectif
Refondre l'application existante en produit simple et stable de formation commerciale B2B generaliste, avec contenu fixe, MP3 importes manuellement, quiz manuels, suivi apprenants et preuves Qualiopi.

## Statut global
- Etat: refonte principale implementee en local.
- Avancement: schema de progression, contenu generique B2B, admin manuel, parcours apprenant, reporting et nettoyage Prisma termines.
- Reste a securiser: appliquer les migrations sur la base cible et confirmer metier la V1 GEDEAS.

## Livrables en place
- Console admin:
  - `/admin`
  - `/admin/gestion`
  - `/admin/gestion/companies/[companyId]`
  - `/admin/gestion/releases/[releaseId]/review`
  - `/admin/gestion/releases/[releaseId]/enrollments`
  - `/admin/suivi`
- Parcours apprenant branches sur la release active:
  - `/parcours`
  - `/parcours/[part]`
  - `/quiz/[slug]`
  - `/progression`
  - `/profil`
  - `/leaderboard`
- APIs manuelles conservees:
  - `POST /api/admin/companies/[companyId]/releases`
  - `GET|PATCH /api/admin/releases/[releaseId]/modules/[moduleId]`
  - `POST /api/admin/releases/[releaseId]/modules/[moduleId]/audio`
  - `POST /api/admin/releases/[releaseId]/publish`
  - `GET /api/admin/reports/progress`
  - `POST /api/listen/complete`
  - `POST /api/quiz/submit`

## Decisions verrouillees appliquees
- Structure pedagogique fixe 3 parties / 16 modules conservee.
- Base de scripts et quiz remplacee par un socle B2B generaliste.
- Aucune generation automatique depuis des transcriptions.
- Aucune selection de voix ou generation audio dans l'application.
- Publication manuelle obligatoire avec garde-fous sur scripts, quiz et audios.
- Progression principale calculee uniquement sur les modules `CORE`.
- Les futurs modules `BONUS` n'alterent pas le taux de completion principal.

## Donnees et preuve Qualiopi
- Nouvelle table agregee `LearnerModuleProgress`:
  - `listenPercentMax`
  - `lastListenedAt`
  - `completedAt`
  - `quizBestScore`
  - `quizBestTotal`
  - `quizPassed`
  - `quizPassedAt`
- `QuizAttempt` reste l'historique brut.
- Le statut complet est acquis a 90% d'ecoute.
- Export CSV admin disponible pour le suivi.

## Validation a executer
- Execute le 2026-03-10:
  - `npm run prisma:generate`
  - `npm run test`
  - `npm run lint`
  - `npm run build`

## Risques ouverts
- Les migrations de nettoyage destructif doivent encore etre appliquees sur les environnements existants.
- Les bonus par pole ne sont pas encore implementes fonctionnellement, seul le type `BONUS` est prepare.

## Prochaines etapes recommandees
1. Valider le flux admin manuel complet sur une societe test.
2. Charger les MP3 GEDEAS et assigner un premier panel d'apprenants.
3. Confirmer les regles de reporting attendues pour l'export Qualiopi.
4. Concevoir ensuite la V2 `socle commun + bonus pole`.

## Journal recent
- 2026-03-10: ajout du contenu generique B2B et du seeding automatique des 16 modules avec 5 quiz par module.
- 2026-03-10: ajout de `LearnerModuleProgress` et des APIs de progression et reporting manuel.
- 2026-03-10: refonte des pages admin et apprenant pour supprimer le fallback legacy actif.
- 2026-03-10: preparation du support `CORE/BONUS` pour les futures variantes par pole.
- 2026-03-10: suppression des routes, composants et objets Prisma lies aux interviews, jobs asynchrones, voix et review legacy.

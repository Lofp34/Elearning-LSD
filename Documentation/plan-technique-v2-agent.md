# Plan Technique V2 - Application E-learning Multi-Entreprises

Date: 2026-02-24  
Statut global: [ ] Non demarre / [x] En cours / [ ] Termine

## 0) Mise a jour execution (2026-02-24, lot 1 -> lot 8)

Etat synthese par lot:

- [x] Lot 1 - UI upload/extraction PDF en wizard societe.
- [x] Lot 2 - Pipeline IA asynchrone `FULL_PIPELINE` (analyse + scripts + quiz + `REVIEW_READY`).
- [x] Lot 3 - Review humaine (edition script/quiz + statuts review + journalisation).
- [x] Lot 4 - Voix ElevenLabs par societe + generation audio avec retry/idempotence.
- [x] Lot 5 - Publication manuelle renforcee + enrollment manuel + signup auto-enrollment.
- [x] Lot 6 - Parcours apprenant versionne avec fallback legacy.
- [x] Lot 7 - Runner jobs + execution manuelle admin + retry job admin + garde-fous securite.
- [ ] Lot 8 - Validation finale complete (tests reels staging providers + e2e non-skip) a terminer.

Livrables techniques integres:

- [x] Migration Prisma V2 supplementaire: `20260223223000_v2_review_voice_enrollment_tracking`.
- [x] APIs admin nouvelles/etendues: interviews list, wizard state, pipeline start, review GET/PATCH, voices GET/PATCH, audio generate, job retry.
- [x] APIs apprenant etendues: `listen/complete` et `quiz/submit` avec `releaseId/moduleId`.
- [x] UI admin: wizard societe, panel upload PDF auto-extract, panel voix, actions release, review release, enrollments release.
- [x] UI apprenant: parcours/parties/quiz/progression/classement/profil compatibles V2 + fallback legacy.
- [x] Jobs & pipeline: orchestration reelle OpenAI/ElevenLabs, step tracking, retries, idempotence.
- [x] Execution jobs manuelle: endpoint admin par societe + bouton `Executer prochain job` dans le wizard.
- [x] Cron Vercel retire (compatibilite plan Hobby).

Verification locale (branche `feature/v2-content-engine-foundations`):

- [x] `npm run lint`
- [x] `npm run test`
- [x] `npm run build`
- [x] `npm run test:e2e` (spec e2e presente mais `skip` par defaut en CI locale)

Reste a cloturer pour passage "Termine":

- [ ] Jouer un smoke test staging avec providers reels (OpenAI + ElevenLabs) sur 1 societe test complete.
- [ ] Retirer le `skip` e2e et brancher un scenario exploitable sur environnement de test stable.
- [ ] Cutover metier (`NEW_CONTENT_ENGINE=true`) apres validation fonctionnelle finale.

## 1) Objectif du document

Ce document est un plan d'execution pour un agent IA codeur.  
Il doit etre suivi pas a pas avec des cases a cocher pour piloter l'avancement.

Regles de suivi obligatoires pour l'agent:

- [ ] Cocher `[x]` chaque tache terminee.
- [ ] Ajouter une ligne dans `Journal d'execution` apres chaque lot de taches.
- [ ] Indiquer le commit associe pour chaque lot.
- [ ] Ne jamais modifier les regles pedagogiques ci-dessous.
- [ ] Ne jamais casser le parcours des apprenants deja en cours.

## 2) Contraintes produit non negociables

- [ ] Conserver l'UX globale actuelle (inscription, parcours, classement, progression, profil).
- [ ] Conserver la structure pedagogique fixe en 3 parties et sous-parties fixes.
- [ ] Autoriser uniquement l'adaptation des exemples, vocabulaire, objections, ton.
- [ ] Entree generation: PDF de transcription d'interviews (un PDF par collaborateur).
- [ ] Garder 5 questions de quiz par audio.
- [ ] Garder les regles de validation audio/quiz existantes (seuil ecoute + seuil quiz).
- [ ] Utiliser 2 voix fixes par societe (1 feminine, 1 masculine) et alterner de facon deterministe.
- [ ] Un admin societe ne voit que ses donnees.
- [ ] Un super admin voit toutes les societes.
- [ ] Une nouvelle generation ne doit pas impacter les apprenants deja assignes a une version.
- [ ] Generation complete acceptable en plusieurs heures (pipeline asynchrone).

## 3) Decision d'architecture (a appliquer)

- [ ] Garder la base Next.js existante et refactorer en V2 (pas de rewrite from scratch).
- [ ] Passer d'un contenu statique (Blob + `src/data/quizzes.ts`) a un contenu versionne en base.
- [ ] Introduire un moteur de generation asynchrone par jobs (DB + execution manuelle admin).
- [ ] Utiliser OpenAI pour analyse + generation scripts + generation quiz.
- [ ] Utiliser ElevenLabs pour generation audio a partir des scripts valides.
- [ ] Conserver Vercel Blob pour stocker les MP3 produits.

## 4) Cible fonctionnelle V2

- [x] Espace admin avec 2 entrees: `Suivi apprenants` et `Gestion`.
- [x] `Gestion` -> liste des societes + creation d'une nouvelle societe.
- [ ] Wizard creation societe:
- [x] Etape 1: infos societe.
- [ ] Etape 2: upload PDF interviews.
- [ ] Etape 3: analyse IA des interviews.
- [ ] Etape 4: generation scripts + quiz (draft).
- [ ] Etape 5: validation humaine initiale (edition/approbation).
- [ ] Etape 6: generation audio ElevenLabs.
- [ ] Etape 7: publication d'une version de parcours.
- [ ] Affectation des apprenants a une version publiee.
- [ ] Les ecrans apprenant consomment la version assignee et non un contenu global.

## 5) Gouvernance des skills (obligatoire)

- [ ] Utiliser uniquement les skills listes dans les sections 6, 7 et 14.
- [ ] Interdire tout nouveau skill non liste sans validation explicite du super admin.
- [ ] En cas de besoin d'un nouveau skill, documenter avant usage: URL skills.sh, objectif, risques, phase impactee.
- [ ] Journaliser chaque installation/mise a jour de skill dans le `Journal d'execution` (date, agent, action).
- [ ] Verifier qu'un skill installe est valide avant usage operationnel.

Regle de controle:

- [ ] Aucun nouveau skill non liste sans validation prealable.

## 6) Skills obligatoires - Pack Minimal V2

Skills a installer et utiliser en priorite:

- [ ] `prisma/skills@prisma-database-setup` - https://skills.sh/prisma/skills/prisma-database-setup
- [ ] `prisma/skills@prisma-cli` - https://skills.sh/prisma/skills/prisma-cli
- [ ] `neondatabase/agent-skills@neon-postgres` - https://skills.sh/neondatabase/agent-skills/neon-postgres
- [ ] `wshobson/agents@nextjs-app-router-patterns` - https://skills.sh/wshobson/agents/nextjs-app-router-patterns
- [ ] `wshobson/agents@database-migration` - https://skills.sh/wshobson/agents/database-migration

Commandes d'installation:

```bash
npx skills add prisma/skills@prisma-database-setup -g -y
npx skills add prisma/skills@prisma-cli -g -y
npx skills add neondatabase/agent-skills@neon-postgres -g -y
npx skills add wshobson/agents@nextjs-app-router-patterns -g -y
npx skills add wshobson/agents@database-migration -g -y
```

## 7) Skills qualite/tests - Pack minimal

Skills a installer pour verrouiller la qualite:

- [ ] `microsoft/playwright-cli@playwright-cli` - https://skills.sh/microsoft/playwright-cli/playwright-cli
- [ ] `wshobson/agents@e2e-testing-patterns` - https://skills.sh/wshobson/agents/e2e-testing-patterns
- [ ] `anthropics/skills@webapp-testing` - https://skills.sh/anthropics/skills/webapp-testing

Commandes d'installation:

```bash
npx skills add microsoft/playwright-cli@playwright-cli -g -y
npx skills add wshobson/agents@e2e-testing-patterns -g -y
npx skills add anthropics/skills@webapp-testing -g -y
```

## 8) Mapping Phase -> Skills a utiliser

- [ ] Phase A (garde-fous): `wshobson/agents@nextjs-app-router-patterns`
- [ ] Phase B (schema/migrations): `prisma/skills@prisma-database-setup`, `prisma/skills@prisma-cli`, `wshobson/agents@database-migration`, `neondatabase/agent-skills@neon-postgres`
- [ ] Phase C (env/config): `wshobson/agents@nextjs-app-router-patterns`
- [ ] Phase D (trame fixe): `openai-docs` (local), `company-profile` (local)
- [ ] Phase E (clients IA): `openai-docs` (local), `text-to-speech` (local), `agents` ElevenLabs (local)
- [ ] Phase F (PDF ingestion): `pdf` (local), `wshobson/agents@nextjs-app-router-patterns`
- [ ] Phase G (pipeline IA): `openai-docs` (local), `wshobson/agents@nextjs-app-router-patterns`
- [ ] Phase H (validation humaine): `web-design-guidelines` (local), `vercel-react-best-practices` (local)
- [ ] Phase I (audio generation): `text-to-speech` (local), `setup-api-key` (local)
- [ ] Phase J (publication/versioning): `wshobson/agents@database-migration`, `neondatabase/agent-skills@neon-postgres`
- [ ] Phase K (admin): `wshobson/agents@nextjs-app-router-patterns`, `web-design-guidelines` (local)
- [ ] Phase L (parcours apprenant): `wshobson/agents@nextjs-app-router-patterns`, `vercel-react-best-practices` (local)
- [ ] Phase M (jobs async): `wshobson/agents@database-migration`, `openai-docs` (local)
- [ ] Phase N (securite/RBAC): `wshobson/agents@auth-implementation-patterns` (optionnel), `better-auth/skills@email-and-password-best-practices` (optionnel)
- [ ] Phase O (tests): `microsoft/playwright-cli@playwright-cli`, `wshobson/agents@e2e-testing-patterns`, `anthropics/skills@webapp-testing`
- [ ] Phase P (cutover/deploiement): `vercel-deploy` (local), `project-status-keeper` (local)

## 9) Plan de travail detaille

## Phase A - Preparation projet et garde-fous

- [ ] Creer une branche dediee `feature/v2-multi-company-content-engine`.
- [x] Ajouter un feature flag global `NEW_CONTENT_ENGINE` (env + helper).
- [ ] Ajouter un garde-fou pour garder le parcours legacy tant que V2 n'est pas publie.
- [ ] Ajouter un document de migration rollback dans `Documentation/`.
- [ ] Lister les pages/API legacy impactees avant modification.

## Phase B - Modele de donnees Prisma V2

Fichiers cibles:

- `prisma/schema.prisma`
- `prisma/migrations/*`

Taches:

- [x] Ajouter `Company` (id, name, slug unique, isActive, createdAt, updatedAt).
- [x] Lier `User` a `Company` via `companyId` (nullable pour migration).
- [x] Conserver `User.role` (`USER`, `ADMIN`, `SUPER_ADMIN`).
- [x] Ajouter `LearningRelease` (companyId, version, status, createdBy, publishedAt).
- [x] Ajouter `LearningModule` (releaseId, partKey, chapterKey, title, orderIndex, scriptText, voiceSlot).
- [x] Ajouter `LearningQuizQuestion` (moduleId, orderIndex, question, options JSON, answerIndex).
- [x] Ajouter `InterviewDocument` (companyId, filename, blobPath, extractedText, uploadedBy, status).
- [x] Ajouter `GenerationJob` (companyId, releaseId, jobType, status, step, attempts, lastError, payload JSON).
- [x] Ajouter `AudioAsset` (moduleId, blobPath, durationSec, provider, providerVoiceId, status).
- [x] Ajouter `LearnerEnrollment` (userId, releaseId, assignedAt, isActive).
- [x] Ajouter `AdminActionLog` (actorUserId, companyId, actionType, metadata JSON, createdAt).
- [x] Ajouter les index critiques (companyId, releaseId, status, createdAt, unique release/version).
- [x] Ecrire la migration SQL.
- [x] Ecrire un script de backfill minimal pour mapper les users existants a une company legacy.
- [x] Valider `prisma generate` + migration DB cible (`prisma migrate deploy`) + backfill societes.

## Phase C - Variables d'environnement et configuration runtime

Fichiers cibles:

- `.env.example`
- `src/lib/env.ts` (nouveau)

Taches:

- [x] Ajouter `OPENAI_API_KEY`.
- [x] Ajouter `OPENAI_MODEL` (reference unique, ex: `gpt-5-mini`) + overrides optionnels `OPENAI_MODEL_ANALYSIS` et `OPENAI_MODEL_GENERATION`.
- [x] Ajouter `OPENAI_WEBHOOK_SECRET` (si mode background + webhook).
- [x] Ajouter `ELEVENLABS_API_KEY`.
- [x] Ajouter `ELEVENLABS_MODEL_ID`.
- [x] Ajouter `APP_BASE_URL`.
- [x] Ajouter `CRON_SECRET`.
- [x] Ajouter validation stricte des env au boot (throw explicite si manquant).

## Phase D - Normalisation de la trame pedagogique fixe

Fichiers cibles:

- `src/lib/learning/base-structure.ts` (nouveau)

Taches:

- [x] Encoder la trame fixe complete (Mental/Pyramide/Techniques + sous-parties) en config unique.
- [x] Ajouter des ids stables par module (ex: `mental.posture-service`).
- [x] Ajouter un ordre stable (`orderIndex`) pour alternance voix deterministe.
- [x] Ajouter texte de consigne de niveau de langage "accessible non-commerciaux".
- [ ] Interdire toute derive de structure dans les prompts (validation schema).

## Phase E - Clients API OpenAI et ElevenLabs

Fichiers cibles:

- `src/lib/ai/openai-client.ts` (nouveau)
- `src/lib/ai/elevenlabs-client.ts` (nouveau)
- `src/lib/ai/schemas.ts` (nouveau)

Taches:

- [x] Ajouter client OpenAI (Responses API) avec timeout, retries, idempotency key.
- [x] Ajouter schema JSON strict pour sortie d'analyse interview.
- [x] Ajouter schema JSON strict pour sortie scripts modules.
- [x] Ajouter schema JSON strict pour sortie quiz 5 questions/module.
- [x] Ajouter client ElevenLabs TTS avec gestion streaming binaire.
- [x] Ajouter recuperation des voix existantes via API ElevenLabs.
- [x] Ajouter normalisation des erreurs fournisseur.
- [ ] Ajouter logs techniques minimaux (sans fuite de donnees sensibles).

## Phase F - Ingestion PDF interviews

Fichiers cibles:

- `src/app/api/admin/companies/[companyId]/interviews/upload/route.ts` (nouveau)
- `src/app/api/admin/companies/[companyId]/interviews/extract/route.ts` (nouveau)
- `src/lib/interviews/pdf-extract.ts` (nouveau)

Taches:

- [x] Ajouter endpoint upload PDF (multipart).
- [x] Verifier MIME/extension/taille max.
- [x] Stocker PDF source en Blob (`interviews/{companyId}/{timestamp}/...`).
- [x] Enregistrer metadonnees en table `InterviewDocument`.
- [x] Extraire le texte PDF (serveur) et stocker `extractedText`.
- [x] Gerer les PDF vides/illisibles avec statut d'erreur.
- [x] Ajouter relance extraction en cas d'echec.

## Phase G - Pipeline generation IA (scripts + quiz)

Fichiers cibles:

- `src/lib/pipeline/generate-company-release.ts` (nouveau)
- `src/lib/pipeline/prompts/*.md` (nouveaux)
- `src/lib/pipeline/voice-assignment.ts` (nouveau)

Taches:

- [x] Implementer etat pipeline: `UPLOADED -> ANALYZED -> SCRIPTED -> QUIZZED -> REVIEW_READY`.
- [x] Construire un prompt d'analyse interview (synthese besoins, vocabulaire, objections).
- [x] Construire un prompt de generation scripts par module base.
- [x] Construire un prompt de generation quiz (5 QCM/module).
- [ ] Forcer format de sortie en JSON schema strict.
- [ ] Ajouter controles qualite automatiques (longueur min/max, lisibilite, pas de jargon excessif).
- [ ] Stocker tous les drafts en base (release non publiee).
- [x] Affecter les slots voix (`FEMALE`, `MALE`) en alternance stable par `orderIndex`.

## Phase H - Validation humaine initiale (obligatoire)

Fichiers cibles:

- `src/app/admin/gestion/releases/[releaseId]/review/page.tsx` (nouveau)
- `src/app/api/admin/releases/[releaseId]/review/route.ts` (nouveau)

Taches:

- [ ] Creer ecran de revue module par module (script + quiz).
- [ ] Permettre edition du script.
- [ ] Permettre edition des 5 questions et reponses.
- [ ] Ajouter statuts `DRAFT`, `APPROVED`, `NEEDS_CHANGES`.
- [ ] Bloquer generation audio tant que modules non `APPROVED`.
- [ ] Journaliser les actions de validation dans `AdminActionLog`.

## Phase I - Generation audio ElevenLabs

Fichiers cibles:

- `src/app/api/admin/releases/[releaseId]/audio/generate/route.ts` (nouveau)
- `src/lib/pipeline/generate-audio.ts` (nouveau)

Taches:

- [ ] Ecran choix des 2 voix existantes (1 feminine, 1 masculine).
- [ ] Verifier que les 2 voix sont distinctes.
- [ ] Generer audio module par module selon `voiceSlot`.
- [ ] Stocker MP3 en Blob (`audio/companies/{companySlug}/releases/{version}/...`).
- [ ] Enregistrer metadonnees `AudioAsset` + lien module.
- [ ] Gerer retries + backoff sur erreurs ElevenLabs.
- [ ] Permettre reprise d'un job interrompu sans regenerer les modules deja valides.

## Phase J - Publication versionnee et affectation apprenants

Fichiers cibles:

- `src/app/api/admin/releases/[releaseId]/publish/route.ts` (nouveau)
- `src/app/api/admin/enrollments/route.ts` (nouveau)

Taches:

- [x] Publier une release uniquement si tous les modules ont audio + quiz.
- [x] Incrementation version par societe (`v1`, `v2`, ...).
- [ ] A l'inscription d'un nouvel apprenant: assigner la derniere release publiee de sa societe.
- [ ] Ne jamais reaffecter automatiquement les apprenants deja en cours.
- [ ] Ajouter ecran d'affectation manuelle (super admin / admin societe) (API en place, UI a faire).
- [x] Journaliser toutes les affectations.

## Phase K - Refonte admin IA

Fichiers cibles:

- `src/app/admin/page.tsx` (modifier)
- `src/app/admin/suivi/page.tsx` (nouveau, extraction de l'existant)
- `src/app/admin/gestion/page.tsx` (nouveau)
- `src/app/admin/gestion/companies/new/page.tsx` (nouveau)

Taches:

- [x] Transformer `/admin` en hub avec 2 boutons: `Suivi apprenants` et `Gestion`.
- [x] Deplacer le dashboard existant dans `/admin/suivi`.
- [x] Creer `/admin/gestion` avec listing societes et releases.
- [x] Creer wizard "Nouvelle societe".
- [ ] Ajouter affichage etat pipeline (progression par etape + erreurs).
- [x] Respecter scope role (`ADMIN` limite a sa societe, `SUPER_ADMIN` global).

## Phase L - Adaptation parcours apprenant sans changer UX

Fichiers cibles:

- `src/app/parcours/page.tsx` (modifier)
- `src/app/parcours/[part]/page.tsx` (modifier)
- `src/app/quiz/[slug]/page.tsx` (modifier)
- `src/data/quizzes.ts` (deprecie puis supprimer quand migration terminee)

Taches:

- [ ] Remplacer lecture "prefix Blob hardcode" par lecture modules de la release assignee.
- [ ] Remplacer quiz statiques par quiz base de donnees.
- [ ] Garder mise en page et ergonomie globales identiques.
- [ ] Conserver regles de completion actuelles (90% ecoute, score >= 70%).
- [ ] Verifier que progression, classement, profil continuent de fonctionner par release.

## Phase M - Orchestration jobs asynchrones

Fichiers cibles:

- `src/app/api/internal/jobs/runner/route.ts` (nouveau)
- `src/lib/jobs/claim-next-job.ts` (nouveau)
- `src/lib/jobs/process-job-step.ts` (nouveau)

Taches:

- [x] Implementer un runner idempotent (claim DB + lock TTL).
- [x] Traiter les jobs par etapes courtes (compatibles serverless).
- [x] Ajouter retries limites et etat `FAILED` propre.
- [ ] Ajouter endpoint webhook OpenAI si mode background est active.
- [x] Ajouter un endpoint admin "Executer prochain job" scope societe.
- [x] Ajouter un bouton admin "Executer prochain job".

## Phase N - Securite, RBAC, audit

Fichiers cibles:

- `src/lib/authz.ts` (nouveau)
- `src/middleware.ts` (si necessaire)

Taches:

- [x] Centraliser verification role/scope company sur toutes les routes admin.
- [x] Refuser toute lecture cross-company pour role `ADMIN`.
- [x] Proteger les routes internes (`/api/internal/*`) par secret.
- [x] Ajouter logs d'audit pour creation societe, publication, affectation, regeneration audio.
- [ ] Masquer/separer les secrets et payloads sensibles dans les logs.

## Phase O - Tests et validation technique

Taches:

- [ ] Ajouter tests unitaires sur mapping trame fixe et alternance voix.
- [ ] Ajouter tests unitaires sur validation JSON schema (analysis/scripts/quiz).
- [ ] Ajouter tests d'integration API admin (RBAC + CRUD societe + jobs).
- [ ] Ajouter tests d'integration parcours apprenant versionne.
- [ ] Ajouter au moins 1 test e2e wizard creation societe -> publication.
- [ ] Verifier non-regression des pages existantes (inscription, parcours, progression, profil).
- [ ] Verifier que les apprenants legacy gardent leur contenu apres publication d'une nouvelle version.

## Phase P - Deploiement progressif et cutover

Taches:

- [ ] Deployer en staging avec `NEW_CONTENT_ENGINE=false` par defaut.
- [ ] Executer migrations DB en staging.
- [ ] Tester pipeline complet sur une societe test.
- [ ] Activer `NEW_CONTENT_ENGINE=true` pour super admin uniquement (si possible via guard).
- [ ] Executer generation complete pour un premier client reel.
- [ ] Confirmer stabilite 48h avant extension a toutes societes.
- [ ] Preparer rollback (desactivation flag + retour lecture legacy).

## 10) Mapping fichiers legacy -> cible V2

- [x] `src/app/admin/page.tsx` -> devient hub 2 boutons.
- [x] `src/app/admin/page.tsx` (contenu historique) -> migre vers `src/app/admin/suivi/page.tsx`.
- [ ] `src/data/quizzes.ts` -> remplace par tables `LearningQuizQuestion`.
- [ ] `src/app/parcours/page.tsx` -> source DB versionnee au lieu de list Blob globale.
- [ ] `src/app/parcours/[part]/page.tsx` -> source DB + asset audio associe.
- [ ] `src/app/quiz/[slug]/page.tsx` -> charge quiz DB par module/release.
- [ ] `src/app/api/listen/complete/route.ts` -> enrichir avec `releaseId`/`moduleId`.
- [ ] `src/app/api/quiz/submit/route.ts` -> enrichir avec `releaseId`/`moduleId`.

## 11) Criteres d'acceptation (Definition of Done)

- [ ] Un super admin peut creer une societe et lancer une generation complete depuis PDF.
- [ ] Les scripts generes respectent la trame fixe (3 parties + sous-parties fixes).
- [ ] Les quiz sont bien de 5 questions par audio.
- [ ] Les audios sont generes avec 2 voix fixes alternantes.
- [ ] Un admin societe voit uniquement sa societe.
- [ ] Un apprenant deja assigne conserve sa version apres publication d'une nouvelle version.
- [ ] Un nouvel apprenant recoit la derniere version publiee de sa societe.
- [ ] Le pipeline supporte des jobs longs (plusieurs heures) sans perdre l'etat.
- [ ] Les pages apprenant gardent une UX equivalente a l'actuel.

## 12) Journal d'execution (a remplir en continu)

Format obligatoire:

- `YYYY-MM-DD HH:MM | Agent | Phase | Actions | Commit | Resultat | Prochaine action`

Entrees:

- [x] 2026-02-23 19:05 | Codex | A/B/C/D/E/K | Schema Prisma V2 + migration SQL + backfill script + env/feature-flag + admin hub suivi/gestion + creation societe + clients IA/pipeline prompt scaffold | N/A (working tree) | Fondations V2 operationnelles | Implementer ingestion PDF + orchestration jobs
- [x] 2026-02-23 19:35 | Codex | F/J/M/N | Ingestion interviews PDF (upload/extract) + APIs releases/publish/enrollments + runner jobs interne | N/A (working tree) | Chaine admin backend V2 initiale operationnelle | Brancher UI review/generation audio et parcours versionne
- [x] 2026-02-23 22:12 | Laurent + Codex | B/K/P | Validation en deploiement Vercel: migration `prisma migrate deploy`, backfill societes, creation societe `Gedeas`, creation release draft `v1` via `/admin/gestion` | N/A (ops Vercel/DB) | Flux admin V2 de base valide en ligne | Construire UI upload interviews + revue scripts/quiz + generation audio
- [x] 2026-02-24 00:00 | Codex | M/P | Suppression cron Vercel (Hobby) + endpoint admin manuel `POST /api/admin/companies/[companyId]/jobs/run-next` + bouton wizard `Executer prochain job` | 34bd0a0+ | Traitement jobs en mode 100% manuel depuis admin | Lancer smoke test reel sur societe test
- [ ] 2026-__-__ __:__ |  |  |  |  |  | 
- [ ] 2026-__-__ __:__ |  |  |  |  |  | 

## 13) Commandes utiles (reference execution)

- [x] Installer deps: `npm install`
- [x] Prisma generate: `npm run prisma:generate`
- [x] Prisma migration (DB cible): `npx prisma migrate deploy`
- [x] Backfill societes: `npm run backfill:companies`
- [ ] Lancer app: `npm run dev`
- [ ] Lint: `npm run lint`

## 14) References locales skills (pour agent IA)

- [ ] ElevenLabs text-to-speech: `~/.codex/skills/text-to-speech/SKILL.md`
- [ ] ElevenLabs speech-to-text: `~/.codex/skills/speech-to-text/SKILL.md`
- [ ] ElevenLabs agents: `~/.codex/skills/agents/SKILL.md`
- [ ] ElevenLabs sound-effects: `~/.codex/skills/sound-effects/SKILL.md`
- [ ] ElevenLabs music: `~/.codex/skills/music/SKILL.md`
- [ ] ElevenLabs setup-api-key: `~/.codex/skills/setup-api-key/SKILL.md`
- [ ] OpenAI docs skill: `~/.codex/skills/openai-docs/SKILL.md`

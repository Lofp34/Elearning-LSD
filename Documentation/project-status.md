# Project Status (V2 Content Engine)

Date de mise a jour: 2026-02-23

## Objectif
Industrialiser la generation de parcours e-learning par societe (PDF interviews -> scripts -> quiz -> audio -> publication), sans regression UX pour les apprenants existants.

## Statut global
- Etat: En cours avance.
- Avancement: Lots 1 a 7 implementes et verifies localement.
- Bloc final: validation staging avec providers reels + scenario e2e non-skip.

## Livrables en place
- Admin hub conserve: `/admin` avec entrees `Suivi apprenants` et `Gestion`.
- Wizard societe: `/admin/gestion/companies/[companyId]` (upload PDF, extraction auto, voix, releases, jobs).
- Reviews: `/admin/gestion/releases/[releaseId]/review` (edition scripts + quiz + statut review).
- Enrollments: `/admin/gestion/releases/[releaseId]/enrollments` (assignation manuelle, replace active).
- APIs V2 ajoutees:
  - `GET /api/admin/companies/[companyId]/interviews`
  - `GET /api/admin/companies/[companyId]/wizard`
  - `POST /api/admin/releases/[releaseId]/pipeline/start`
  - `GET|PATCH /api/admin/releases/[releaseId]/review`
  - `GET|PATCH /api/admin/companies/[companyId]/voices`
  - `POST /api/admin/releases/[releaseId]/audio/generate`
  - `POST /api/admin/jobs/[jobId]/retry`
- APIs etendues:
  - `POST /api/admin/releases/[releaseId]/publish` (garde-fous renforces)
  - `POST /api/auth/signup` (auto-enrollment nouvelle inscription)
  - `POST /api/listen/complete` et `POST /api/quiz/submit` (support `releaseId/moduleId`)
- Pipeline reel:
  - Job `FULL_PIPELINE` execute analyse OpenAI + scripts + quiz (16 modules fixes, schema strict).
  - Job `GENERATE_AUDIO` execute generation ElevenLabs avec retry et idempotence.
  - Release passe en `REVIEW_READY` puis publication manuelle.
- Stockage audio V2:
  - `audio/companies/{companySlug}/releases/v{version}/{order}-{chapter}.mp3`
- Fallback legacy maintenu:
  - Si `NEW_CONTENT_ENGINE=false` ou pas d'enrollment V2 actif, les pages apprenant gardent le mode legacy.
- Infra jobs:
  - Runner securise `CRON_SECRET` sur `/api/internal/jobs/runner`
  - Claim TTL jobs stale + retry admin
  - Cron Vercel toutes les 2 minutes via `vercel.json`
- Base de donnees:
  - Migration fondation V2 + migration complementaire:
    - `20260223190000_v2_content_engine_foundations`
    - `20260223223000_v2_review_voice_enrollment_tracking`

## Validation technique executee
- `npm run lint`: OK
- `npm run test`: OK (Vitest, 7 tests)
- `npm run build`: OK
- `npm run test:e2e`: OK (spec presente, skip par defaut)

## Decisions verrouillees appliquees
- Structure pedagogique fixe 3 parties / 16 modules preservee.
- Adaptation limitee a exemples, vocabulaire, objections.
- Deux voix fixes par societe (feminine + masculine) avec alternance deterministe.
- Publication manuelle obligatoire avec prerequis stricts.
- Aucun reassignment auto des apprenants deja actifs.
- Super admin voit tout, admin societe reste scope a sa societe.

## Risques ouverts / points a finir
- Staging provider reel non execute encore (OpenAI + ElevenLabs sur un flux complet).
- E2E complet encore en mode `skip` (scenario a activer sur environnement de test stable).
- Cutover metier a planifier (`NEW_CONTENT_ENGINE=true`) apres recette finale.

## Prochaines etapes recommandees
1. Lancer un smoke test staging complet sur 1 societe test (de upload PDF a publication).
2. Activer un test e2e non-skip avec credentials techniques dedies.
3. Valider metier puis activer `NEW_CONTENT_ENGINE=true` en Production.

## Journal recent
- 2026-02-23: Implementation complete lots 1-7 (UI admin, APIs, pipeline IA/audio, publication, enrollment, parcours V2 fallback legacy, runner/cron).
- 2026-02-23: Ajout tests unitaires Vitest (structure, alternance voix, schemas IA) et base Playwright.
- 2026-02-23: Verification locale verte (`lint`, `test`, `build`, `test:e2e`).

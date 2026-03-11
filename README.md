# Elearning-LSD

Application Next.js de formation commerciale B2B generaliste.

Le produit est volontairement simple:
- structure pedagogique fixe de 16 modules;
- scripts et quiz edites manuellement dans l'admin;
- audios MP3 importes manuellement;
- assignation manuelle des apprenants;
- suivi de progression et export CSV pour les preuves Qualiopi.

## Documentation
- Statut projet: `Documentation/project-status.md`
- Description produit: `Documentation/description-projet.md`

## Prerequis
- `DATABASE_URL`
- `AUTH_SECRET`
- `BLOB_READ_WRITE_TOKEN`

Copier `.env.example` vers `.env.local`, puis lancer:

```bash
npm install
npm run prisma:migrate
npm run dev
```

## Parcours admin
- `/admin`
- `/admin/gestion`
- `/admin/gestion/companies/[companyId]`
- `/admin/gestion/releases/[releaseId]/review`
- `/admin/gestion/releases/[releaseId]/enrollments`
- `/admin/suivi`

## Parcours apprenant
- `/parcours`
- `/parcours/[part]`
- `/quiz/[slug]`
- `/progression`
- `/profil`

## Stockage audio
Les MP3 sont stockes dans Vercel Blob. Ils sont importes module par module depuis l'admin.

## Scripts utiles
- `npm run dev`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run prisma:generate`
- `npm run prisma:migrate`

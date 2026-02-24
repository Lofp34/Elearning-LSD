export const RELEASE_MODULE_SEPARATOR = "__";

export function buildReleaseModuleSlug(releaseId: string, contentKey: string) {
  return `${releaseId}${RELEASE_MODULE_SEPARATOR}${contentKey}`;
}

export function parseReleaseModuleSlug(slug: string) {
  const index = slug.indexOf(RELEASE_MODULE_SEPARATOR);
  if (index <= 0) return null;
  const releaseId = slug.slice(0, index).trim();
  const contentKey = slug.slice(index + RELEASE_MODULE_SEPARATOR.length).trim();
  if (!releaseId || !contentKey) return null;
  return { releaseId, contentKey };
}

export function buildTrackingAudioSlug(releaseVersion: number, contentKey: string) {
  return `v${releaseVersion}:${contentKey}`;
}

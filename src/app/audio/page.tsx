import { list } from "@vercel/blob";
import BrandMark from "@/components/BrandMark";

export const dynamic = "force-dynamic";

export default async function AudioListPage() {
  const { blobs } = await list({ prefix: "audio/", limit: 200 });

  return (
    <main style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <BrandMark subtitle="Fichiers audio" />
      </div>
      <h1>Audio files</h1>
      <p>Stored in Vercel Blob. Total: {blobs.length}</p>
      <ul style={{ lineHeight: 1.8 }}>
        {blobs.map((blob) => (
          <li key={blob.url}>
            <a href={blob.url} target="_blank" rel="noreferrer">
              {blob.pathname}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

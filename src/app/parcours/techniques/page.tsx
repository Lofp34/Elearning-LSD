import PartPage from "../[part]/page";

export const dynamic = "force-dynamic";

export default async function TechniquesPage() {
  return PartPage({ params: { part: "techniques" } });
}

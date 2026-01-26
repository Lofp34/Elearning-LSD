import PartPage from "../[part]/page";

export const dynamic = "force-dynamic";

export default async function PyramidePage() {
  return PartPage({ params: { part: "pyramide" } });
}

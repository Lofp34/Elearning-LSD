import PartPage from "../[part]/page";

export const dynamic = "force-dynamic";

export default async function MentalPage() {
  return PartPage({ params: { part: "mental" } });
}

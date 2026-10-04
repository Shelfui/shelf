import { ardManifest } from "@/lib/ard";

export const dynamic = "force-static";

export function GET() {
  return Response.json(ardManifest());
}

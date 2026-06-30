import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function callFootballData(path: string, apiKey: string) {
  const base = process.env.FOOTBALL_DATA_API_URL || "https://api.football-data.org/v4";
  const url = `${base}${path}`;
  const res = await fetch(url, { headers: { "X-Auth-Token": apiKey } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`football-data.org ${res.status} ${res.statusText} :: ${body.slice(0, 200)}`);
  }
  return res.json();
}

export const Route = createFileRoute("/api/public/worldcup-data")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => {
        const apiKey = process.env.FOOTBALL_DATA_API_KEY;
        const competition = process.env.WORLD_CUP_COMPETITION_CODE || "WC";
        const season = process.env.WORLD_CUP_SEASON || "2026";

        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "FOOTBALL_DATA_API_KEY not configured" }),
            { status: 500, headers: { "Content-Type": "application/json", ...CORS } },
          );
        }

        const [matchesR, teamsR, standingsR] = await Promise.allSettled([
          callFootballData(`/competitions/${competition}/matches?season=${season}`, apiKey),
          callFootballData(`/competitions/${competition}/teams?season=${season}`, apiKey),
          callFootballData(`/competitions/${competition}/standings`, apiKey),
        ]);

        if (matchesR.status === "rejected") {
          console.error("[worldcup-data] matches failed:", matchesR.reason);
          return new Response(
            JSON.stringify({ error: "matches_failed", detail: String(matchesR.reason) }),
            { status: 502, headers: { "Content-Type": "application/json", ...CORS } },
          );
        }

        if (teamsR.status === "rejected") console.warn("[worldcup-data] teams failed:", teamsR.reason);
        if (standingsR.status === "rejected") console.warn("[worldcup-data] standings failed:", standingsR.reason);

        const payload = {
          matches: matchesR.value,
          teams: teamsR.status === "fulfilled" ? teamsR.value : { teams: [] },
          standings: standingsR.status === "fulfilled" ? standingsR.value : { standings: [] },
          fetchedAt: new Date().toISOString(),
        };

        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=60",
            ...CORS,
          },
        });
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

// Este arquivo existe apenas para compatibilidade com o routeTree.gen.ts.
// Em modo SPA, os dados da API são buscados diretamente pelo serviço footballDataOrgService.ts
// via o proxy Vite configurado em vite.config.ts (/api/football-data/*)
export const Route = createFileRoute("/api/public/worldcup-data")({
  component: () => null,
});

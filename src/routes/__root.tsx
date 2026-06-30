import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { useEffect } from "react";

import { reportLovableError } from "../lib/lovable-error-reporting";
import { ChannelConfigProvider } from "../contexts/ChannelConfigContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50 px-4">
      <div className="max-w-md text-center">
        <div className="text-7xl mb-4">😅</div>
        <h1 className="text-6xl font-black text-amber-500 mb-2">404</h1>
        <h2 className="text-xl font-black text-gray-800 mb-2">Página não encontrada</h2>
        <p className="text-sm text-gray-500 mb-6">
          Esta página não existe ou foi movida. Volte para o início!
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-6 py-3 text-sm font-black text-white hover:bg-amber-600 transition-colors shadow-md"
        >
          🏠 Voltar para o início
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50 px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-4">🛠️</div>
        <h1 className="text-xl font-black text-gray-800 mb-2">Ops! Algo deu errado</h1>
        <p className="text-sm text-gray-500 mb-6">
          Ocorreu um erro inesperado. Você pode tentar novamente ou voltar para o início.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition-colors"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ChannelConfigProvider>
        <Outlet />
      </ChannelConfigProvider>
    </QueryClientProvider>
  );
}

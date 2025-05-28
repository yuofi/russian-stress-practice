import { env } from "./env";
import React from 'react'
import { createTRPCReact } from "@trpc/react-query";
import type { TrpcRouter } from "@russian-stress-practice/backend/src/router";
import Cookies from "js-cookie";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/react-query";
import { SuperJSON } from "superjson";

const trpc = createTRPCReact<TrpcRouter>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
const trpcClient = trpc.createClient({
  transformer: SuperJSON,
  links: [
    loggerLink({
      enabled: () => env.NODE_ENV === 'development',
    }),
    httpBatchLink({
      url: env.VITE_BACKEND_TRPC_URL,
      headers: () => {
        const token = Cookies.get('token');
        console.log('Using token for request:', token ? 'Token exists' : 'No token');
        return {
          ...(token && { Authorization: `Bearer ${token}` })
        };
      },
      fetch: (url, options) => {
        console.log('Making TRPC request to:', url);
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});

export const TrpcProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default trpc;

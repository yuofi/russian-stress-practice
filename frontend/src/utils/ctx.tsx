import type { TrpcRouterOutput } from "@russian-stress-practice/backend/src/router";
import React, { createContext, useContext } from "react";
import trpc from "./trpc";
import { Loader } from "../components/Loader";

export type AppContext = {
  me: TrpcRouterOutput["GetMe"]["me"];
};

const AppReactContext = createContext<AppContext>({
  me: null,
});

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, error, isLoading, isFetching, isError } = trpc.GetMe.useQuery();
  return (
    <AppReactContext.Provider
      value={{
        me: data?.me || null,
      }}
    >
      {isLoading || isFetching ? (
        <Loader size="45px" speed="1.2s" color="rgb(67, 73, 233)" />
      ) : isError ? (
        <p>Error: {error?.message}</p>
      ) : (
        children
      )}
    </AppReactContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppReactContext);
};

export const useMe = () => {
  const { me } = useAppContext();
  return me;
};

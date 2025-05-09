import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { type Express } from "express";
import { SuperJSON } from "superjson";
import { expressHandler } from "trpc-playground/handlers/express";
import { TrpcRouter, type trpcRouter } from "../router";
// import { AppContext } from "./ctx";
import { ExpectedError } from "../utils/error";
import { logger } from "../utils/logger";
import { ExpressRequest } from "../utils/types";
import { AppContext } from "./ctx";

export const getTrpcContext = ({ appContext, req }: {appContext: AppContext, req: ExpressRequest}) => ({
  ...appContext,
  me: (req as ExpressRequest).user || null,
})


export const getCreateTrpcContext =
  (appContext: AppContext) =>
  ({ req }: trpcExpress.CreateExpressContextOptions) =>
    getTrpcContext({ appContext, req: req as ExpressRequest })

type TrpcContext = inferAsyncReturnType<
  ReturnType<typeof getCreateTrpcContext>
>;

const trpc = initTRPC.context<TrpcContext>().create({
  transformer: SuperJSON,
  errorFormatter: ({shape, error}) => {
    const orginalError = error.cause as Error
    const expected = orginalError instanceof ExpectedError
    return {
      ...shape,
      data: {
        ...shape.data,
        expected
      }
    }
  }
});

export const createTrpcRouter = trpc.router

export const trpcLoggedProcedure = trpc.procedure.use(
  trpc.middleware(async ({ path, type, next, ctx, rawInput }) => {
    const start = Date.now()
    const result = await next()
    const durationMs = Date.now() - start
    const meta = {
      path,
      type,
      userId: ctx.me?.id || null,
      durationMs,
      rawInput: rawInput || null,
    }
    if (result.ok) {
      logger.info(`trpc:${type}:success`, 'Successfull request', { ...meta, output: result.data })
    } else {
      logger.error(`trpc:${type}:error`, result.error)
    }
    return result
  })
)

export const ApplyTrpcToExpressApp = async (
  app: Express,
  ctx: AppContext,
  trpcRouter: TrpcRouter,
) => {
  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: trpcRouter,
      createContext: getCreateTrpcContext(ctx),
    }),
  );

  app.use(
    "/trpc-playground",
    await expressHandler({
      trpcApiEndpoint: "/trpc",
      playgroundEndpoint: "/trpc-playground",
      router: trpcRouter,
      request: {
        superjson: true,
      },
    }),
  );
};

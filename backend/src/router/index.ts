
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTrpcRouter } from "../lib/trpc";
// @index('./**/index.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.split('/').slice(0, -1).join('/')}'`)
import { GetPracticeWordsTrpcRoute } from './Practice/GetPracticeWords'
import { GetUserStatsTrpcRoute } from './Practice/GetUserStats'
import { RecordPracticeTrpcRoute } from './Practice/RecordPractice'
import { GetAuthTrpcRoute } from './auth/GetAuth'
import { GetMeTrpcRoute } from './auth/GetMe'
// @endindex


export const trpcRouter = createTrpcRouter({
    // @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
    GetAuth: GetAuthTrpcRoute,
    GetMe: GetMeTrpcRoute,
    GetPracticeWords: GetPracticeWordsTrpcRoute,
    GetUserStats: GetUserStatsTrpcRoute,
    RecordPractice: RecordPracticeTrpcRoute,
    // @endindex
})


export type TrpcRouter = typeof trpcRouter;
export type TrpcRouterInput = inferRouterInputs<TrpcRouter>;
export type TrpcRouterOutput = inferRouterOutputs<TrpcRouter>;
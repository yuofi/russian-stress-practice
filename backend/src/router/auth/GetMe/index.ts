import { trpcLoggedProcedure } from "../../../lib/trpc";
import { toClientMe } from "../../../utils/models";

export const GetMeTrpcRoute = trpcLoggedProcedure.query(({ ctx }) => {
  return { me: toClientMe(ctx.me) };
});

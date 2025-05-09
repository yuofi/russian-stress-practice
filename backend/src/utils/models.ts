import type { User } from "@prisma/client";
import {pick} from "@russian-stress-practice/shared/src/pick"

export const toClientMe = (user: User | null) => {
  return user && pick(user, ["id", "name", "email", "score", "provider", "providerId", "accessToken"]);
};
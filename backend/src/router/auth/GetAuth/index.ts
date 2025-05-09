import { Provider } from "@prisma/client";
import jwt from "jsonwebtoken"
import { trpcLoggedProcedure } from "../../../lib/trpc";
import { env } from "../../../utils/env";
import { ExpectedError } from "../../../utils/error";
import { zOAuthLogin } from "./input";

export const GetAuthTrpcRoute = trpcLoggedProcedure
  .input(zOAuthLogin)
  .mutation(async ({ ctx, input }) => {
    const { provider, credentials } = input;

    try {
      // Try to find existing user
      const existingUser = await ctx.prisma.user.findUnique({
        where: {
          provider_providerId: {
            provider: provider as Provider,
            providerId: credentials.providerId,
          },
        },
      });

      let newOrUpdatedUser;
      
      if (existingUser) {
        // Update existing user's tokens
        newOrUpdatedUser = await ctx.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            accessToken: credentials.accessToken,
            refreshToken: credentials.refreshToken,
            tokenExpires: credentials.tokenExpires,
            name: credentials.name || existingUser.name,
          },
        });
      } else {
        // Create new user
        newOrUpdatedUser = await ctx.prisma.user.create({
          data: {
            email: credentials.email,
            name: credentials.name,
            provider: provider as Provider,
            providerId: credentials.providerId,
            accessToken: credentials.accessToken,
            refreshToken: credentials.refreshToken,
            tokenExpires: credentials.tokenExpires,
          },
        });
      }
      
      const appToken = jwt.sign(
        { sub: newOrUpdatedUser.id },
        env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      return { user: newOrUpdatedUser, token: appToken };
    } catch (error) {
      throw new ExpectedError("Failed to process authentication");
    }
  });

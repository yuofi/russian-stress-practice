import { env } from "../utils/env";
import { Express } from "express";
import { Passport } from "passport";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { logger } from "../utils/logger";
import { AppContext } from "./ctx";

export const applyPassportToExpressApp = (expressApp: Express, ctx: AppContext): void => {
  const passport = new Passport();

  // Стандартный payload: { sub: user.id, … }
  passport.use(
    new JWTStrategy(
      {
        secretOrKey: env.JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (jwtPayload: any, done) => {
        try {
          // logger.info("passport:jwt", "JWT payload received", { payload: jwtPayload });
          const userId = parseInt(jwtPayload.sub, 10);
          // logger.info("passport:jwt", "Looking for user with ID", { userId });
          
          const user = await ctx.prisma.user.findUnique({ where: { id: userId } });
          
          if (!user) {
            // logger.info("passport:jwt", "User not found", { userId });
            return done(null, false);
          }
          
          // logger.info("passport:jwt", "User authenticated successfully", { userId });
          return done(null, user);
        } catch (error) {
          // logger.error("passport:jwt", error);
          return done(error, false);
        }
      }
    )
  );

  expressApp.use((req, res, next) => {
    // если нет заголовка – пропускаем дальше
    if (!req.headers.authorization) {
      logger.info("passport:middleware", "No authorization header");
      return next();
    }

    logger.info("passport:middleware", "Authorization header found", { 
      header: req.headers.authorization.substring(0, 20) + '...' 
    });

    passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
      if (err) {
        logger.error("passport:middleware", err);
      }
      
      req.user = user ?? undefined;
      logger.info("passport:middleware", user ? "User attached to request" : "No user attached to request", {
        userId: user?.id
      });
      
      next();
    })(req, res, next);
  });
};

import { env } from "./utils/env";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { AppContext, createAppContext } from "./lib/ctx";
import { applyPassportToExpressApp } from "./lib/passport";
import { ApplyTrpcToExpressApp, getCreateTrpcContext } from "./lib/trpc";
import { trpcRouter } from "./router";
import { logger } from "./utils/logger";
import { applyServeWebApp } from "./utils/serveWebApp";


void (async () => {
  let ctx: AppContext | null = null;
  try {
    const app = express();
    ctx = createAppContext();
    
    app.use(
      cors({
        origin: ["http://https://russian-stress-practice.onrender.com/", "http://localhost:5173"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "x-trpc-source",
          "Access-Control-Allow-Origin",
          "Access-Control-Allow-Credentials",
        ],
      })
    );
    
   
    applyPassportToExpressApp(app, ctx);
    
    await ApplyTrpcToExpressApp(app, ctx, trpcRouter);
    await applyServeWebApp(app)
    app.options("*", cors());
    app.get("/ping", (req, res) => {
      res.send("pong");
    });
    
    app.use(
      (
        error: unknown,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        logger.error("express", error);
        if (res.headersSent) {
          next(error);
          return;
        }
        res.status(500).send("Internal server error");
      }
    );

    app.listen(env.PORT, () => {
      logger.info("app", `listening on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    logger.error("app", error);
    await ctx?.stop();
  }
})();

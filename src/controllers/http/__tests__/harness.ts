/**
 * In-process HTTP test harness for `controllers/http/*` routers.
 *
 * Mounts a real Express app + the real `errorHandler`, listens on an
 * ephemeral port, and exposes `fetch`-based calls — real HTTP, real
 * Express routing, mocked domain dependencies (services, rbac, pool).
 */
import express, { type Express, type IRouter } from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { errorHandler } from "../../../http/error-handler.js";

export interface TestApp {
  baseUrl: string;
  close(): Promise<void>;
}

export async function mountRouter(router: IRouter): Promise<TestApp> {
  const app: Express = express();
  app.use(express.json());
  app.use(router);
  app.use(errorHandler);
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const { port } = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((r) => server.close(() => r())),
  };
}

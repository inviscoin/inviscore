// @ts-nocheck
import server from "../dist/server.cjs";

export default async function (req: any, res: any) {
  // If the server exports a default async function, await it.
  const app = await (server.default || server)(req, res);
  return app;
}

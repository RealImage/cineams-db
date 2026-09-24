// API server between the React app and Postgres.
// Dev: `npm run dev` runs this alongside Vite, which proxies /api here.
import { serve } from "@hono/node-server";
import { describeDatabase } from "../db/client";
import { app } from "./app";

const port = Number(process.env.API_PORT ?? 3001);

serve({ fetch: app.fetch, port }, () => {
  console.log(`API listening on http://localhost:${port}/api (db ${describeDatabase()})`);
});

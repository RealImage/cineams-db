import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { query } from "./db";
import { routes } from "./routes";

export const app = new Hono().basePath("/api");

app.use("*", logger());

app.get("/health", async (c) => {
  await query("SELECT 1");
  return c.json({ ok: true });
});

for (const [path, router] of Object.entries(routes)) app.route(`/${path}`, router);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

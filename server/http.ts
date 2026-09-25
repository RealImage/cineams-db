import { HTTPException } from "hono/http-exception";

/** Throw from a handler to return a JSON error with that status. */
export const httpError = (status: 400 | 404 | 409 | 422 | 500, message: string) =>
  new HTTPException(status, { message });

export const notFound = (what: string) => httpError(404, `${what} not found`);

/** Current user for updated_by columns until the app has real auth. */
export const CURRENT_USER = "Harshit Thakkar";

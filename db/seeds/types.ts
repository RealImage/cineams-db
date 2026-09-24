import type pg from "pg";

/** A self-contained seeding step for tables added after 001_initial_schema. */
export interface ExtraSeeder {
  name: string;
  /** Tables it populates; truncated before a forced re-seed. */
  tables: string[];
  run(client: pg.Client): Promise<void>;
}

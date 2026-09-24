import { backfillsSeeder } from "./backfills";
import { credentialsSeeder } from "./credentials";
import { fleetSeeder } from "./fleet";
import { screenPulseSeeder } from "./screenPulse";
import type { ExtraSeeder } from "./types";

/** Run after the core seed, in this order. */
export const extraSeeders: ExtraSeeder[] = [backfillsSeeder, credentialsSeeder, fleetSeeder, screenPulseSeeder];

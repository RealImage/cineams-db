// Screen Pulse: environment rating snapshots, projection/sound quality checks
// and Lionis installs, laid onto real screens (FKs to screens.id) so theatre /
// chain / location names come from joins. Values follow the old mock
// generators in src/data/{environmentManagerData,projectionManagerData,
// screenManagerData}.ts but use a seeded PRNG so every run is identical.
import type pg from "pg";
import { insertMany } from "../client";
import type { RatingStatus } from "../../src/data/environmentManagerData";
import type { ExtraSeeder } from "./types";

const ENVIRONMENT_SCREENS = 200; // mock environmentScreenData length
const PROJECTION_SCREENS = 200; // mock projectionScreenData length
const PROJECTION_OFFSET = 20; // so env / projection coverage differ per theatre
const QUALITY_CHECKS_PER_SCREEN = 4; // weekly history; the UI shows the latest
const LIONIS_SHARE = 0.6; // mock: Math.random() > 0.4

const NAMES = ["John Smith", "Sarah Connor", "James Lee", "Maria Garcia", "Anil Kumar", "Kim Soo-jin", "Carlos Mendez", "Emily Watson", "Hans Mueller", "Yuki Tanaka"];

const PROJECTION_LABELS = {
  ok: ["Excellent clarity", "Sharp focus", "Good brightness", "Uniform illumination", "Accurate colors"],
  bad: ["Focus drift detected", "Low brightness", "Uneven illumination", "Color shift", "Flicker detected"],
};
const SOUND_LABELS = {
  ok: ["Balanced output", "Clear dialogue", "Good surround", "Low distortion", "Proper calibration"],
  bad: ["Bass imbalance", "Dialogue unclear", "Surround dropout", "High distortion", "Calibration needed"],
};

/** mulberry32 — small deterministic PRNG. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = () => number;
const pick = <T>(rand: Rand, list: T[]) => list[Math.floor(rand() * list.length)];

function status(rand: Rand): RatingStatus {
  const r = rand();
  if (r < 0.45) return "within_theatre_baseline";
  if (r < 0.8) return "within_recommended_baseline";
  return "out_of_range";
}

function temperature(rand: Rand, s: RatingStatus) {
  let v: number;
  if (s === "within_theatre_baseline") v = 20 + rand() * 4;
  else if (s === "within_recommended_baseline") v = rand() > 0.5 ? 18 + rand() * 2 : 24 + rand() * 2;
  else v = rand() > 0.5 ? 15 + rand() * 2 : 27 + rand() * 5;
  return Math.round(v * 10) / 10;
}

function humidity(rand: Rand, s: RatingStatus) {
  let v: number;
  if (s === "within_theatre_baseline") v = 40 + rand() * 15;
  else if (s === "within_recommended_baseline") v = rand() > 0.5 ? 30 + rand() * 10 : 55 + rand() * 10;
  else v = rand() > 0.5 ? 15 + rand() * 15 : 65 + rand() * 20;
  return Math.round(v);
}

function dust(rand: Rand, s: RatingStatus) {
  let v: number;
  if (s === "within_theatre_baseline") v = 5 + rand() * 20;
  else if (s === "within_recommended_baseline") v = 25 + rand() * 25;
  else v = 50 + rand() * 100;
  return Math.round(v);
}

const between = (rand: Rand, start: string, end: string) => {
  const a = Date.parse(start);
  return new Date(a + Math.floor(rand() * (Date.parse(end) - a)));
};

export const screenPulseSeeder: ExtraSeeder = {
  name: "screenPulse",
  // screen_appliances is shared with the core seed, so Lionis rows are
  // replaced by appliance_type in run() rather than truncated.
  tables: ["screen_environment_summaries", "screen_quality_checks"],

  async run(client: pg.Client) {
    // Pulse-enabled screens; the 25 with sensor history first so their
    // environment ratings sit next to real readings.
    const { rows: pulseScreens } = await client.query<{ screen_id: string }>(`
      SELECT sa.screen_id
      FROM screen_appliances sa
      WHERE sa.appliance_type = 'pulse' AND sa.status <> 'Inactive'
      ORDER BY EXISTS (SELECT 1 FROM screen_sensor_readings r WHERE r.screen_id = sa.screen_id) DESC, sa.screen_id`);

    // Environment ratings: i-th mock record -> i-th Pulse screen.
    const envRand = prng(4001);
    const statuses = () => Array.from({ length: 6 }, () => status(envRand));
    await insertMany(client, "screen_environment_summaries", pulseScreens.slice(0, ENVIRONMENT_SCREENS).map(({ screen_id }) => {
      const score = Math.floor(envRand() * 121);
      const [ont, onh, ond, offt, offh, offd] = statuses();
      return {
        screen_id,
        score,
        on_temperature: temperature(envRand, ont), on_temperature_status: ont,
        on_humidity: humidity(envRand, onh), on_humidity_status: onh,
        on_dust: dust(envRand, ond), on_dust_status: ond,
        off_temperature: temperature(envRand, offt), off_temperature_status: offt,
        off_humidity: humidity(envRand, offh), off_humidity_status: offh,
        off_dust: dust(envRand, offd), off_dust_status: offd,
      };
    }));

    // Projection / sound quality: weekly checks, newest last week's pattern.
    const qRand = prng(4002);
    const today = new Date();
    today.setUTCHours(6, 0, 0, 0);
    const checks = pulseScreens.slice(PROJECTION_OFFSET, PROJECTION_OFFSET + PROJECTION_SCREENS).flatMap(({ screen_id }) =>
      Array.from({ length: QUALITY_CHECKS_PER_SCREEN }, (_, week) => {
        const projectionOk = qRand() < 0.65;
        const soundOk = qRand() < 0.65;
        return {
          screen_id,
          checked_at: new Date(today.getTime() - week * 7 * 86_400_000),
          score: Math.floor(qRand() * 100) + 1,
          projection_quality: pick(qRand, projectionOk ? PROJECTION_LABELS.ok : PROJECTION_LABELS.bad),
          projection_ok: projectionOk,
          sound_quality: pick(qRand, soundOk ? SOUND_LABELS.ok : SOUND_LABELS.bad),
          sound_ok: soundOk,
        };
      }),
    );
    await insertMany(client, "screen_quality_checks", checks);

    // Lionis installs across screens of Pulse-enrolled theatres.
    await client.query("DELETE FROM screen_appliances WHERE appliance_type = 'lionis'");
    const { rows: theatreScreens } = await client.query<{ id: string }>(`
      SELECT s.id FROM screens s
      JOIN theatre_appliance_configs cfg ON cfg.theatre_id = s.theatre_id AND cfg.appliance_type = 'pulse'
      WHERE s.status <> 'Deleted'
      ORDER BY s.id`);
    const lRand = prng(4003);
    const lionis = theatreScreens.flatMap(({ id }, i) => {
      const installed = lRand() < LIONIS_SHARE;
      const installedAt = between(lRand, "2023-01-01", "2025-12-31");
      const updatedAt = between(lRand, "2025-01-01", "2026-03-08");
      if (!installed) return [];
      return [{
        screen_id: id,
        appliance_type: "lionis",
        serial_number: `LSN-${2000 + i}`,
        status: "Active",
        installed_at: installedAt,
        installed_by: NAMES[(i + 3) % NAMES.length],
        updated_at: updatedAt,
        updated_by: NAMES[(i + 5) % NAMES.length],
      }];
    });
    // The updated_at trigger only fires on UPDATE, so the seeded dates stick.
    await insertMany(client, "screen_appliances", lionis);
  },
};

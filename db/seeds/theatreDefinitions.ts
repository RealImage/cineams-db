import { projectionExperiences } from "../../src/data/screenExperienceData";
import type { ExtraSeeder } from "./types";

// Sample theatre-definition values the WTF panel reads: ISP download
// restrictions, auto-ingestion and KDM auto-ingestion slots on theatres, and
// projection type / experiences / audio experiences on screens. Only keys
// that aren't set yet are filled in, so edits made in the app are kept.

const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const contentTypes = ["FTR", "TLR", "ADV", "SHT", "MTC"];

/** A small deterministic hash so the same theatre always gets the same sample. */
const hash = (s: string) => Array.from(s).reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

const slot = (id: string, day: string, startTime: string, endTime: string) => ({ id, day, startTime, endTime });

function theatreSample(id: string) {
  const h = hash(id);
  const out: Record<string, unknown> = {};
  if (h % 3 !== 0) {
    // Busy-hours restriction: no big downloads during shows
    const [start, end] = h % 2 ? ["10:00", "23:00"] : ["12:00", "22:00"];
    out.downloadRestrictionsEnabled = true;
    out.downloadRestrictions = Object.fromEntries(days.map((d) => [d, { startTime: d === "sunday" ? "09:00" : start, endTime: end }]));
  }
  if (h % 4 !== 0) {
    out.autoIngestOfContentEnabled = true;
    out.autoIngestContentTypes = contentTypes.slice(0, 2 + (h % 4));
    if (h % 2 === 0) out.autoIngestTimeSlots = weekDays.map((d, i) => slot(`ai-${id}-${i}`, d, "01:00", "06:00"));
  }
  if (h % 5 !== 0) out.kdmAutoIngestTimeSlots = [slot(`kdm-${id}-0`, "Thursday", "00:00", "04:00"), slot(`kdm-${id}-1`, "Friday", "00:00", "04:00")];
  return out;
}

function screenSample(id: string, sound: { soundMixes?: string[]; iabSupported?: boolean } | null) {
  const h = hash(id);
  const premium = projectionExperiences.filter((x) => x !== "Normal");
  const experiences = h % 4 === 0 ? [premium[h % premium.length], ...(h % 8 === 0 ? [premium[(h >> 3) % premium.length]] : [])] : ["Normal"];
  const mixes = (sound?.soundMixes ?? []).join(" ");
  const audio = [
    ...(/5\.1/.test(mixes) || !mixes ? ["5.1"] : []),
    ...(/7\.1/.test(mixes) ? ["7.1"] : []),
    ...(sound?.iabSupported ? ["IAB"] : []),
  ];
  return {
    projection: { projectionType: h % 10 === 0 ? "E-Cinema" : h % 23 === 0 ? "Film" : "DCI", experiences: Array.from(new Set(experiences)) },
    sound: { audioExperiences: audio },
  };
}

export const theatreDefinitionsSeeder: ExtraSeeder = {
  name: "theatreDefinitions",
  // Updates existing theatres and screens; nothing to truncate
  tables: [],
  async run(client) {
    const { rows: theatres } = await client.query<{ id: string }>("SELECT id FROM theatres");
    for (const t of theatres) {
      // Existing keys win (`sample || existing`)
      await client.query(`UPDATE theatres SET delivery_settings = $2::jsonb || delivery_settings WHERE id = $1`, [t.id, JSON.stringify(theatreSample(t.id))]);
    }
    const { rows: screens } = await client.query<{ id: string; sound: { soundMixes?: string[]; iabSupported?: boolean } | null }>("SELECT id, sound FROM screens");
    for (const s of screens) {
      const sample = screenSample(s.id, s.sound);
      await client.query(
        `UPDATE screens SET projection = $2::jsonb || coalesce(projection, '{}'), sound = $3::jsonb || coalesce(sound, '{}') WHERE id = $1`,
        [s.id, JSON.stringify(sample.projection), JSON.stringify(sample.sound)],
      );
    }
  },
};

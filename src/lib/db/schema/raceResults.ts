import { sql } from "drizzle-orm";
import { varchar, integer, timestamp, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { races } from "./races";
import { drivers } from "./drivers";
import { type getRaceResults } from "@/lib/api/raceResults/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const raceResults = pgTable("race_results", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  raceId: varchar("race_id", { length: 256 })
    .references(() => races.id, { onDelete: "cascade" })
    .notNull(),
  driverId: varchar("driver_id", { length: 256 })
    .references(() => drivers.id, { onDelete: "cascade" })
    .notNull(),
  position: integer("position"),
  time: varchar("time", { length: 256 }),
  laps: integer("laps"),
  grid: varchar("grid", { length: 256 }),

  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for raceResults - used to validate API requests
const baseSchema = createSelectSchema(raceResults).omit(timestamps);

export const insertRaceResultSchema = createInsertSchema(raceResults).omit(timestamps);
export const insertRaceResultParams = baseSchema
  .extend({
    raceId: z.coerce.string().min(1),
    driverId: z.coerce.string().min(1),
    position: z.coerce.number(),
    laps: z.coerce.number(),
  })
  .omit({
    id: true,
  });

export const updateRaceResultSchema = baseSchema;
export const updateRaceResultParams = baseSchema.extend({
  raceId: z.coerce.string().min(1),
  driverId: z.coerce.string().min(1),
  position: z.coerce.number(),
  laps: z.coerce.number(),
});
export const raceResultIdSchema = baseSchema.pick({ id: true });

// Types for raceResults - used to type API request params and within Components
export type RaceResult = typeof raceResults.$inferSelect;
export type NewRaceResult = z.infer<typeof insertRaceResultSchema>;
export type NewRaceResultParams = z.infer<typeof insertRaceResultParams>;
export type UpdateRaceResultParams = z.infer<typeof updateRaceResultParams>;
export type RaceResultId = z.infer<typeof raceResultIdSchema>["id"];

// this type infers the return from getRaceResults() - meaning it will include any joins
export type CompleteRaceResult = Awaited<ReturnType<typeof getRaceResults>>["raceResults"][number];

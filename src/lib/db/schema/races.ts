import { integer, text, varchar, timestamp, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { type getRaces } from "@/lib/api/races/queries";

import { nanoid } from "@/lib/utils";


export const races = pgTable('races', {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => nanoid()),
  raceId: integer("race_id").notNull(),
  name: text("name").notNull(),
  country: varchar("country", { length: 256 }).notNull(),
  city: varchar("city", { length: 256 }).notNull(),
  circuit: text("circuit").notNull(),
  season: integer("season").notNull(),
  date: timestamp("date").notNull()
}, (races) => {
  return {
    raceIdIndex: uniqueIndex('race_race_id_idx').on(races.raceId),
  }
});


// Schema for races - used to validate API requests
const baseSchema = createSelectSchema(races)

export const insertRaceSchema = createInsertSchema(races);
export const insertRaceParams = baseSchema.extend({
  raceId: z.coerce.number(),
  season: z.coerce.number(),
  date: z.coerce.date()
}).omit({
  id: true
});

export const updateRaceSchema = baseSchema;
export const updateRaceParams = baseSchema.extend({
  raceId: z.coerce.number(),
  season: z.coerce.number(),
  date: z.coerce.string().min(1)
})
export const raceIdSchema = baseSchema.pick({ id: true });

// Types for races - used to type API request params and within Components
export type Race = typeof races.$inferSelect;
export type NewRace = z.infer<typeof insertRaceSchema>;
export type NewRaceParams = z.infer<typeof insertRaceParams>;
export type UpdateRaceParams = z.infer<typeof updateRaceParams>;
export type RaceId = z.infer<typeof raceIdSchema>["id"];

// this type infers the return from getRaces() - meaning it will include any joins
export type CompleteRace = Awaited<ReturnType<typeof getRaces>>["races"][number];


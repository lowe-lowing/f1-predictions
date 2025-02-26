import { sql } from "drizzle-orm";
import { integer, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "@/lib/db/schema/auth";
import { type getSeasonPoints } from "@/lib/api/seasonPoints/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const seasonPoints = pgTable("season_points", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  year: integer("year").notNull(),
  points: integer("points").notNull().default(0),
  userId: varchar("user_id", { length: 256 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for seasonPoints - used to validate API requests
const baseSchema = createSelectSchema(seasonPoints).omit(timestamps);

export const insertSeasonPointSchema = createInsertSchema(seasonPoints).omit(timestamps);
export const insertSeasonPointParams = baseSchema
  .extend({
    year: z.coerce.number(),
    points: z.coerce.number(),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updateSeasonPointSchema = baseSchema;
export const updateSeasonPointParams = baseSchema
  .extend({
    year: z.coerce.number(),
    points: z.coerce.number(),
  })
  .omit({
    userId: true,
  });
export const seasonPointIdSchema = baseSchema.pick({ id: true });

// Types for seasonPoints - used to type API request params and within Components
export type SeasonPoint = typeof seasonPoints.$inferSelect;
export type NewSeasonPoint = z.infer<typeof insertSeasonPointSchema>;
export type NewSeasonPointParams = z.infer<typeof insertSeasonPointParams>;
export type UpdateSeasonPointParams = z.infer<typeof updateSeasonPointParams>;
export type SeasonPointId = z.infer<typeof seasonPointIdSchema>["id"];

// this type infers the return from getSeasonPoints() - meaning it will include any joins
export type CompleteSeasonPoint = Awaited<ReturnType<typeof getSeasonPoints>>["seasonPoints"][number];

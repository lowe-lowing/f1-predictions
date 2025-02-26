import { sql } from "drizzle-orm";
import { varchar, integer, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { races } from "./races";
import { drivers } from "./drivers";
import { seasonPoints } from "./seasonPoints";
import { type getPointHistories } from "@/lib/api/pointHistory/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const pointHistory = pgTable("point_history", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  seasonPointId: varchar("season_point_id", { length: 256 })
    .references(() => seasonPoints.id, { onDelete: "cascade" })
    .notNull(),
  raceId: varchar("race_id", { length: 256 })
    .references(() => races.id, { onDelete: "cascade" })
    .notNull(),
  driverId: varchar("driver_id", { length: 256 })
    .references(() => drivers.id)
    .notNull(),
  pointForPosition: integer("point_for_position"),

  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for pointHistory - used to validate API requests
const baseSchema = createSelectSchema(pointHistory).omit(timestamps);

export const insertPointHistorySchema = createInsertSchema(pointHistory).omit(timestamps);
export const insertPointHistoryParams = baseSchema
  .extend({
    raceId: z.coerce.string().min(1),
    driverId: z.coerce.string().min(1),
    pointForPosition: z.coerce.number(),
    seasonPointId: z.coerce.string().min(1),
  })
  .omit({
    id: true,
  });

export const updatePointHistorySchema = baseSchema;
export const updatePointHistoryParams = baseSchema.extend({
  raceId: z.coerce.string().min(1),
  driverId: z.coerce.string().min(1),
  pointForPosition: z.coerce.number(),
  seasonPointId: z.coerce.string().min(1),
});
export const pointHistoryIdSchema = baseSchema.pick({ id: true });

// Types for pointHistory - used to type API request params and within Components
export type PointHistory = typeof pointHistory.$inferSelect;
export type NewPointHistory = z.infer<typeof insertPointHistorySchema>;
export type NewPointHistoryParams = z.infer<typeof insertPointHistoryParams>;
export type UpdatePointHistoryParams = z.infer<typeof updatePointHistoryParams>;
export type PointHistoryId = z.infer<typeof pointHistoryIdSchema>["id"];

// this type infers the return from getPointHistory() - meaning it will include any joins
export type CompletePointHistory = Awaited<ReturnType<typeof getPointHistories>>["pointHistory"][number];

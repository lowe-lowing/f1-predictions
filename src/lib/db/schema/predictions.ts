import { sql } from "drizzle-orm";
import { integer, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "@/lib/db/schema/auth";
import { type getPredictions } from "@/lib/api/predictions/queries";

import { nanoid, timestamps } from "@/lib/utils";


export const predictions = pgTable('predictions', {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => nanoid()),
  raceId: integer("race_id").notNull(),
  pos1Driver: integer("pos_1_driver"),
  pos2Driver: integer("pos_2_driver"),
  pos3Driver: integer("pos_3_driver"),
  pos4Driver: integer("pos_4_driver"),
  pos5Driver: integer("pos_5_driver"),
  userId: varchar("user_id", { length: 256 }).references(() => users.id, { onDelete: "cascade" }).notNull(),

  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),

});


// Schema for predictions - used to validate API requests
const baseSchema = createSelectSchema(predictions).omit(timestamps)

export const insertPredictionSchema = createInsertSchema(predictions).omit(timestamps);
export const insertPredictionParams = baseSchema.extend({
  raceId: z.coerce.number().nullable(),
  pos1Driver: z.coerce.number().nullable(),
  pos2Driver: z.coerce.number().nullable(),
  pos3Driver: z.coerce.number().nullable(),
  pos4Driver: z.coerce.number().nullable(),
  pos5Driver: z.coerce.number().nullable(),
}).omit({
  id: true,
  userId: true
});

export const updatePredictionSchema = baseSchema;
export const updatePredictionParams = baseSchema.extend({
  raceId: z.coerce.number(),
  pos1Driver: z.coerce.number(),
  pos2Driver: z.coerce.number(),
  pos3Driver: z.coerce.number(),
  pos4Driver: z.coerce.number(),
  pos5Driver: z.coerce.number(),
}).omit({
  userId: true
});
export const predictionIdSchema = baseSchema.pick({ id: true });

// Types for predictions - used to type API request params and within Components
export type Prediction = typeof predictions.$inferSelect;
export type NewPrediction = z.infer<typeof insertPredictionSchema>;
export type NewPredictionParams = z.infer<typeof insertPredictionParams>;
export type UpdatePredictionParams = z.infer<typeof updatePredictionParams>;
export type PredictionId = z.infer<typeof predictionIdSchema>["id"];

// this type infers the return from getPredictions() - meaning it will include any joins
export type CompletePrediction = Awaited<ReturnType<typeof getPredictions>>["predictions"][number];


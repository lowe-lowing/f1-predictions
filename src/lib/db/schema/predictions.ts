import { sql } from "drizzle-orm";
import { varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "@/lib/db/schema/auth";
import { type getPredictions } from "@/lib/api/predictions/queries";

import { nanoid, timestamps } from "@/lib/utils";
import { drivers } from "./drivers";

export const predictions = pgTable("predictions", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  raceId: varchar("race_id").notNull(),
  pos1DriverId: varchar("pos_1_driver", { length: 256 }).references(() => drivers.id),
  pos2DriverId: varchar("pos_2_driver", { length: 256 }).references(() => drivers.id),
  pos3DriverId: varchar("pos_3_driver", { length: 256 }).references(() => drivers.id),
  pos4DriverId: varchar("pos_4_driver", { length: 256 }).references(() => drivers.id),
  pos5DriverId: varchar("pos_5_driver", { length: 256 }).references(() => drivers.id),
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

// Schema for predictions - used to validate API requests
const baseSchema = createSelectSchema(predictions).omit(timestamps);

export const insertPredictionSchema = createInsertSchema(predictions).omit(timestamps);
export const insertPredictionParams = baseSchema
  .extend({
    pos1DriverId: z.coerce.string().nullable(),
    pos2DriverId: z.coerce.string().nullable(),
    pos3DriverId: z.coerce.string().nullable(),
    pos4DriverId: z.coerce.string().nullable(),
    pos5DriverId: z.coerce.string().nullable(),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updatePredictionSchema = baseSchema;
export const updatePredictionParams = baseSchema
  .extend({
    pos1DriverId: z.coerce.string().nullable(),
    pos2DriverId: z.coerce.string().nullable(),
    pos3DriverId: z.coerce.string().nullable(),
    pos4DriverId: z.coerce.string().nullable(),
    pos5DriverId: z.coerce.string().nullable(),
  })
  .omit({
    userId: true,
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

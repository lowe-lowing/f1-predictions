import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { type getDrivers } from "@/lib/api/drivers/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const drivers = pgTable("drivers", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: varchar("name", { length: 256 }).notNull(),
  number: integer("number"),
  image: text("image"),
  team: varchar("team", { length: 256 }),
  season: integer("season"),
  active: boolean("active").notNull().default(false),

  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for drivers - used to validate API requests
const baseSchema = createSelectSchema(drivers).omit(timestamps);

export const insertDriverSchema = createInsertSchema(drivers).omit(timestamps);
export const insertDriverParams = baseSchema
  .extend({
    number: z.coerce.number(),
    season: z.coerce.number(),
    active: z.coerce.boolean().default(false),
  })
  .omit({
    id: true,
  });

export const updateDriverSchema = baseSchema;
export const updateDriverParams = baseSchema.extend({
  number: z.coerce.number(),
  season: z.coerce.number(),
});
export const driverIdSchema = baseSchema.pick({ id: true });

// Types for drivers - used to type API request params and within Components
export type Driver = typeof drivers.$inferSelect;
export type NewDriver = z.infer<typeof insertDriverSchema>;
export type NewDriverParams = z.infer<typeof insertDriverParams>;
export type UpdateDriverParams = z.infer<typeof updateDriverParams>;
export type DriverId = z.infer<typeof driverIdSchema>["id"];

// this type infers the return from getDrivers() - meaning it will include any joins
export type CompleteDriver = Awaited<ReturnType<typeof getDrivers>>["drivers"][number];

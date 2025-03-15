import { sql } from "drizzle-orm";
import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { type getUserPermissions } from "@/lib/api/userPermissions/queries";
import { users } from "@/lib/db/schema/auth";

import { nanoid, timestamps } from "@/lib/utils";

export const userPermissions = pgTable("user_permissions", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  canEditDrivers: boolean("can_edit_drivers"),
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

// Schema for userPermissions - used to validate API requests
const baseSchema = createSelectSchema(userPermissions).omit(timestamps);

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit(timestamps);
export const insertUserPermissionParams = baseSchema
  .extend({
    canEditDrivers: z.coerce.boolean(),
  })
  .omit({
    id: true,
  });

export const updateUserPermissionSchema = baseSchema;
export const updateUserPermissionParams = baseSchema.extend({
  canEditDrivers: z.coerce.boolean(),
});
export const userPermissionIdSchema = baseSchema.pick({ id: true });

// Types for userPermissions - used to type API request params and within Components
export type UserPermission = typeof userPermissions.$inferSelect;
export type NewUserPermission = z.infer<typeof insertUserPermissionSchema>;
export type NewUserPermissionParams = z.infer<typeof insertUserPermissionParams>;
export type UpdateUserPermissionParams = z.infer<typeof updateUserPermissionParams>;
export type UserPermissionId = z.infer<typeof userPermissionIdSchema>["id"];

// this type infers the return from getUserPermissions() - meaning it will include any joins
export type CompleteUserPermission = Awaited<ReturnType<typeof getUserPermissions>>["userPermissions"][number];

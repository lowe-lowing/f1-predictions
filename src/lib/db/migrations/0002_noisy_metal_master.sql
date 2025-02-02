CREATE TABLE "races" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"race_id" integer NOT NULL,
	"name" text NOT NULL,
	"country" varchar(256) NOT NULL,
	"city" varchar(256) NOT NULL,
	"circuit" text NOT NULL,
	"season" integer NOT NULL,
	"date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "race_race_id_idx" ON "races" USING btree ("race_id");
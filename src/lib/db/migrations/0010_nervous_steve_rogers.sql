CREATE TABLE "race_results" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"race_id" varchar(256) NOT NULL,
	"driver_id" varchar(256) NOT NULL,
	"position" integer NOT NULL,
	"time" varchar(256),
	"laps" integer,
	"grid" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "race_result_race_id_idx" ON "race_results" USING btree ("race_id");
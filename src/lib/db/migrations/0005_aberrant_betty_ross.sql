CREATE TABLE "point_history" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"season_point_id" varchar(256) NOT NULL,
	"race_id" varchar(256) NOT NULL,
	"driver_id" varchar(256) NOT NULL,
	"point_for_position" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "season_points" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "point_history" ADD CONSTRAINT "point_history_season_point_id_season_points_id_fk" FOREIGN KEY ("season_point_id") REFERENCES "public"."season_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_history" ADD CONSTRAINT "point_history_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_history" ADD CONSTRAINT "point_history_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_points" ADD CONSTRAINT "season_points_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
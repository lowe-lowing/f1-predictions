CREATE TABLE "predictions" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"race_id" integer NOT NULL,
	"pos_1_driver" integer,
	"pos_2_driver" integer,
	"pos_3_driver" integer,
	"pos_4_driver" integer,
	"pos_5_driver" integer,
	"user_id" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
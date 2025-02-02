CREATE TABLE "drivers" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"number" integer,
	"name" varchar(256) NOT NULL,
	"image" text,
	"team" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

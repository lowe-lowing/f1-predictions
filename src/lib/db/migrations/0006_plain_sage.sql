ALTER TABLE "predictions" ALTER COLUMN "pos_1_driver" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "predictions" ALTER COLUMN "pos_2_driver" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "predictions" ALTER COLUMN "pos_3_driver" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "predictions" ALTER COLUMN "pos_4_driver" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "predictions" ALTER COLUMN "pos_5_driver" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_pos_1_driver_drivers_id_fk" FOREIGN KEY ("pos_1_driver") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_pos_2_driver_drivers_id_fk" FOREIGN KEY ("pos_2_driver") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_pos_3_driver_drivers_id_fk" FOREIGN KEY ("pos_3_driver") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_pos_4_driver_drivers_id_fk" FOREIGN KEY ("pos_4_driver") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_pos_5_driver_drivers_id_fk" FOREIGN KEY ("pos_5_driver") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;
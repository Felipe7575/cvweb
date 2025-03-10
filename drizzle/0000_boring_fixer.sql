-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."user_statuses" AS ENUM('ACTIVE', 'DEACTIVATED', 'NEW');--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"image" text,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessiontoken" text PRIMARY KEY NOT NULL,
	"userid" text,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"provider" text NOT NULL,
	"provideraccountid" text NOT NULL,
	"userid" text,
	"access_token" text,
	"expires_at" timestamp,
	CONSTRAINT "accounts_pkey" PRIMARY KEY("provider","provideraccountid")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_sessions_userid" ON "sessions" USING btree ("userid" text_ops);--> statement-breakpoint
CREATE INDEX "idx_accounts_userid" ON "accounts" USING btree ("userid" text_ops);
*/
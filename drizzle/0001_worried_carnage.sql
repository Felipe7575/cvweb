CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"original_name" text,
	"uploaded_at" timestamp DEFAULT now()
);

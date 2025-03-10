import { sql } from "drizzle-orm"
import {
	boolean,
	timestamp,
	pgTable,
	text,
	primaryKey,
	integer,
	uuid,
	check,
	foreignKey,
	unique,
  } from "drizzle-orm/pg-core"

   

   
  export const users = pgTable("user", {
	id: text("id")
	  .primaryKey()
	  .$defaultFn(() => crypto.randomUUID()),
	name: text("name"),
	email: text("email").unique(),
	emailVerified: timestamp("emailVerified", { mode: "date" }),
	image: text("image"),
  })
   
  export const accounts = pgTable(
	"account",
	{
	  userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	  type: text("type").notNull(),
	  provider: text("provider").notNull(),
	  providerAccountId: text("providerAccountId").notNull(),
	  refresh_token: text("refresh_token"),
	  access_token: text("access_token"),
	  expires_at: integer("expires_at"),
	  token_type: text("token_type"),
	  scope: text("scope"),
	  id_token: text("id_token"),
	  session_state: text("session_state"),
	},
	(account) => [
	  {
		compoundKey: primaryKey({
		  columns: [account.provider, account.providerAccountId],
		}),
	  },
	]
  )
   
  export const sessions = pgTable("session", {
	sessionToken: text("sessionToken").primaryKey(),
	userId: text("userId")
	  .notNull()
	  .references(() => users.id, { onDelete: "cascade" }),
	expires: timestamp("expires", { mode: "date" }).notNull(),
  })
   
  export const verificationTokens = pgTable(
	"verificationToken",
	{
	  identifier: text("identifier").notNull(),
	  token: text("token").notNull(),
	  expires: timestamp("expires", { mode: "date" }).notNull(),
	},
	(verificationToken) => [
	  {
		compositePk: primaryKey({
		  columns: [verificationToken.identifier, verificationToken.token],
		}),
	  },
	]
  )
   
  export const authenticators = pgTable(
	"authenticator",
	{
	  credentialID: text("credentialID").notNull().unique(),
	  userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	  providerAccountId: text("providerAccountId").notNull(),
	  credentialPublicKey: text("credentialPublicKey").notNull(),
	  counter: integer("counter").notNull(),
	  credentialDeviceType: text("credentialDeviceType").notNull(),
	  credentialBackedUp: boolean("credentialBackedUp").notNull(),
	  transports: text("transports"),
	},
	(authenticator) => [
	  {
		compositePK: primaryKey({
		  columns: [authenticator.userId, authenticator.credentialID],
		}),
	  },
	]
  )

  export const file = pgTable("file", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	fileUrl: text("file_url").notNull(),
	originalName: text("original_name"),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	check("file_file_url_check", sql`length(file_url) > 0`),
]);

export const cvEvaluation = pgTable("cv_evaluation", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fileId: uuid("file_id").notNull(),
	aspect: text().notNull(),
	score: integer(),
	feedback: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [file.id],
			name: "cv_evaluations_file_id_fkey"
		}).onDelete("cascade"),
	unique("cv_evaluations_file_id_aspect_key").on(table.fileId, table.aspect),
	check("cv_evaluations_score_check", sql`(score >= 1) AND (score <= 10)`),
]);

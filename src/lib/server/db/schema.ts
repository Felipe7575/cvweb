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
import { z } from "zod"

   

   
  export const user = pgTable("user", {
	id: text("id")
	  .primaryKey()
	  .$defaultFn(() => crypto.randomUUID()),
	name: text("name"),
	email: text("email").unique(),
	emailVerified: timestamp("emailVerified", { mode: "date" }),
	image: text("image"),
  })
   
  export const account = pgTable(
	"account",
	{
	  userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
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
   
  export const session = pgTable("session", {
	sessionToken: text("sessionToken").primaryKey(),
	userId: text("userId")
	  .notNull()
	  .references(() => user.id, { onDelete: "cascade" }),
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
   
  export const authenticator = pgTable(
	"authenticator",
	{
	  credentialID: text("credentialID").notNull().unique(),
	  userId: text("userId")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
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
    fileId: uuid("file_id").notNull().references(() => file.id, { onDelete: "cascade" }),
    aspect: text().notNull(),
    score: integer(),
    feedback: text().notNull(),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});


export const credit = pgTable("credits", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("userid").notNull(),
	balance: integer().default(0).notNull(),
	lastUpdated: timestamp("lastupdated",{ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "credits_userid_fk"
		}).onDelete("cascade"),
	unique("credits_userid_key").on(table.userId),
]);

export const transaction = pgTable("transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("userid").notNull(),
	amount: integer().notNull(),
	creditsPurchased: integer("creditspurchased").notNull(),
	status: text().default('pending').notNull(),
	provider: text().notNull(),
	transactionId: text("transactionid"),
	currency: text().default('ARS').notNull(),
	createdAt: timestamp("createdat",{ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updatedat",{ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "transactions_userid_fk"
		}).onDelete("cascade"),
	unique("transactions_transactionid_key").on(table.transactionId),
	check("transactions_status_check", sql`status = ANY (ARRAY['pending'::text, 'processing'::text, 'approved'::text, 'completed'::text, 'failed'::text, 'canceled'::text])`),
]);

export const creditHistory = pgTable("credit_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("userid").notNull(),
	changeAmount: integer("changeamount").notNull(),
	reason: text().notNull(),
	transactionId: uuid("transactionid"),
	createdAt: timestamp("createdat",{ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "credithistory_userid_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.transactionId],
			foreignColumns: [transaction.id],
			name: "credithistory_transactionid_fk"
		}).onDelete("set null"),
	check("credit_history_reason_check", sql`reason = ANY (ARRAY['purchase'::text, 'file_submission'::text, 'gift'::text, 'admin_adjustment'::text, 'signup_bonus'::text, 'referral'::text])`),
]);


export const coupon = pgTable("coupon", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: text().notNull(),
	creditAmount: integer("credit_amount").notNull(),
	expirationDate: timestamp("expiration_date", { mode: 'string' }),
	usageLimit: integer("usage_limit").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("coupon_code_key").on(table.code),
	check("coupon_credit_amount_check", sql`credit_amount > 0`),
	check("coupon_usage_limit_check", sql`usage_limit >= 1`),
]);

export const redeemedCoupon = pgTable("redeemed_coupon", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	couponId: uuid("coupon_id").notNull(),
	redeemedAt: timestamp("redeemed_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "fk_redeemed_coupons_user"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.couponId],
			foreignColumns: [coupon.id],
			name: "fk_redeemed_coupons_coupon"
		}).onDelete("cascade"),
]);

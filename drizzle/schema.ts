import { pgTable, foreignKey, unique, check, uuid, text, integer, timestamp, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



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
			name: "cv_evaluation_file_id_fkey"
		}).onDelete("cascade"),
	unique("cv_evaluation_file_id_aspect_key").on(table.fileId, table.aspect),
	check("cv_evaluation_score_check", sql`(score >= 1) AND (score <= 10)`),
]);

export const credits = pgTable("credits", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userid: text().notNull(),
	balance: integer().default(0).notNull(),
	lastupdated: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userid],
			foreignColumns: [user.id],
			name: "credits_userid_fk"
		}).onDelete("cascade"),
	unique("credits_userid_key").on(table.userid),
]);

export const transactions = pgTable("transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userid: text().notNull(),
	amount: integer().notNull(),
	creditspurchased: integer().notNull(),
	status: text().default('pending').notNull(),
	provider: text().notNull(),
	transactionid: text(),
	currency: text().default('ARS').notNull(),
	createdat: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedat: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userid],
			foreignColumns: [user.id],
			name: "transactions_userid_fk"
		}).onDelete("cascade"),
	unique("transactions_transactionid_key").on(table.transactionid),
	check("transactions_status_check", sql`status = ANY (ARRAY['pending'::text, 'processing'::text, 'approved'::text, 'completed'::text, 'failed'::text, 'canceled'::text])`),
]);

export const verificationToken = pgTable("verificationToken", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const authenticator = pgTable("authenticator", {
	credentialId: text().notNull(),
	userId: text().notNull(),
	providerAccountId: text().notNull(),
	credentialPublicKey: text().notNull(),
	counter: integer().notNull(),
	credentialDeviceType: text().notNull(),
	credentialBackedUp: boolean().notNull(),
	transports: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "authenticator_userId_user_id_fk"
		}).onDelete("cascade"),
	unique("authenticator_credentialID_unique").on(table.credentialId),
]);

export const session = pgTable("session", {
	sessionToken: text().primaryKey().notNull(),
	userId: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const paymentProviders = pgTable("payment_providers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	provider: text().notNull(),
	publickey: text().notNull(),
	secretkey: text().notNull(),
	createdat: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("payment_providers_provider_key").on(table.provider),
]);

export const creditHistory = pgTable("credit_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userid: text().notNull(),
	changeamount: integer().notNull(),
	reason: text().notNull(),
	transactionid: text(),
	createdat: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userid],
			foreignColumns: [user.id],
			name: "credithistory_userid_fk"
		}).onDelete("cascade"),
	check("credit_history_reason_check", sql`reason = ANY (ARRAY['purchase'::text, 'file_submission'::text, 'gift'::text, 'admin_adjustment'::text, 'signup_bonus'::text, 'referral'::text,  'coupon_redemption'::text])`),
]);

export const file = pgTable("file", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	fileUrl: text("file_url").notNull(),
	originalName: text("original_name"),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	check("file_file_url_check", sql`length(file_url) > 0`),
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

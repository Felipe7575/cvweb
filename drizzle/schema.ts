import { pgTable, foreignKey, unique, check, uuid, text, integer, timestamp, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const cvEvaluations = pgTable("cv_evaluations", {
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

export const file = pgTable("file", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	fileUrl: text("file_url").notNull(),
	originalName: text("original_name"),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	check("file_file_url_check", sql`length(file_url) > 0`),
]);

import { pgTable, index, unique, text, foreignKey, timestamp, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const userStatuses = pgEnum("user_statuses", ['ACTIVE', 'DEACTIVATED', 'NEW'])


export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text(),
	image: text(),
}, (table) => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_email_key").on(table.email),
]);

export const sessions = pgTable("sessions", {
	sessiontoken: text().primaryKey().notNull(),
	userid: text(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("idx_sessions_userid").using("btree", table.userid.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userid],
			foreignColumns: [users.id],
			name: "sessions_userid_fkey"
		}).onDelete("cascade"),
]);

export const verificationTokens = pgTable("verification_tokens", {
	identifier: text().primaryKey().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
});

export const accounts = pgTable("accounts", {
	provider: text().notNull(),
	provideraccountid: text().notNull(),
	userid: text(),
	accessToken: text("access_token"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
}, (table) => [
	index("idx_accounts_userid").using("btree", table.userid.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userid],
			foreignColumns: [users.id],
			name: "accounts_userid_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.provider, table.provideraccountid], name: "accounts_pkey"}),
]);

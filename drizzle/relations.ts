import { relations } from "drizzle-orm/relations";
import { file, cvEvaluations, user, account, authenticator, session } from "./schema";

export const cvEvaluationsRelations = relations(cvEvaluations, ({one}) => ({
	file: one(file, {
		fields: [cvEvaluations.fileId],
		references: [file.id]
	}),
}));

export const fileRelations = relations(file, ({many}) => ({
	cvEvaluations: many(cvEvaluations),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	authenticators: many(authenticator),
	sessions: many(session),
}));

export const authenticatorRelations = relations(authenticator, ({one}) => ({
	user: one(user, {
		fields: [authenticator.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));
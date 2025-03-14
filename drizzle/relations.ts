import { relations } from "drizzle-orm/relations";
import { file, cvEvaluation, user, credits, transactions, account, authenticator, session, creditHistory, redeemedCoupon, coupon } from "./schema";

export const cvEvaluationRelations = relations(cvEvaluation, ({one}) => ({
	file: one(file, {
		fields: [cvEvaluation.fileId],
		references: [file.id]
	}),
}));

export const fileRelations = relations(file, ({many}) => ({
	cvEvaluations: many(cvEvaluation),
}));

export const creditsRelations = relations(credits, ({one}) => ({
	user: one(user, {
		fields: [credits.userid],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	credits: many(credits),
	transactions: many(transactions),
	accounts: many(account),
	authenticators: many(authenticator),
	sessions: many(session),
	creditHistories: many(creditHistory),
	redeemedCoupons: many(redeemedCoupon),
}));

export const transactionsRelations = relations(transactions, ({one}) => ({
	user: one(user, {
		fields: [transactions.userid],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
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

export const creditHistoryRelations = relations(creditHistory, ({one}) => ({
	user: one(user, {
		fields: [creditHistory.userid],
		references: [user.id]
	}),
}));

export const redeemedCouponRelations = relations(redeemedCoupon, ({one}) => ({
	user: one(user, {
		fields: [redeemedCoupon.userId],
		references: [user.id]
	}),
	coupon: one(coupon, {
		fields: [redeemedCoupon.couponId],
		references: [coupon.id]
	}),
}));

export const couponRelations = relations(coupon, ({many}) => ({
	redeemedCoupons: many(redeemedCoupon),
}));
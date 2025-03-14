import { relations } from "drizzle-orm/relations";
import { file, cvEvaluation, user, credit, transaction, creditHistory, account, authenticator, session, redeemedCoupon, coupon } from "./schema";

export const cvEvaluationRelations = relations(cvEvaluation, ({ one }) => ({
    file: one(file, {
        fields: [cvEvaluation.fileId],  // Ensure `cvEvaluation.fileId` exists
        references: [file.id]           // Ensure `file.id` exists
    }),
}));

export const fileRelations = relations(file, ({ many }) => ({
    cvEvaluations: many(cvEvaluation, {
        fields: [cvEvaluation.fileId],  // Ensure this matches `cvEvaluation.fileId`
        references: [file.id]           // Ensure this matches `file.id`
    }),
}));


export const creditRelations = relations(credit, ({one}) => ({
	user: one(user, {
		fields: [credit.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	credit: many(credit),
	transaction: many(transaction),
	creditHistorie: many(creditHistory),
	account: many(account),
	authenticator: many(authenticator),
	sessions: many(session),
	redeemedCoupons: many(redeemedCoupon),
}));

export const transactionsRelations = relations(transaction, ({one, many}) => ({
	user: one(user, {
		fields: [transaction.userId],
		references: [user.id]
	}),
	creditHistories: many(creditHistory),
}));

export const creditHistoryRelations = relations(creditHistory, ({one}) => ({
	user: one(user, {
		fields: [creditHistory.userId],
		references: [user.id]
	}),
	transaction: one(transaction, {
		fields: [creditHistory.transactionId],
		references: [transaction.id]
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
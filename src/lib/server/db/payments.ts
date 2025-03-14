import { db } from '$lib/server/db'; // Asegúrate de importar la conexión de Drizzle
import type { z } from 'zod';
import { coupon, credit, creditHistory, redeemedCoupon, transaction } from './schema';
import type { TransactionStatusSchema } from '$lib/schemas';
import { and, eq, sql, type AnyColumn } from 'drizzle-orm';

type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

const increment = (column: AnyColumn, value = 1) => {
	return sql`${column} + ${value}`;
};

export async function createTransaction(
	userId: string,
	amount: number,
	creditsPurchased: number,
	provider: string,
	transactionId: string | null,
	currency: string = 'ARS'
) {
	try {
		const [newTransaction] = await db
			.insert(transaction)
			.values({
				userId,
				amount,
				creditsPurchased,
				status: 'pending', // Estado inicial
				provider,
				transactionId,
				currency
			})
			.returning();

		return newTransaction;
	} catch (error) {
		console.error('Error creating transaction:', error);
		throw new Error('Failed to create transaction');
	}
}

export async function updateTransactionStatus(transactionId: string, status: TransactionStatus) {
	try {
		const [updatedTransaction] = await db
			.update(transaction)
			.set({ status, updatedAt: new Date().toISOString() })
			.where(eq(transaction.transactionId, transactionId))
			.returning();

		if (!updatedTransaction) throw new Error('Transaction not found');

		return updatedTransaction;
	} catch (error) {
		console.error('Error updating transaction status:', error);
		throw new Error('Failed to update transaction');
	}
}

async function applyCreditsToUser(userId: string, credits: number, reason: string, transactionId: string) {
	console.log(`🔄 Aplicando ${credits} créditos a usuario ${userId} con transacción ${transactionId}`);

	const existingTransaction = await db.select().from(creditHistory)
		.where(eq(creditHistory.transactionId, transactionId))
		.limit(1);

	if (existingTransaction.length > 0) {
		console.log(`⚠️ Transaction ${transactionId} already processed. Skipping.`);
		return;
	}

	const updatedRows = await db
		.update(credit)
		.set({
			balance: increment(credit.balance, credits),
			lastUpdated: new Date().toISOString()
		})
		.where(eq(credit.userId, userId))
		.execute();

	if (updatedRows.rowCount === 0) {
		await db.insert(credit).values({
			userId,
			balance: credits,
			lastUpdated: new Date().toISOString()
		});
	}

	await db.insert(creditHistory).values({
		userId,
		changeAmount: credits,
		reason,
		transactionId
	});

	console.log('✅ Créditos aplicados y registrados en historial');
}

export async function redeemUserCoupon(userId: string, couponCode: string) {
	try {
		const [couponDetails] = await db
			.select({
				id: coupon.id,
				creditAmount: coupon.creditAmount,
				usageLimit: coupon.usageLimit,
				expirationDate: coupon.expirationDate
			})
			.from(coupon)
			.where(eq(coupon.code, couponCode));

		if (!couponDetails) return { success: false, message: 'Invalid coupon code.' };

		const [{ count: userRedemptionCount }] = await db
			.select({ count: sql<number>`COUNT(*)` })
			.from(redeemedCoupon)
			.where(and(eq(redeemedCoupon.userId, userId), eq(redeemedCoupon.couponId, couponDetails.id)));

		if (userRedemptionCount >= couponDetails.usageLimit) {
			return { success: false, message: 'Coupon limit reached.' };
		}

		await db.insert(redeemedCoupon).values({ userId, couponId: couponDetails.id });

		const transactionId = `COUPON_${userId}_${Date.now()}`;
		await createTransaction(userId, 0, couponDetails.creditAmount, 'coupon', transactionId);
		await applyCreditsToUser(userId, couponDetails.creditAmount, 'coupon_redemption', transactionId);
		await updateTransactionStatus(transactionId, 'completed');

		return { success: true, message: 'Coupon redeemed successfully!', creditsAdded: couponDetails.creditAmount };
	} catch (error) {
		console.error('Error redeeming coupon:', error);
		throw new Error(error.message || 'Failed to redeem coupon.');
	}
}

export async function applyCreditsAfterPayment(userId: string, creditsPurchased: number, transactionId: string) {
	try {
		await applyCreditsToUser(userId, creditsPurchased, 'purchase', transactionId);
		await db
			.update(transaction)
			.set({ status: 'completed', updatedAt: new Date().toISOString() })
			.where(eq(transaction.transactionId, transactionId));

		console.log('✅ Créditos aplicados y transacción completada');
		return true;
	} catch (error) {
		console.error('❌ Error applying credits after payment:', error);
		throw new Error('Failed to apply credits after payment');
	}
}
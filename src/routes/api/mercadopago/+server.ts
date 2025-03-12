import { json } from '@sveltejs/kit';
import { MERCADO_PAGO_ACCESS_TOKEN } from '$env/static/private';
import { applyCreditsAfterPayment, updateTransactionStatus } from '$lib/server/db/payments';
import { PUBLIC_PRICE_PER_CREDIT } from '$env/static/public';

export async function POST({ request }) {
	try {
		console.log('🔔 Webhook recibido de MercadoPago');

		// Leer el JSON del cuerpo de la petición
		const body = await request.json();
		console.log('📩 Payload recibido:', body);

		if (!body.resource || !body.topic) {
			return json({ error: 'Invalid payload' }, { status: 200 });
		}

		let paymentId = null;
		let merchantOrderId = null;

		if (body.topic === 'payment') {
			paymentId = body.resource; // Es un ID numérico
			console.log(`🔍 Procesando notificación de pago: ${paymentId}`);

			// Obtener detalles del pago desde MercadoPago
			const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
				headers: { Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}` }
			});

			if (!paymentResponse.ok) {
				throw new Error(`Error al obtener detalles del pago: ${paymentResponse.statusText}`);
			}

			const paymentInfo = await paymentResponse.json();
			console.log('💰 Detalles del pago:', paymentInfo);

			merchantOrderId = paymentInfo.order.id; // Asociar con la orden de compra
			if (!merchantOrderId) {
				return json({ error: 'No merchant_order ID found' }, { status: 200 });
			}

			// Obtener detalles de la orden de compra
			const orderResponse = await fetch(
				`https://api.mercadopago.com/merchant_orders/${merchantOrderId}`,
				{
					headers: { Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}` }
				}
			);

			if (!orderResponse.ok) {
				throw new Error(`Error al obtener merchant_order: ${orderResponse.statusText}`);
			}

			const orderInfo = await orderResponse.json();
			console.log('📝 Detalles de la orden');

			// Extraer detalles necesarios
			const userId = orderInfo.external_reference;
			const transactionId = orderInfo.preference_id;
			//
			const creditsPurchased = Math.floor(orderInfo.total_amount / Number(PUBLIC_PRICE_PER_CREDIT));
			

			console.log('TransactionId:', transactionId);

			if (!orderInfo.payments || orderInfo.payments.length === 0) {
				console.log('⏳ No hay pagos registrados aún. Esperando actualización...');
				await updateTransactionStatus(transactionId, 'pending');
				return json({ success: true, message: 'Orden en espera de pago' }, { status: 200 });
			}

			// Buscar el pago aprobado
			const approvedPayment = orderInfo.payments.find((p) => p.status === 'approved');

			if (!approvedPayment) {
				console.log('❌ No hay pagos aprobados en esta orden.');
				await updateTransactionStatus(transactionId, 'failed');
				return json({ error: 'No approved payments found' }, { status: 200 });
			}

			// Extraer datos del pago aprobado
			paymentId = approvedPayment.id;
			const paymentStatus = approvedPayment.status;

			if (paymentStatus === 'approved') {
				console.log(`✅ Pago aprobado. Asignando ${creditsPurchased} créditos a usuario ${userId}`);

				// Actualizar estado en la base de datos
				try {
					await updateTransactionStatus(transactionId, 'approved');

					// Aplicar créditos al usuario
					await applyCreditsAfterPayment(userId, creditsPurchased, transactionId);
				} catch (error) {
					console.error('Error al aplicar créditos:', error);
					return json({ success: false, error: error.message }, { status: 200 });
				}
			}
		} else {
			console.warn('⚠️ Tipo de notificación no soportado:', body.topic);
			return json({ error: 'Unsupported topic' }, { status: 200 });
		}

		return json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('⚠️ Error en el webhook');
		return json({ success: false, error: error.message }, { status: 500 });
	}
}

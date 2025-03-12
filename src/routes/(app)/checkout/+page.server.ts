import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import {  message, superValidate } from 'sveltekit-superforms/server';
import {  fail, redirect, type Load } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {  desc, eq } from 'drizzle-orm';
import { MercadoPagoConfig, Preference } from "mercadopago";
import { MERCADO_PAGO_ACCESS_TOKEN } from '$env/static/private';
import { createTransaction, redeemUserCoupon } from '$lib/server/db/payments';
import { PUBLIC_PRICE_PER_CREDIT } from '$env/static/public';

const couponSchema = z.object({
    text: z.string().min(1).max(100),
});


const checkSignin = async (locals) => {
    const userAuth = await locals.auth?.(); // Ensure `auth` exists before calling it
    if (!userAuth?.user) {
        console.log('Unauthorized access');
        // REDIRECT TO THE SIGNIN PAGE WITH CORRECT STATUS CODE
        throw redirect(302, '/login'); 
    }
    return userAuth.user;
};

const mp = new MercadoPagoConfig({
    accessToken: MERCADO_PAGO_ACCESS_TOKEN
});
    

export const load: Load = async (event) => {
    const { locals } = event; // ✅ Extract `locals` from `event`

    await checkSignin(locals);



    return {
        couponForm: await superValidate(zod(couponSchema)),
    };
};

export const actions = {
    generate_checkout: async ({ request, locals }) => {
        const price = Number(PUBLIC_PRICE_PER_CREDIT);

        const baseUrl = request.headers.get("host")
        const user = await checkSignin(locals);
        const userId = user.id;
        console.log(baseUrl)

        const formData = await request.formData();

        const creditsPurchased = Number(formData.get("credits"));

        console.log("creditsPurchased", creditsPurchased);

        if (!userId || !creditsPurchased) {
            console.log("Faltan parámetros");
            return fail(400, { error: "Faltan parámetros" });
        }

        try {
            // Crear preferencia de pago en MercadoPago
            console.log("Creando preferencia de pago en MercadoPago");
            const preference = new Preference(mp);
            const response = await preference.create({
                body: {
                    items: [
                        {
                            id: "CREDITS2_" + creditsPurchased,
                            title: `${creditsPurchased} Créditos`,
                            quantity: creditsPurchased,
                            unit_price: price,
                            currency_id: "ARS",
                        },
                    ],
                    external_reference: userId,
                    back_urls: {
                        success: baseUrl+"/checkout/success",
                        failure: baseUrl+"/checkout/failure",
                        pending: baseUrl+"/checkout/pending",
                    },
                    auto_return: "approved",
                    notification_url: "https://rational-abnormally-worm.ngrok-free.app/api/mercadopago",
                    
                },
            });
            //console.log("Respuesta de MercadoPago:", response);

            if (!response.init_point) {
                return fail(500, { error: "No se pudo generar el pago" });
            }

            // Guardar transacción en la base de datos
            console.log("Guardando transacción en la base de datos");
            await createTransaction(
                userId,
                price,
                creditsPurchased,
                "MercadoPago",
                response.id,
                "ARS"
            );
            console.log("Transacción guardada Transaction ID:", response.id);
            console.log("Redirigiendo al usuario a MercadoPago");
            // Redirigir al usuario a MercadoPago
            return {location: response.init_point};
        } catch (error) {
            console.error("Error en MercadoPago:", error);
            return fail(500, { error: "Error en el pago" });
        }
    },
    reedem_coupon: async (event) => {
        const { request, locals } = event;
        // VALIDATE WITH SUPERFORMS
        const user = await checkSignin(locals);
        const data = await superValidate(event,zod(couponSchema));
        console.log(data);
        if(!data.valid){
            return fail(400, { error: "Datos inválidos" });
        }
        const couponText = data.data.text;

        console.log("🔄 Reedem coupon")

        const res = await redeemUserCoupon(user.id, couponText);

        console.log("✅ Coupon redeemed");
        
        if(res.success === false){
            return message(data, { error: res.message });
        }

        if(res.success === true){
            return message(data, { creditsAdded: res.creditsAdded });
        }

    }
};
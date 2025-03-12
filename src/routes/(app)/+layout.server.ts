import {  user as userTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';
import type { userWithCreditZodSchema } from '$lib/schemas';
import type { z } from 'zod';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	let user: z.infer<typeof userWithCreditZodSchema> | null = null;
		// GET THE CREDIT BALANCE OF THE USER
	console.log("REACHED LAYOUT SERVER LOAD")
	if(session?.user){
		 user = await db.query.user.findFirst({
			where: eq(userTable.id, session.user.id),
			with: {
				credit: {
					columns: {
						id: true,
						balance: true,
						lastUpdated: true
					}
				}
			}
		}) ?? null;
	}

	return {
		session,
    	user
	};
};


import { users } from "$lib/server/db/schema"
import { eq } from "drizzle-orm"
import type { LayoutServerLoad } from "./$types"
import { db } from "$lib/server/db"
 
export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.auth()

  
 
  return {
    session,
  }
}
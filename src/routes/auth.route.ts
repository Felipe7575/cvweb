import { SvelteKitAuth } from "@auth/sveltekit"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "$lib/server/db"
import Google from "@auth/core/providers/google"
 
export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: DrizzleAdapter(db),
  providers: [Google],
})
import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } from "$env/static/private";
import { db } from "$lib/server/db";
import Google from "@auth/core/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { SvelteKitAuth } from "@auth/sveltekit";

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [
    Google({
      clientId: AUTH_GOOGLE_ID,
      clientSecret: AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",  // Página de inicio de sesión
    signOut: "/login", // Página después de cerrar sesión
  },
  adapter: DrizzleAdapter(db),
});

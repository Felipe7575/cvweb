import { handle as authHandle } from "./auth";
import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

const protectedRoutes = ["/dashboard", "/pagos"]; // Rutas protegidas

const authGuard: Handle = async ({ event, resolve }) => {
    const session = await event.locals.auth();
    console.log("REQUEST", event.url.pathname);
    if (protectedRoutes.includes(event.url.pathname) && !session) {
        throw redirect(302, "/login"); // Redirige si no está autenticado
    }

    return resolve(event);
};

export const handle = sequence(authHandle, authGuard);

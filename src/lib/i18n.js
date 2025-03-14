import { init, register, locale, waitLocale, getLocaleFromNavigator, t } from "svelte-i18n";

// Registrar idiomas
register("en", () => import("./locals/en.json"));
register("es", () => import("./locals/es.json"));

// Obtener idioma guardado o del navegador
const savedLocale =
  typeof window !== "undefined" && localStorage.getItem("lang")
    ? localStorage.getItem("lang")
    : getLocaleFromNavigator()?.startsWith("es")
    ? "es"
    : "en";

// Inicializar i18n
init({
  fallbackLocale: "en",
  initialLocale: savedLocale
});

// Esperar a que cargue el idioma
export const loadingLocale = waitLocale();

// Configurar idioma en el cliente
if (typeof window !== "undefined") {
  loadingLocale.then(() => {
    locale.set(savedLocale);
    localStorage.setItem("lang", savedLocale);
  });
}

// 🔹 EXPORTAR `t` para que funcione `$t` en los componentes
export { locale, t };

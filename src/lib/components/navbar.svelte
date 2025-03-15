<script lang="ts">
  import type { userWithCreditZodSchema } from "$lib/schemas";
  import type { Session } from "@auth/sveltekit";
  import { z } from "zod";
  import { locale, t } from "$lib/i18n"; // Importamos `locale` para cambiar de idioma
  
  let isOpen = false;
  
  let {
      session,
      user
  } : {
      session: Session | null;
      user: z.infer<typeof userWithCreditZodSchema> | null;
  } = $props();

  // Lista de idiomas disponibles
  const languages = [
      { code: "es", name: "Español 🇪🇸" },
      { code: "en", name: "English 🇺🇸" }
  ];

  // Función para cambiar de idioma
  function changeLanguage(lang: string) {
      locale.set(lang); // Cambia el idioma en svelte-i18n
      localStorage.setItem("lang", lang); // Guarda la preferencia del usuario
  }
</script>

<div class="navbar bg-base-100 sticky top-0 left-0 z-50 shadow-sm">
  <div class="flex-1">
      <a class="flex w-fit items-center text-xl hover:scale-105 transition-transform" href="/">
          <img alt="Icono" src="/clip.svg" class="w-10 h-10" />
          We Love CVs
      </a>
  </div>
  <div class="flex-none">
      <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
              <div class="w-10 rounded-full">
                  <img
                      alt="Tailwind CSS Navbar component"
                      src={session?.user?.image ? session.user.image : "https://www.gravatar.com/avatar/?d=mp"} 
                  />
              </div>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <li>
                  <a href="/profile" class="justify-between">
                      {$t("profile")}
                  </a>
              </li>
              <li>
                  <a href="/login">
                      {session?.user ? $t("logout") : $t("login")}
                  </a>
              </li>
              <li>
                  <a href="/checkout">
                      {$t("add_credit")}
                  </a>
              </li>
              <li>
                  <!-- Dropdown de idioma -->
                  <details>
                      <summary class="cursor-pointer">🌍 {$t("select_language")}</summary>
                      <ul class="p-2 bg-base-100 shadow rounded-box w-40">
                          {#each languages as lang}
                              <li>
                                  <button class="w-full text-left p-2 hover:bg-gray-200" on:click={() => changeLanguage(lang.code)}>
                                      {lang.name}
                                  </button>
                              </li>
                          {/each}
                      </ul>
                  </details>
              </li>
          </ul>
      </div>
  </div>
</div>

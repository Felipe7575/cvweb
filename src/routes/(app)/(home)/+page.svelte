<script>
  import { onMount, onDestroy } from "svelte";
  import Typewriter from "typewriter-effect/dist/core";
  import { locale, t } from "$lib/i18n";

  let typewriter;
  let mounted = false;
  let unsubscribe; // Variable para almacenar la suscripción

  const startType = () => {
    mounted = true;
    if (typewriter) {
      typewriter.stop();
      document.getElementById("typewriter").innerHTML = ""; // Limpia el contenido anterior
    }

    typewriter = new Typewriter("#typewriter", {
      loop: true,
      delay: 75,
    })
      .typeString($t("hero_title_1"))
      .pauseFor(1500)
      .deleteAll()
      .typeString($t("hero_title_2"))
      .pauseFor(1500)
      .deleteAll()
      .typeString($t("hero_title_3"))
      .pauseFor(1500)
      .start();
  };

  onMount(() => {
    startType();

    // Suscribirse a cambios en el idioma
    unsubscribe = locale.subscribe(() => {
      if (mounted) startType();
    });
  });

  // Desuscribirse cuando el componente se destruye
  onDestroy(() => {
    if (unsubscribe) unsubscribe();
    mounted = false;
  });
</script>


<div class="h-full w-full">

  <!-- Hero Section -->
  <section class="relative w-full h-screen flex items-center justify-center bg-center bg-no-repeat bg-cover">
      <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center text-white px-6">
        <h1 class="text-5xl font-bold">
          <span id="typewriter"></span>
        </h1>
        <p class="mt-4 text-lg">{$t("hero_subtitle")}</p>
        <a href="/evaluate" class="btn btn-primary animate-bounce mt-6">{$t("upload_cv")}</a>
      </div>
  </section>
  
  <!-- Cómo Funciona -->
  <section class="py-20 bg-gray-100">
      <div class="max-w-5xl mx-auto text-center">
      <h2 class="text-3xl font-bold">{$t("how_it_works")}</h2>
      <div class="mt-10 flex flex-wrap justify-center gap-10">
          {#each $t("steps") as step}
          <div class="card w-72 bg-white shadow-lg p-6">
            <div class="text-4xl font-bold text-primary">{step.number}</div>
            <h3 class="text-xl font-semibold mt-4">{step.title}</h3>
            <p class="mt-2 text-gray-600">{step.description}</p>
          </div>
        {/each}
      </div>
      </div>
  </section>
  
  <!-- Beneficios -->
  <section class="py-20 bg-white">
      <div class="max-w-5xl mx-auto text-center">
      <h2 class="text-3xl font-bold">{$t("benefits")}</h2>
      <div class="mt-10 flex flex-wrap justify-center gap-10">
          {#each $t("benefits_list") as benefit}
          <div class="card w-72 bg-gray-100 shadow-lg p-6">
              <div class="text-4xl">{benefit.icon}</div>
              <h3 class="text-xl font-semibold mt-4">{benefit.title}</h3>
              <p class="mt-2 text-gray-600">{benefit.description}</p>
          </div>
          {/each}
      </div>
      </div>
  </section>
</div>

<script>
    import { onMount } from "svelte";
    import Typewriter from "typewriter-effect/dist/core";

  
    let steps = [
      { number: "1", title: "Sube tu CV", description: "Carga tu currículum en PDF o Word." },
      { number: "2", title: "Análisis con IA", description: "Nuestro sistema revisa experiencia, habilidades y más." },
      { number: "3", title: "Obtén tu score", description: "Recibe un puntaje y recomendaciones para mejorar." }
    ];
  
    let benefits = [
      { icon: "💡", title: "Análisis Rápido", description: "Recibe resultados en menos de 10 segundos." },
      { icon: "📈", title: "Feedback Preciso", description: "Obtén sugerencias basadas en IA." },
      { icon: "🎯", title: "Optimiza tu CV", description: "Mejora tu perfil y aumenta tus oportunidades." }
    ];

  let typewriter;

  onMount(() => {
    typewriter = new Typewriter("#typewriter", {
      loop: true,
      delay: 75,
    })
      .typeString("Optimiza tu CV con IA 💥")
      .pauseFor(1500)
      .deleteAll()
      .typeString("Consigue más entrevistas con IA 🧑‍💼")
      .pauseFor(1500)
      .deleteAll()
      .typeString("Analiza tu currículum en segundos 💡")
      .pauseFor(1500)
      .start();
  });
  </script>
<div class="h-full w-full">
    <!-- Hero Section -->
    <section class="relative w-full h-screen flex items-center justify-center bg-center bg-no-repeat bg-cover">
        <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center text-white px-6">
          <h1 class="text-5xl font-bold">
            <span id="typewriter"></span>
          </h1>
          <p class="mt-4 text-lg">Analizamos tu currículum y te damos un score en claridad, experiencia y habilidades.</p>
          <a href="/evaluate" class="btn btn-primary mt-6">Sube tu CV</a>
        </div>
      </section>
    
    <!-- Cómo Funciona -->
    <section class="py-20 bg-gray-100">
        <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-3xl font-bold">Cómo Funciona</h2>
        <div class="mt-10 flex flex-wrap justify-center gap-10">
            {#each steps as step}
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
        <h2 class="text-3xl font-bold">Beneficios</h2>
        <div class="mt-10 flex flex-wrap justify-center gap-10">
            {#each benefits as benefit}
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
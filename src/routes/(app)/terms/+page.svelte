<script>
    import { onMount } from "svelte";
  
    let lastUpdated = "Marzo 2025"; // Puedes cambiar la fecha dinámicamente
  </script>
  
  <div class="container mx-auto p-6">
    <div class="card bg-base-100 shadow-xl p-6">
      <h1 class="text-3xl font-bold flex items-center gap-2">
        📜 Términos y Condiciones de Servicio
      </h1>
      <p class="text-sm text-gray-500 mt-1">📅 Última actualización: {lastUpdated}</p>
  
      <!-- Sección 1 -->
      <div class="mt-4">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          1️⃣ Aceptación de los Términos
        </h2>
        <p class="text-gray-600">
          Al acceder y utilizar nuestra plataforma de corrección de currículums (en adelante, el <strong>"Servicio"</strong>), 
          usted acepta los presentes <strong>Términos y Condiciones</strong>. Si no está de acuerdo, 
          le recomendamos que no utilice el Servicio.
        </p>
      </div>
  
      <!-- Sección 2 -->
      <div class="mt-4">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          2️⃣ Descripción del Servicio
        </h2>
        <p class="text-gray-600">
          Nuestra plataforma proporciona sugerencias y recomendaciones para mejorar currículums mediante el uso de inteligencia artificial (**IA**). 
          <span class="font-bold">No garantizamos la exactitud, calidad ni idoneidad de los resultados generados.</span>
        </p>
        <ul class="list-disc ml-6 mt-2 text-gray-600">
          <li> La IA utilizada es proporcionada por terceros.</li>
          <li> El Servicio es meramente orientativo.</li>
          <li> No garantizamos entrevistas ni contrataciones.</li>
        </ul>
      </div>
  
      <!-- Sección 3 -->
      <div class="mt-4">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          3️⃣ Limitación de Responsabilidad
        </h2>
        <p class="text-gray-600">
          No somos responsables por errores, inexactitudes u omisiones en los resultados generados por la IA. 
          <strong>No garantizamos éxito laboral</strong> derivado del uso de la plataforma.
        </p>
      </div>
  
      <!-- Sección 4 -->
      <div class="mt-4">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          4️⃣ Pagos y Reembolsos
        </h2>
        <p class="text-gray-600">
          Los pagos se gestionan a través de <strong>Mercado Pago</strong>. 
          No almacenamos ni gestionamos datos de pago y las tarifas no son reembolsables, salvo errores comprobados.
        </p>
      </div>
  
      <!-- Sección 5 -->
      <div class="mt-4">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          5️⃣ Uso Aceptable del Servicio
        </h2>
        <ul class="list-disc ml-6 mt-2 text-gray-600">
          <li> No ingresar información falsa en los currículums.</li>
          <li> No manipular la IA para obtener resultados indebidos.</li>
          <li> No usar la plataforma para actividades fraudulentas.</li>
        </ul>
      </div>
  
      <!-- Sección 6 -->
      <div class="mt-4">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          6️⃣ Privacidad y Protección de Datos
        </h2>
        <p class="text-gray-600">
          Respetamos su privacidad y protegemos sus datos de acuerdo con nuestra <strong>Política de Privacidad</strong>.  
        </p>
      </div>
  
      <!-- Sección 7 -->
      <div class="mt-4">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          7️⃣ Modificaciones a los Términos
        </h2>
        <p class="text-gray-600">
          Nos reservamos el derecho de modificar estos términos en cualquier momento. 
          Los cambios serán efectivos desde su publicación.
        </p>
      </div>
  
      <!-- Sección 8 -->
      <div class="mt-4">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          8️⃣ Ley Aplicable y Jurisdicción
        </h2>
        <p class="text-gray-600">
          Estos términos se rigen por las leyes de la <strong>República Argentina</strong> y cualquier disputa será resuelta ante los tribunales 
          de <strong>Ciudad Autónoma de Buenos Aires</strong>.
        </p>
      </div>
  
      <!-- Sección 9 -->
      <div class="mt-4">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          9️⃣ Contacto
        </h2>
        <p class="text-gray-600">
          Para consultas sobre estos términos, puede contactarnos a través del siguiente correo electrónico:
        </p>
        <p class="mt-2">
          📧 <a href="mailto:felipesantiagocampagnoli@gmail.com" class="text-blue-500 hover:underline">
            felipesantiagocampagnoli@gmail.com
          </a>
        </p>
      </div>
    </div>
  </div>
  
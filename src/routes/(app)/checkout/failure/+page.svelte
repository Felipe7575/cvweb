<script>
    import { onMount  } from 'svelte';
    import { t } from '$lib/i18n';

    import { page } from '$app/state';
    
    const urlParams = new URLSearchParams(page.url.search);
    const status = urlParams.get('status') || "desconocido";

    onMount(() => {
        console.log("Pago Fallido:", status);
    });
</script>

<section class="flex flex-col items-center justify-center h-full p-6">
    <div class="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 class="text-2xl font-bold text-red-600">
            {$t("payment_failed")} ❌
        </h1>
        <p class="mt-2 text-gray-700">
            {$t("payment_failed_message")}
        </p>

        <div class="mt-4">
            <p><strong>{$t("payment_status")}:</strong> {status}</p>
        </div>

        <a href="/" class="mt-4 inline-block px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">
            {$t("back_to_home")}
        </a>
    </div>
</section>

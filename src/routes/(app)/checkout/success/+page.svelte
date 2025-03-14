<script>
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { t } from '$lib/i18n'; // Importar i18n

    const urlParams = new URLSearchParams(page.url.search);
    const paymentId = urlParams.get('payment_id');
    const status = urlParams.get('status');
    const externalReference = urlParams.get('external_reference');

    onMount(() => {
        console.log("Pago Exitoso:", paymentId, status, externalReference);
    });
</script>

<section class="flex flex-col items-center justify-center h-full w-full p-6">
    <div class="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 class="text-2xl font-bold text-green-600">
            {$t("payment_success")} ✅
        </h1>
        <p class="mt-2 text-gray-700">
            {$t("payment_success_message")}
        </p>

        <div class="mt-4">
            <p><strong>{$t("payment_id")}:</strong> {paymentId}</p>
            <p><strong>{$t("payment_status")}:</strong> {status}</p>
            <p><strong>{$t("external_reference")}:</strong> {externalReference}</p>
        </div>

        <a href="/" class="mt-4 inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
            {$t("back_to_home")}
        </a>
    </div>
</section>
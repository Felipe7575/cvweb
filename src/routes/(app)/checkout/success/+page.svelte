<script>
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    
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
        <h1 class="text-2xl font-bold text-green-600">¡Pago Exitoso! ✅</h1>
        <p class="mt-2 text-gray-700">Tu pago ha sido procesado correctamente.</p>

        <div class="mt-4">
            <p><strong>ID de pago:</strong> {paymentId}</p>
            <p><strong>Estado:</strong> {status}</p>
            <p><strong>Referencia externa:</strong> {externalReference}</p>
        </div>

        <a href="/" class="mt-4 inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Volver al inicio
        </a>
    </div>
</section>

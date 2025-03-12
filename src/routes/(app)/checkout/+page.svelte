<script lang="ts">
	import { goto } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';
	import type { PageProps } from '../$types';
	import { PUBLIC_PRICE_PER_CREDIT } from '$env/static/public';

	// Using $props to get the user data
	let { data }: PageProps = $props();
	let user = $derived(data.user);

	// Use $state for reactivity
	let creditsToBuy = $state(10);  
	let pricePerCredit = Number(PUBLIC_PRICE_PER_CREDIT); // Public price per credit      
	let totalPrice = $derived(creditsToBuy * pricePerCredit); // Auto-updates price

	let userCredits = $derived(user?.credit?.[0]?.balance || 0); // Fetch user credit balance

	let loading = $state(false);
	let errorMessage = $state("");

	// Superforms setup for coupon redemption
	const { 
		form: formReedemCoupon, 
		message: messageReedemCoupon,
		enhance: enhanceReedemCoupon
	} = superForm(data.couponForm, {
		resetForm: false,
		invalidateAll: true,
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				console.log(f.errors);
			} else {
				console.log(f);
				console.log(f.errors);
			}
		}
	});

	async function buyCredits() {
		loading = true;
		errorMessage = "";

		try {
			// Send form-urlencoded instead of JSON
			const formData = new URLSearchParams();
			formData.append('credits', String(creditsToBuy));

			const response = await fetch('?/generate_checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: formData
			});

			const dataText = await response.text();
			const data = deserialize(dataText);
			console.log(data);

			if (data?.data?.location) {
				window.location.href = data?.data?.location; // Redirect to payment gateway
			} else {
				console.log(data.error);
				errorMessage = 'Error en la transacción: ' + (data.error || 'Desconocido');
			}
		} catch (error) {
			console.error('Error en el pago:', error);
			errorMessage = 'No se pudo procesar el pago.';
		} finally {
			loading = false;
		}
	}

	let changeCouponOpen = $state(false);
</script>

<!-- CONTAINER -->
<div class="container mx-auto">

	<!-- CARD -->
	<div class="card bg-base-100 mx-auto w-full shadow-xl md:w-fit md:p-6 p-3 ">
		<h2 class="text-2xl font-semibold text-gray-800 text-center">Comprar Créditos</h2>
		
		<div class="divider"></div>

		<!-- DISPLAY CURRENT CREDIT BALANCE -->
		<div class="flex mb-4 text-center">
			<p class="text-lg text-gray-600">Saldo Actual:</p>
			<p class="text-lg px-3 ">{userCredits} Créditos</p>
		</div>

		<!-- CREDIT INPUT -->
		<div class="mb-4">
			<label class="text-lg text-gray-600">Cantidad de Créditos a Comprar:</label>
			<input 
				type="number" 
				class="input input-bordered w-full text-center mt-1" 
				bind:value={creditsToBuy} 
				min="1" 
    			step="1" 
				oninput={(e) => creditsToBuy = Math.max(1, Math.floor(Number(e.target.value)))}
			/>
		</div>

		<!-- PRICE DETAILS -->
		<p class="text-lg text-gray-600">
			<span class="font-semibold">Precio Total(ARS):</span>
			<span class="text-primary">
				{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalPrice)}
			</span>
		</p>

		<!-- ERROR MESSAGE -->
		{#if errorMessage}
			<p class="text-red-500 text-center mt-2">{errorMessage}</p>
		{/if}

		<!-- BUY BUTTON -->
		<button 
			onclick={buyCredits} 
			class="btn btn-primary w-full mt-4 transition-transform duration-200 hover:scale-105"
			disabled={loading}
		>
			{loading ? 'Procesando...' : `Comprar ${creditsToBuy} Créditos`}
		</button>

		<!-- COUPON BUTTON -->
		<button 
			onclick={() => changeCouponOpen = true} 
			class="btn btn-outline w-full mt-2 transition-transform duration-200 hover:scale-105"
		>
			Canjear Cupón
		</button>
	</div>
</div>

<!-- MODAL FOR COUPON REDEMPTION -->
{#if changeCouponOpen}
	<div class="modal modal-open">
		<div class="modal-box">
			<div class="flex flex-row justify-between items-center">
				<h3 class="text-lg font-semibold pl-3">Canjear Cupón</h3>
				<!-- CLOSE BUTTON -->
				<div>
					<button onclick={() => changeCouponOpen = false} class="btn btn-outline">X</button>
				</div>
			</div>
			<!-- FORM -->
			{#if formReedemCoupon}
				<form 
					use:enhanceReedemCoupon
					method="POST"
					action="?/reedem_coupon"
					class="flex flex-col space-y-3 mt-3"
				>
					<input 
						class="input input-bordered w-full" 
						type="text" 
						name="text" 
						bind:value={$formReedemCoupon.text} 
						placeholder="Introduce tu cupón..."
					/>
					<button type="submit" class="btn btn-primary w-full">Canjear</button>
				</form>

				{#if $messageReedemCoupon?.error}
					<p class="text-red-500 mt-2 text-center">{$messageReedemCoupon.error}</p>
				{/if}

				{#if $messageReedemCoupon?.creditsAdded}
					<p class="text-green-500 mt-2 text-center">Créditos añadidos: {$messageReedemCoupon.creditsAdded}</p>
				{/if}

			{/if}
		</div>
	</div>
{/if}

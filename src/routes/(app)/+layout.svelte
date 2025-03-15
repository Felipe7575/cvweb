<script lang="ts">
	import '../../app.css';
	import Navbar from '$lib/components/navbar.svelte';
	import { Toaster } from 'svelte-french-toast';
	import { loadingLocale } from "$lib/i18n";
	import { onMount } from 'svelte';
	import Footer from '$lib/components/footer.svelte';

	let localeLoaded = $state(false);
	onMount(async () => {
		await loadingLocale;
		localeLoaded = true;
	});


	let { children, data } = $props();
	
</script>
{#if localeLoaded}
	<dir class="h-full min-h-screen  ">
		<Navbar 
			session={data.session}
			user={data.user}
		/>
		<main class="flex justify-center align-center flex-1 bg-base-200 w-full min-h-screen ">
			{@render children()}
		</main>
		<Footer></Footer>
	</dir>
			


	<Toaster position="bottom-center"/>
{/if}

<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/navbar.svelte';
	let { children, data } = $props();
	$inspect(data);
	
</script>

<div class="flex h-screen flex-col">
	<Navbar 
		session={data.session}
	/>
	<div class="flex flex-1 overflow-y-auto">
		<main class="flex justify-center align-center flex-1 bg-base-200 p-2 md:p-5 overflow-y-auto">
			{@render children()}
		</main>
	</div>
</div>

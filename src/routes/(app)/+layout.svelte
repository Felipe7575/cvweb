<script lang="ts">
	import '../../app.css';
	import Navbar from '$lib/components/navbar.svelte';
	import { Toaster } from 'svelte-french-toast';

	let { children, data } = $props();
	
</script>

<div class="flex  h-full h-min-screen  md:h-screen flex-col p-0 m-0">
	<Navbar 
		session={data.session}
		user={data.user}
	/>
	<div class="flex flex-1 h-full overflow-y-auto">
		<main class="flex justify-center align-center flex-1 bg-base-200 p-2 md:p-5 w-full h-full md:h-full ">
			{@render children()}
		</main>
	</div>
</div>

<Toaster position="bottom-center"/>
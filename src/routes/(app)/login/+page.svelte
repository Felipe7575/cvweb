<script lang="ts">
	import { SignIn, SignOut } from '@auth/sveltekit/components';

	let { data } = $props();
</script>

<div class="container mx-auto">
	<!-- Profile Card -->
	<div class="card bg-base-100 mx-auto my-auto w-full shadow-xl md:w-fit md:p-6 p-3 ">
		<div class="card-body text-center">
			<!-- Title -->
			<h2 class="text-3xl font-extrabold text-gray-800">Welcome Back!</h2>
			<p class="mt-1 text-gray-500">Sign in to continue</p>

			<!-- Profile Image Placeholder -->
			<div class="mt-4">
				<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-300 shadow-md">
					<img
						src={data.session?.user?.image ? data.session.user.image : "https://www.gravatar.com/avatar/?d=mp"} 
						alt="User Avatar"
						class="h-full w-full rounded-full"
					/>
				</div>
			</div>

			<!-- Sign In & Sign Out Buttons -->
			<div class="mt-6 space-y-4">
				{#if !data.session}
					<SignIn 
						provider="google" 
						signInPage="signin"
						class="btn btn-primary flex w-full items-center justify-center"
					>   
						Sign in with Google
					</SignIn>
				{/if}
				
				{#if data.session}
					<p class="text-gray-500">Signed in as {data.session.user.name}</p>
					
					<SignOut 
						provider="google" 
						signOutPage="signout" 
						class="btn btn-outline btn-error w-full"
					>
						Sign Out
					</SignOut>
				{/if}
			</div>

			<!-- Small Footer -->
			<p class="mt-4 text-xs text-gray-400">
				By signing in, you agree to our <a href="#" class="text-blue-500 hover:underline">Terms of Service</a>
			</p>
		</div>
	</div>
</div>

<script lang="ts">
	import { SignIn, SignOut } from '@auth/sveltekit/components';
    import { t } from '$lib/i18n';

	let { data } = $props();
</script>

<div class="container mx-auto">
    <!-- Profile Card -->
    <div class="card bg-base-100 mx-auto my-auto w-full shadow-xl md:w-fit md:p-6 p-3 ">
        <div class="card-body text-center">
            <!-- Title -->
            <h2 class="text-3xl font-extrabold text-gray-800">{$t("welcome_back")}</h2>
            <p class="mt-1 text-gray-500">{$t("sign_in_to_continue")}</p>

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
                <div class="mt-6 space-y-4">
                    <form method="POST" action="/signin" class="w-full">
                        <input type="hidden" name="providerId" value="google">
                        <button type="submit" class="btn btn-primary flex w-full items-center justify-center">
                            Sign in with Google
                        </button>
                    </form>
                </div>  
                {/if}
                
                {#if data.session}
                    <p class="text-gray-500">{$t("signed_in_as")}  {data.session.user.name}</p>
                    
                    <form method="POST" action="/signout" class="w-full">
                        <button type="submit" class="btn btn-outline btn-error w-full">
                            Sign Out
                        </button>
                    </form>
                    
                {/if}
            </div>

            <!-- Small Footer -->
            <p class="mt-4 text-xs text-gray-400">
                {$t("terms_of_service_agreement")} <a href="/terms" class="text-blue-500 hover:underline">Términos de servicio</a>
            </p>
        </div>
    </div>
</div>
<script lang="ts">
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	let { data } = $props();
	let user = $derived(data.user);

	// IF user is not available, redirect to login page
	if (!user) {
		goto('/login');
	}
</script>

<div class="container mx-auto">
    <!-- Profile Card -->
    <div class="card bg-base-100 mx-auto my-auto w-full shadow-xl md:w-fit md:p-6 p-3 ">
        <figure>
            <img
                src={user?.image ? user.image : 'https://www.gravatar.com/avatar/?d=mp'}
                alt="{$t('profile_picture')}"
                class="mt-4 h-32 w-32 rounded-full"
            />
        </figure>
        <div class="card-body text-center">
            <h2 class="card-title mx-auto text-2xl capitalize">{user.name}</h2>
            <p class="text-gray-500">{user.email}</p>

            <!-- Credit Balance -->
            <div class="mt-4">
                <p class="text-lg font-semibold">{$t("credit_balance")}</p>
                {#each user.credit as credit}
                    <p class="text-xl text-green-500">${credit.balance.toFixed(2)}</p>
                    <p class="text-sm text-gray-400">{$t("last_updated")}: {credit.lastUpdated}</p>
                    <p class="mt-4 text-xs text-gray-400">
                        {$t("refresh_balance_message")}
                    </p>
                    <p class="text-xs text-gray-400">{$t("contact_support_message")}</p>
                {:else}
                    <p class="text-xl text-green-500">$0.00</p>
                {/each}
            </div>

            <!-- Add Credit REDIRECT /checkout -->
            <button class="btn btn-primary mt-4" onclick={() => goto('/checkout')}>
                {$t("add_credit")}
            </button>
        </div>
    </div>
</div>
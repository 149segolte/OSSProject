<script lang="ts">
	import { guest } from '$lib/stores/guest';
	guest.set(true);
	import { goto } from '$app/navigation';
	import { connection } from '$lib/stores/connection';
	import { browser } from '$app/environment';

	if (!$connection) {
		if (browser) {
			goto('/');
		}
	}

	import { source } from 'sveltekit-sse';
	const stream = source(`/${$connection?.code}/${$connection?.id}`);
	const value = stream.select('event-1')
</script>

<div class="flex flex-col items-center">
	{#if $connection}
		{$value}
		<p class="text-3xl font-bold">Hi, {$connection.username}</p>
		<p class="mt-3 text-2xl font-medium">Waiting for host to start...</p>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			style="display: block; shape-rendering: auto;"
			viewBox="0 0 100 100"
			class="w-24 h-24 stroke-current"
			preserveAspectRatio="xMidYMid"
		>
			<path
				fill="none"
				stroke-width="8"
				stroke-dasharray="42.76482137044271 42.76482137044271"
				d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z"
				stroke-linecap="round"
				style="transform:scale(0.70);transform-origin:50px 50px"
			>
				<animate
					attributeName="stroke-dashoffset"
					repeatCount="indefinite"
					dur="1.33"
					keyTimes="0;1"
					values="0;256.5889282"
				></animate>
			</path>
		</svg>
	{/if}
</div>

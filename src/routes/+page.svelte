<script lang="ts">
	import { page } from '$app/stores';
	let user = $derived($page.data.user);
</script>

<div>
	{#if user}
		Authenticated as {user.displayName}
	{:else}
		Not Authenticated
	{/if}
</div>

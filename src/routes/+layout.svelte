<script lang="ts">
	import { guest } from '$lib/stores/guest';
	import '../app.postcss';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
	import { initFirebase } from '$lib/client/firebase';

	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Sun, Moon, Github } from 'lucide-svelte';
	import { setMode, resetMode } from 'mode-watcher';

	import { invalidateAll } from '$app/navigation';
	import { user } from '$lib/stores/user';
	import { applyAction, deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';

	async function upload_token(token: string) {
		const data = new FormData();
		data.append('token', token);

		const response = await fetch('?/login', {
			method: 'POST',
			body: data
		});

		const result: ActionResult = deserialize(await response.text());
		if (result.type === 'success') {
			// rerun all `load` functions, following the successful update
			await invalidateAll();
		}
		applyAction(result);
	}

	onMount(() => {
		const { auth } = initFirebase();

		window.logout = async () => {
			await signOut(auth);
			await fetch('?/logout', { method: 'POST', body: new FormData() });
			await invalidateAll();
		};

		window.handle_login = (res: any) => {
			if (res) {
				// Build Firebase credential with the Google ID token.
				const idToken = res.credential;
				const credential = GoogleAuthProvider.credential(idToken);

				// Sign in with credential from the Google user.
				let login = signInWithCredential(auth, credential).catch((error) => {
					const errorCode = error.code;
					const errorMessage = error.message;
					const email = error.email;
					const credential = GoogleAuthProvider.credentialFromError(error);
					console.log('Error', errorCode, errorMessage, email, credential);
				});

				login.then(async (res) => {
					if (!res) return;
					await upload_token(await res.user.getIdToken());
				});
			}
		};

		let login = document.getElementById('login');
		if (login) {
			login.innerHTML = `
					<div
						id="g_id_onload"
						data-client_id="546572143993-ld56r211nddte83j2qmue94ltl8e9sf0.apps.googleusercontent.com"
						data-context="signin"
						data-ux_mode="popup"
						data-callback="handle_login"
						data-nonce=""
						data-auto_select="true"
						data-itp_support="true"
					></div>

					<div
						class="g_id_signin"
						data-type="standard"
						data-shape="rectangular"
						data-theme="outline"
						data-text="signin_with"
						data-size="large"
						data-logo_alignment="left"
						style="color-scheme: light;"
					></div>
		    `;
			let script = document.createElement('script');
			script.src = 'https://accounts.google.com/gsi/client';
			script.async = true;
			login.appendChild(script);
		}
	});
</script>

<div class="backdrop flex flex-col h-[100svh] px-4">
	<ModeWatcher />
	<header class="container mt-4 px-2 rounded-lg border sticky top-0 z-50 shadow-sm backblur">
		<div class="flex h-14 items-center">
				<a href="/" class="mr-4 flex items-center gap-2">
					<!-- Logo -->
					<span class="ml-2 font-bold text-xl">Quizzer</span>
				</a>

			<nav class="ml-auto flex items-center gap-1">
				<Button variant="ghost" size="icon" href="https://github.com/149segolte/quizzer">
					<Github />
				</Button>

				<DropdownMenu.Root positioning={{ placement: 'bottom-end' }}>
					<DropdownMenu.Trigger asChild let:builder>
						<Button builders={[builder]} variant="ghost" size="icon">
							<Sun class="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<Moon
								class="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
							/>
							<span class="sr-only">Toggle theme</span>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="backblur">
						<DropdownMenu.Item on:click={() => setMode('light')}>Light</DropdownMenu.Item>
						<DropdownMenu.Item on:click={() => setMode('dark')}>Dark</DropdownMenu.Item>
						<DropdownMenu.Item on:click={() => resetMode()}>System</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				{#if !$guest}
				{#if $user}
					<DropdownMenu.Root positioning={{ placement: 'bottom-end' }}>
						<DropdownMenu.Trigger asChild let:builder>
							<Button builders={[builder]} variant="ghost" size="icon">
								<Avatar.Root class="!h-9 !w-9 rounded-md">
									<Avatar.Image src={$user.photoURL} alt="Avatar" />
									<Avatar.Fallback class="!h-9 !w-9 rounded-md">
										{$user.displayName
											.split(' ')
											.map((name) => name[0])
											.join('')}
									</Avatar.Fallback>
								</Avatar.Root>
								<span class="sr-only">Profile Menu</span>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="backblur">
							<DropdownMenu.Item on:click={() => window.logout()}>Sign Out</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<div id="login"></div>
				{/if}
				{/if}
			</nav>
		</div>
	</header>

<div class="container p-0 h-full flex flex-col items-center justify-center">
	<div
		class="mt-4 w-full sm:w-auto sm:mt-0 p-4 rounded-lg border bg-card text-card-foreground shadow-sm backblur"
	>
	<slot />
	</div>
		</div>
</div>

<style lang="postcss">
	@property --angle {
		syntax: '<angle>';
		initial-value: 0deg;
		inherits: false;
	}

	.backdrop {
		--angle: 0deg;
		@apply from-blue-400 via-purple-600 to-blue-400;
		background-image: conic-gradient(from var(--angle) at 50% -5%, var(--tw-gradient-stops));
		animation: spin 2s linear infinite;
	}

	@keyframes spin {
		from {
			--angle: 0deg;
		}
		to {
			--angle: 360deg;
		}
	}
</style>

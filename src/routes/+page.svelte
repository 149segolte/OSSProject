<script lang="ts">
	import { guest } from '$lib/stores/guest';
	guest.set(false);
	import { user } from '$lib/stores/user';
	import { Separator } from '$lib/components/ui/separator';
	import * as Form from '$lib/components/ui/form';
	import { joinSchema } from './schema';
	import type { PageData } from './$types';
	import type { FormOptions } from 'formsnap';
	import { goto, invalidateAll } from '$app/navigation';
	import { connection } from '$lib/stores/connection';

	export let data: PageData;

	const options: FormOptions<typeof joinSchema> = {
		validators: joinSchema,
		invalidateAll: false,
		onResult(event) {
			if (event.result.type === 'success') {
				console.log(event.result.data);
				connection.set({
					code: event.result.data.form.data.code,
					username: event.result.data.form.data.username,
					id: event.result.data.id
				});
				goto(`/quiz/${event.result.data.form.data.code}`);
			} else {
				alert('Invalid code or username');
				invalidateAll();
			}
		}
	};
</script>

<div>
	<p class="text-3xl font-bold text-center mb-4">Welcome to Quizzer!</p>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div class={($user ? 'col-span-1' : 'col-span-2') + ' flex flex-col w-full'}>
			<Form.Root form={data.form} let:config {options} class="min-w-[16rem]" action="?/join">
				<Form.Field {config} name="username">
					<Form.Item>
						<Form.Label>Username</Form.Label>
						<Form.Input type="text" placeholder="Enter your name" class="bg-background" />
						<Form.Validation />
					</Form.Item>
				</Form.Field>
				<Form.Field {config} name="code">
					<Form.Item>
						<Form.Label>Code</Form.Label>
						<div class="flex flex-row items-center">
							<Form.Input type="number" placeholder="Six digit code" class="bg-background" />
							<Form.Button class="ml-2">Join</Form.Button>
						</div>
						<Form.Validation />
					</Form.Item>
				</Form.Field>
			</Form.Root>
		</div>
		{#if $user}
			<Separator class="sm:hidden block" />
			<Separator class="" orientation="vertical" />
			<div class="flex flex-col w-1/2 items-center">
				<span>
					Authenticated as {$user.displayName}
				</span>
			</div>
		{/if}
	</div>
</div>

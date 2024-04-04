<script lang="ts">
	import { getContext } from 'svelte';
	import Pane from '../Pane.svelte';
	import { Client } from '$lib/Client';
	import { sendToRover } from '$lib/comm/SendToRover';
	import {
		AutoNavInstruction,
		InstructionMapping,
		TargetMapping,
		type Target,
		AutoNavTargetType,
		PlanLoadingData,
		PlanMapping,
		StateLoadingData,
		StateMapping,
		AutoNavState
	} from '$lib/comm/mappings/AutoNav';
	import { readFromRover } from '$lib/comm/ReadFromRover';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const client = getContext<Client>('client');

	const state = readFromRover(client, StateMapping, StateLoadingData);
	const plan = readFromRover(client, PlanMapping, PlanLoadingData);

	const target = sendToRover(client, TargetMapping);
	const instructions = sendToRover(client, InstructionMapping);

	let form: HTMLFormElement;

	function execute() {
		instructions.set({ instruction: AutoNavInstruction.Execute });
	}

	function pause() {
		instructions.set({ instruction: AutoNavInstruction.Pause });
	}

	function resume() {
		instructions.set({ instruction: AutoNavInstruction.Resume });
	}

	function terminate() {
		form?.reset();
		instructions.set({ instruction: AutoNavInstruction.Terminate });
	}

	function transmitTarget(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
		const data = new FormData(event.currentTarget);

		const newTarget: Target = {
			location: {
				latitude: parseFloat(data.get('lat')!.toString()),
				longitude: parseFloat(data.get('lon')!.toString())
			},
			type: parseInt(data.get('type')!.toString()) as AutoNavTargetType
		};

		target.set({ target: newTarget });
	}
</script>

<Pane
	{start}
	{end}
	name="Auto Nav Control"
	containerClasses="flex flex-col items-center"
	loading={($state && $plan) == null}
>
	<svelte:fragment slot="main">
		<div class="w-full px-8 my-4 flex flex-row gap-4 justify-center">
			{#if $plan?.plan.target.type != AutoNavTargetType.Null}
				{#if $state?.state == AutoNavState.Waiting}
					<button on:click={execute} class="btn btn-lg variant-filled-primary">Execute</button>
				{:else if $state?.state == AutoNavState.Moving || $state?.state == AutoNavState.Terminal}
					<!-- <button on:click={pause} class="btn btn-lg variant-filled-secondary">Pause</button> -->
					<button on:click={terminate} class="btn btn-lg variant-filled-error">Terminate</button>
				{/if}
			{/if}
			<!-- <button on:click={resume} class="btn btn-lg variant-filled-secondary">Resume</button> -->
		</div>

		<p class="h5">Set New Target</p>

		<form bind:this={form} on:submit|preventDefault={transmitTarget} class="w-[75%]">
			<label class="label mb-2">
				<span>Latitude</span>
				<input
					class="input"
					type="number"
					name="lat"
					placeholder="Latitude"
					min="-90"
					max="90"
					step="any"
					required
				/>
			</label>

			<label class="label mb-2">
				<span>Longitude</span>
				<input
					class="input"
					type="number"
					name="lon"
					placeholder="Longitude"
					min="-180"
					max="180"
					step="any"
					required
				/>
			</label>

			<label class="label mb-4">
				<span>Type</span>
				<select class="select" name="type">
					<option value="0">GNSS</option>
					<option value="1">Post</option>
					<option value="2">Rubber Mallet</option>
					<option value="3">Water Bottle</option>
				</select>
			</label>

			<button type="submit" class="w-full btn btn-lg variant-filled-primary">Transmit</button>
		</form>
	</svelte:fragment>
</Pane>

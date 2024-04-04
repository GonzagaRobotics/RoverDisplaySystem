<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import Pane from '../Pane.svelte';
	import { Client } from '$lib/Client';
	import { readFromRover } from '$lib/comm/ReadFromRover';
	import {
		StateMapping,
		PlanMapping,
		AutoNavTargetType,
		StateLoadingData,
		PlanLoadingData,
		AutoNavState
	} from '$lib/comm/mappings/AutoNav';
	import { ClientRosTopic } from '$lib/comm/core/ClientRosTopic';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const client = getContext<Client>('client');

	const state = readFromRover(client, StateMapping, StateLoadingData);
	const plan = readFromRover(client, PlanMapping, PlanLoadingData);

	function stateToString(val: AutoNavState | undefined): string {
		if (val == undefined) return '';

		switch (val) {
			case AutoNavState.Disabled:
				return 'Disabled';
			case AutoNavState.Waiting:
				return 'Waiting';
			case AutoNavState.Planning:
				return 'Planning';
			case AutoNavState.Moving:
				return 'Moving';
			case AutoNavState.Terminal:
				return 'Terminal';
			case AutoNavState.Success:
				return 'Success';
		}
	}

	function targetTypeToString(val: AutoNavTargetType | undefined): string {
		if (val == undefined) return '';

		switch (val) {
			case AutoNavTargetType.GeoPoint:
				return 'GeoPoint';
			case AutoNavTargetType.Post:
				return 'Post';
			case AutoNavTargetType.Mallet:
				return 'Mallet';
			case AutoNavTargetType.WaterBottle:
				return 'Water Bottle';
			case AutoNavTargetType.Null:
				return 'Null';
		}
	}

	onMount(() => {
		// Somewhat hacky way to force a refresh of the data
		const topic = new ClientRosTopic('/auto_nav/query', 'std_msgs/Empty', client.ros);

		topic.publish({});
		topic.unadvertise();
	});
</script>

<Pane
	{start}
	{end}
	name="Auto Nav Status"
	containerClasses="flex flex-col items-center"
	loading={($state && $plan) == null}
>
	<svelte:fragment slot="main">
		<p>Current State: {stateToString($state?.state)}</p>

		<div class="w-[75%] px-2 my-4">
			<p class="h5 text-center">Current Target</p>

			<div class="flex flex-row justify-between">
				{#if $plan?.plan.target.type == AutoNavTargetType.Null}
					<p class="w-full text-center">There is no target.</p>
				{:else}
					<p>Lat: {$plan?.plan.target.location.latitude.toFixed(6)}</p>
					<p>Lon: {$plan?.plan.target.location.longitude.toFixed(6)}</p>
					<p>Type: {targetTypeToString($plan?.plan.target.type)}</p>
				{/if}
			</div>
		</div>

		<div class="w-[75%] px-2 text-center">
			<p class="h5">Current Plan</p>

			{#if $plan?.plan.waypoints.length == 0}
				<p>There is no plan.</p>
			{:else}
				<p class="h6">{$plan?.plan.waypoints.length} waypoints</p>
				<ul class="list-disc">
					{#each $plan?.plan.waypoints ?? [] as waypoint}
						<li class="flex flex-row justify-center gap-4">
							<p>Lat: {waypoint.latitude.toFixed(6)}</p>
							<p>Lon: {waypoint.longitude.toFixed(6)}</p>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</svelte:fragment>
</Pane>

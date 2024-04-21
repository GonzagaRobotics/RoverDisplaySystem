<script lang="ts">
	import { getContext } from 'svelte';
	import Pane from './Pane.svelte';
	import type { Client } from '$lib/Client';
	import { ClientRosTopic } from '$lib/comm/core/ClientRosTopic';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	const client = getContext<Client>('client');

	const shoulderTopic = new ClientRosTopic('/arm/shoulder', 'std_msgs/Float32', client.ros);
	const forearmTopic = new ClientRosTopic('/arm/forearm', 'std_msgs/Float32', client.ros);
	const wristTopic = new ClientRosTopic('/arm/wrist', 'std_msgs/Int32', client.ros);
	const minorXTopic = new ClientRosTopic('/arm/minor/x', 'std_msgs/Int32', client.ros);
	const minorZTopic = new ClientRosTopic('/arm/minor/z', 'std_msgs/Int32', client.ros);
	const minorGrabberTopic = new ClientRosTopic('/arm/minor/grab', 'std_msgs/Int32', client.ros);

	const shoulderInput = client.inputSystem.registerAxisHandle({
		id: 'shoulder',
		axis: 'LY',
		curve: 1.5,
		deadzone: 0.1
	});

	shoulderInput.subscribe((value) => shoulderTopic.publish({ data: value }));

	const forearmInput = client.inputSystem.registerAxisHandle({
		id: 'forearm',
		axis: 'RY',
		curve: 1.5,
		deadzone: 0.1
	});

	forearmInput.subscribe((value) => forearmTopic.publish({ data: value }));

	const wristInputForward = client.inputSystem.registerButtonHandle({
		id: 'wristForward',
		button: 'A'
	});

	const wristInputBackward = client.inputSystem.registerButtonHandle({
		id: 'wristBackward',
		button: 'B'
	});

	$: wristTopic.publish({ data: ($wristInputForward ? 1 : 0) - ($wristInputBackward ? 1 : 0) });

	const minorXInputForward = client.inputSystem.registerButtonHandle({
		id: 'minorXForward',
		button: 'Left'
	});

	const minorXInputBackward = client.inputSystem.registerButtonHandle({
		id: 'minorXBackward',
		button: 'Right'
	});

	$: minorXTopic.publish({ data: ($minorXInputForward ? 1 : 0) - ($minorXInputBackward ? 1 : 0) });

	const minorZInputForward = client.inputSystem.registerButtonHandle({
		id: 'minorZForward',
		button: 'Up'
	});

	const minorZInputBackward = client.inputSystem.registerButtonHandle({
		id: 'minorZBackward',
		button: 'Down'
	});

	$: minorZTopic.publish({ data: ($minorZInputForward ? 1 : 0) - ($minorZInputBackward ? 1 : 0) });

	const minorGrabberInputForward = client.inputSystem.registerButtonHandle({
		id: 'minorGrabberForward',
		button: 'X'
	});

	const minorGrabberInputBackward = client.inputSystem.registerButtonHandle({
		id: 'minorGrabberBackward',
		button: 'Y'
	});

	$: minorGrabberTopic.publish({
		data: ($minorGrabberInputForward ? 1 : 0) - ($minorGrabberInputBackward ? 1 : 0)
	});
</script>

<Pane {start} {end} name="Arm" containerClasses="flex justify-center items-center overflow-hidden">
	<svelte:fragment slot="main">Arm Stuff here</svelte:fragment>
</Pane>

<script lang="ts">
	import ArmCamera from '$lib/panes/camera/ArmCamera.svelte';
	import Arm from '$lib/panes//arm/Arm.svelte';

	let camera: ArmCamera;

	export function tick(delta: number) {}

	export function dispose() {
		camera?.dispose();
	}
</script>

<Arm start={{ x: 1, y: 1 }} end={{ x: 2, y: 2 }} />
<ArmCamera bind:this={camera} start={{ x: 2, y: 1 }} end={{ x: 3, y: 3 }} />

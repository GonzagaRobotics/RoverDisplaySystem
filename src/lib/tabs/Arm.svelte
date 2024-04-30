<script lang="ts">
	import Arm from '$lib/panes/Arm.svelte';
	import Camera from '$lib/panes/camera/Camera.svelte';

	export function tick(delta: number) {}
</script>

<Arm start={{ x: 1, y: 1 }} end={{ x: 2, y: 2 }} />
<Camera start={{ x: 2, y: 1 }} end={{ x: 4, y: 2 }} />

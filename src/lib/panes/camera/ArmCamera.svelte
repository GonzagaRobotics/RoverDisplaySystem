<script lang="ts">
	import { getContext } from 'svelte';
	import Pane from '../Pane.svelte';
	import { Client } from '$lib/Client';

	export let start: { x: number; y: number };
	export let end: { x: number; y: number };

	export function dispose() {
		peerConnection.close();
		signalingChannel.close();
	}

	const client = getContext<Client>('client');

	const peerConnection = new RTCPeerConnection({ iceServers: [] });
	const signalingChannel = new WebSocket(`ws://${client.config.roverUrl}:8090`);

	async function sendIceCandidate(event: { candidate: any }) {
		if (event.candidate) {
			console.log('Sending ICE candidate');

			signalingChannel.send(
				JSON.stringify({
					iceCandidate: event.candidate
				})
			);
		}
	}

	async function sendOffer() {
		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offer);

		signalingChannel.send(
			JSON.stringify({
				offer: offer
			})
		);
	}

	let video: HTMLVideoElement;

	$: if (video) {
		peerConnection.ontrack = (event) => {
			console.log('Got track');

			video.srcObject = event.streams[0];
		};

		signalingChannel.onmessage = async (rawMessage) => {
			const message = JSON.parse(rawMessage.data);

			if (message.iceCandidate) {
				peerConnection.addIceCandidate(message.iceCandidate);
				return;
			}

			const remoteDesc = new RTCSessionDescription(message.answer);
			peerConnection.setRemoteDescription(remoteDesc);
		};

		peerConnection.onicecandidate = sendIceCandidate;

		const transceiver = peerConnection.addTransceiver('video', {
			direction: 'recvonly'
		});

		transceiver.setCodecPreferences([
			{ mimeType: 'video/AV1', clockRate: 90000 },
			{ mimeType: 'video/AV1', clockRate: 90000, sdpFmtpLine: 'profile=1' },
			{ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=0' },
			{ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=1' },
			{ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=2' },
			{ mimeType: 'video/VP9', clockRate: 90000, sdpFmtpLine: 'profile-id=3' },
			{ mimeType: 'video/VP8', clockRate: 90000 }
		]);

		signalingChannel.onopen = () => {
			sendOffer();
		};
	}
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<Pane
	{start}
	{end}
	name="Camera"
	containerClasses="flex justify-center items-center overflow-hidden"
>
	<svelte:fragment slot="main">
		<video bind:this={video} playsInline muted autoPlay width="480" height="640"></video>
	</svelte:fragment>
</Pane>

<style>
	video {
		transform: rotate(90deg);
	}
</style>

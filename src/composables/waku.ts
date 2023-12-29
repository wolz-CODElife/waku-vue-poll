import { ref } from 'vue';
import protobuf, { Message } from 'protobufjs';
import {
	createLightNode,
	waitForRemotePeer,
	createDecoder,
	createEncoder,
	Protocols,
	IFilterSubscription
} from '@waku/sdk';
import { sha256 } from 'crypto-hash';



const status = ref<string>('connecting...');
const sender = ref(localStorage.getItem('senderID') ?? '');
const polls = ref([]);

export const wakuNode = await createLightNode({
    defaultBootstrap: true,
})
export const waitForRemotePeers = async () => {
    // Wait for a successful peer connection
    await waitForRemotePeer(wakuNode, [
        Protocols.LightPush,
        Protocols.Filter,
    ]);
}
// Choose a content topic
const contentTopic = '/waku-vue-poll/1/polls/proto';

// message encoder and decoder
export const encoder = createEncoder({ contentTopic, ephemeral: true });
export const decoder = createDecoder(contentTopic);

// Message structure with Protobuf
export const PollQuestionWakuMessage = new protobuf.Type('PollQuestion')
	.add(new protobuf.Field('timestamp', 1, 'uint64'))
	.add(new protobuf.Field('msgid', 2, 'string'))
	.add(new protobuf.Field('sender', 3, 'string'))
	.add(new protobuf.Field('message', 4, 'string'));

export const serializeMessage = (protoMessage: Message) => {
	return PollQuestionWakuMessage.encode(protoMessage).finish()
}

export const generateUniqueID = () => {
	const userAgentHash = sha256(
		navigator.userAgent + Math.floor(Math.random() * 90000)
	);
	return userAgentHash;
};

export let subscription = {} as IFilterSubscription

export function useWaku() {
	async function start() {
		status.value = 'connecting'
		
		// perform auth or create an sender identifier for wakuStore user
		generateUniqueID().then((hashID) => {
			if (sender.value !== '') return;
			const newHash =
			'abcdef012345'[Math.floor(Math.random() * 15)] +
			'x' +
			hashID.slice(-20);
			sender.value = newHash;
			localStorage.setItem('senderID', newHash);
		});
		
		try {
			await wakuNode.start().then(() => {
				if (wakuNode.isStarted()) return waitForRemotePeers()
			}).then(() => {
				return wakuNode.connectionManager.getPeersByDiscovery()
			}).then((data) => {
				if (
					wakuNode.libp2p.getConnections().length ||
					data.CONNECTED.bootstrap.length ||
					data.CONNECTED['peer-exchange'].length
				) {
					subscribe()
					status.value = "connected"
					console.log("Found peer. . .");
				}
			})
		}
		catch (error) {
			console.error('Error initializing Waku Light Node:', error);
			status.value = 'not connected';
		}
	}

	async function stop() {
		unsubscribe();
		wakuNode.stop()
		status.value = 'not conencted';
		console.log('Disconnected');
	}
	async function subscribe() {
		if (!wakuNode || status.value !== 'connected') await start();
		try {
		  subscription = await wakuNode?.filter?.createSubscription();
		  await subscription.subscribe([decoder], (wakuMessage) => {
			const messageObj = PollQuestionWakuMessage.decode(wakuMessage.payload).toJSON();
			const result = { ...messageObj, message: JSON.parse(messageObj.message ?? '{}') };
			handleSubscriptionResult(result);
		  });
		} catch (error) {
		  console.error('Error subscribing to Content Topic:', error);
		}
	  }
	  
	  function handleSubscriptionResult(result) {
		const msgid = result.msgid;
		const existingPollIndex = polls.value.findIndex(poll => poll.msgid === msgid);
	  
		if (existingPollIndex !== -1) {
		  // Update the existing poll
		  polls.value.splice(existingPollIndex, 1, result);
		} else {
		  // Add the new poll to the array
		  polls.value.push(result);
		}
	  }

	async function unsubscribe() {
		subscription.unsubscribe([contentTopic])
	}

	async function publish(sender: string, message: string, msgid: string = Date.now() + Math.floor(Math.random() * 90000).toString()) {	
		if (!wakuNode || status.value !== 'connected') await start()
		
		try {
			const protoData = PollQuestionWakuMessage.create({
				timestamp: Date.now(),
				msgid: msgid,
				sender: sender,
				message: message
			})
			console.log(protoData);
			
			return wakuNode.lightPush.send(encoder, { payload: serializeMessage(protoData) })
				.then((result) => {
				console.log(result);
				
			})
		}
		catch (error) {
			console.error('Error publishing to Content Topic:', error);
		}
	}

	return {
		wakuNode,
		status,
		sender,
		polls,
		start,
		stop,
		subscribe,
		unsubscribe,
		publish,
	};
}

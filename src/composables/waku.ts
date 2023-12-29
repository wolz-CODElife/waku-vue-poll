import { ref } from 'vue';
import protobuf, { Message } from 'protobufjs';
import {
	createLightNode,
	waitForRemotePeer,
	createDecoder,
	createEncoder,
	Protocols,
	IFilterSubscription,
} from '@waku/sdk';

interface PollOption {
	value: string;
	votes: number;
}

interface PollMessage {
	question: string;
	options: { [key: string]: PollOption };
}

interface Poll {
	msgid: string;
	timestamp: string;
	sender: string;
	message: PollMessage;
	// other properties...
}



export const status = ref<string>('connecting...');
export const sender = ref(localStorage.getItem('senderWalletAddress') ?? '');
export const polls = ref<Poll[]>([]);

export const wakuNode = await createLightNode({
	defaultBootstrap: true,
});

export const waitForRemotePeers = async () => {
	// Wait for a successful peer connection
	await waitForRemotePeer(wakuNode, [
		Protocols.LightPush,
		Protocols.Filter,
	]);
}
// Choose a content topic
export const contentTopic = '/waku-vue-poll/1/polls/proto';

// message encoder and decoder
export const encoder = createEncoder({ contentTopic, ephemeral: true });
export const decoder = createDecoder(contentTopic);

// Message structure with Protobuf
export const PollQuestionWakuMessage = new protobuf.Type('PollQuestion')
	.add(new protobuf.Field('timestamp', 1, 'string'))
	.add(new protobuf.Field('msgid', 2, 'string'))
	.add(new protobuf.Field('sender', 3, 'string'))
	.add(new protobuf.Field('message', 4, 'string'));

export const serializeMessage = (protoMessage: Message) => {
	return PollQuestionWakuMessage.encode(protoMessage).finish()
}


export function useWaku() {

	async function start() {
		status.value = 'connecting'		
		try {
			await wakuNode?.start().then(() => {
				if (wakuNode.isStarted()) return waitForRemotePeers()
			}).then(() => {
				return wakuNode.connectionManager.getPeersByDiscovery()
			}).then((data:any) => {
				if (
					wakuNode.libp2p.getConnections().length ||
					data.CONNECTED.bootstrap.length ||
					data.CONNECTED['peer-exchange'].length
				) {
					subscribe()
					status.value = "connected"
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
	}
	let subscription = {} as IFilterSubscription

	async function subscribe() {
		if (!wakuNode || status.value !== 'connected') await start();
		try {
		  subscription = await wakuNode?.filter?.createSubscription();
		  await subscription.subscribe([decoder], (wakuMessage) => {
			const messageObj = PollQuestionWakuMessage.decode(wakuMessage.payload).toJSON();
			const result: Poll = {
				timestamp: messageObj.timestamp,
				msgid: messageObj.msgid,
				sender: messageObj.sender,
				message: JSON.parse(messageObj.message ?? '{}')
			};
			handleSubscriptionResult(result);
		  });
		} catch (error) {
		  console.error('Error subscribing to Content Topic:', error);
		}
	  }
	  
	  function handleSubscriptionResult(result:Poll) {
		const msgid = result.msgid;
		const existingPollIndex = polls.value.findIndex(poll => poll.msgid === msgid);
	  
		if (existingPollIndex !== -1) {
		  // Update the existing poll
		  polls.value.splice(existingPollIndex, 1, result);
		} else {
		  // Add the new poll to the array
		  polls.value.unshift(result);
		}
	  }

	async function unsubscribe() {
		subscription.unsubscribe([contentTopic])
	}

	async function publish(sender: string, message: string, msgid: string = Date.now() + Math.floor(Math.random() * 90000).toString()) {	
		if (!wakuNode || status.value !== 'connected') await start()
		const timestamp = new Date().toUTCString()
		
		try {
			const protoData = PollQuestionWakuMessage.create({
				timestamp: timestamp,
				msgid: msgid,
				sender: sender,
				message: message
			})
			
			return wakuNode.lightPush.send(encoder, { payload: serializeMessage(protoData) })
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
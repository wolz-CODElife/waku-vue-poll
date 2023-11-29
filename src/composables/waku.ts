import { ref } from "vue";
import protobuf from "protobufjs";
import { createLightNode, waitForRemotePeer, createDecoder, createEncoder, LightNode, Decoder, Encoder, IFilterSubscription, ILightPush } from "@waku/sdk";
import { sha256 } from 'crypto-hash';
import { useWakuStore } from "../store/wakuStore";


// Create a message structure using Protobuf with the nested Poll message
export const ChatMessage = new protobuf.Type("ChatMessage")
.add(new protobuf.Field("timestamp", 1, "uint64"))
.add(new protobuf.Field("id", 2, "string"))
.add(new protobuf.Field("sender", 3, "string"))
.add(new protobuf.Field("message", 4, "string"))

const generateUniqueID = () => {
    const userAgentHash = sha256(navigator.userAgent + Math.floor(Math.random() * 90000));
  return userAgentHash;
};

export function useWaku() {
    const wakuStore = useWakuStore()
    const wakuNode = ref<LightNode>(null as unknown as LightNode)
    const status = ref<string>('connecting...')
    const contentTopic = ref("/waku-vue-poll/1/polls/proto")
    const sender = ref(localStorage.getItem('senderID') ?? "");

    const encoder = ref<Encoder>(null as unknown as Encoder)
    const decoder =  ref<Decoder>(null as unknown as Decoder)
    const subscription = ref(null as unknown as IFilterSubscription);
    const lightpush = ref(null as unknown as ILightPush)
    const queries =  ref<any>(null)


    async function start() {
        if(wakuNode.value || status.value === "connected") return
        // perform auth or create an sender identifier for wakuStore user
        generateUniqueID().then((hashID) => {
            if (sender.value !== "") return;
            const newHash = 'abcdef012345'[Math.floor(Math.random() * 15)] + "x" + hashID.slice(-20)
            sender.value = newHash;
            wakuStore.sender = newHash
            localStorage.setItem('senderID', newHash);
        });
    
        try {
            await createLightNode({ defaultBootstrap: true, pingKeepAlive: 10 }).then(async (node: LightNode) => {
                if(wakuNode.value) return
                console.log("LightNode created...");
                await node.start()
                try {
                    await waitForRemotePeer(node);
                }finally {
                    if(!decoder.value) decoder.value = createDecoder(contentTopic.value)
                    if(!encoder.value) encoder.value = createEncoder({ contentTopic: contentTopic.value})
                    
                    wakuNode.value = node;
                    wakuStore.wakuNode = node
                    status.value = 'connected';
                    wakuStore.status = 'connected'
                    lightpush.value = node.lightPush
                    subscription.value = await node.filter.createSubscription()
                    console.log("Found peer...");
                }
            })
        } catch (error) {
            console.error('Error initializing Waku Light Node:', error);
            wakuNode.value = null as unknown as LightNode;
            wakuStore.wakuNode = null as unknown as LightNode
            status.value = 'not connected';
        }
    }
    
    
    async function stop() {
        unsubscribe()
        wakuNode.value?.stop()
        wakuStore.wakuNode = null as unknown as LightNode
        status.value = "not conencted"
        wakuStore.status = "not connected"
        console.log("Disconnected");
    }
    
    
    async function subscribe() {
        if(!wakuNode.value || status.value !== "connected") await start()
    
        if(!decoder.value) decoder.value = createDecoder(contentTopic.value)
        
        try{
            if(!subscription.value) subscription.value = await wakuNode.value.filter.createSubscription()
            if (wakuNode.value?.filter && subscription.value) {
                console.log("Subscribing");
                
                subscription.value.subscribe([decoder.value], (wakuMessage: any) => {
                    console.log(wakuMessage);
                    
                    if (!wakuMessage.payload) return
                    const newMessage = ChatMessage.decode(wakuMessage.payload)
                    console.log("New Messages: ",  newMessage);
                })
    
            } else {
                console.error('WakuNode or WakuNode filter not available.');
            }                
        } catch (error) {
            console.error('Error subscribing to Content Topic:', error);
        }
    
    }
    async function unsubscribe() {
        if (subscription.value) {
            subscription.value.unsubscribe([contentTopic.value]);
            subscription.value = null as unknown as IFilterSubscription;
        }
    }
    
    async function publish(sender: string, message: string) {
        if (!wakuNode.value || status.value !== "connected" ) await start()
    
        if(!encoder.value) encoder.value = createEncoder({ contentTopic: contentTopic.value})
    
        const timestamp = Date.now()
        const msgID = timestamp + Math.floor(Math.random() * 90000).toString()
    
        const protoMessage = ChatMessage.create({
            timestamp: timestamp,
            id: msgID,
            sender: sender,
            message: message,
        });
    
        const serializedMessage = ChatMessage.encode(protoMessage).finish();
        console.log(serializedMessage);
        console.log(encoder.value);
        console.log(wakuNode.value.lightPush);
        
        
        
        try {
            await lightpush.value.send(encoder.value, {payload: serializedMessage})
        } catch (error) {
            console.error('Error publishing to Content Topic:', error);
        }
    }

    return {wakuNode, status, sender, queries, start, stop, subscribe, unsubscribe, publish}
}


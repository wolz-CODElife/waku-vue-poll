// wakuStore.ts
import { defineStore } from 'pinia';
import { createLightNode, waitForRemotePeer, LightNode, createDecoder, createEncoder, Decoder, Encoder } from "@waku/sdk";
import protobuf from "protobufjs";
import { sha256 } from 'crypto-hash';



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

export const useWakuStore = defineStore({
    id: 'waku',
    state: () => ({
        wakuNode: null as LightNode | null,
        status: 'connecting...',
        contentTopic: "/waku-vue-poll/1/polls/proto",
        sender: localStorage.getItem('senderID') || "",
        encoder: null as Encoder | null,
        decoder: null as Decoder | null,
        queries: null as any
    }),
    actions: {
        async start() {
            if(this.wakuNode || this.status === "connected") return
            // perform auth or create an sender identifier for this user
            generateUniqueID().then((hashID) => {
                if (this.sender !== "") return;
                const newHash = 'abcdef012345'[Math.floor(Math.random() * 15)] + "x" + hashID.slice(-20)
                this.sender = newHash;
                localStorage.setItem('senderID', newHash);
            });

            try {
                const node = await createLightNode({ defaultBootstrap: true });
                console.log("LightNode created...");
                await node.start()
                await waitForRemotePeer(node);

                if(!this.decoder) this.decoder = createDecoder(this.contentTopic)
                if(!this.encoder) this.encoder = createEncoder({ contentTopic: this.contentTopic})

                this.wakuNode = node;
                this.status = 'connected';
                console.log("Found peer...");
                
            } catch (error) {
                console.error('Error initializing Waku Light Node:', error);
                this.wakuNode = null
                this.status = 'not connected';
            }
        },
        async stop() {
            this.wakuNode?.stop()
            this.status = "not conencted"
            console.log("Disconnected");
        },
        async subscribe() {
            if(!this.wakuNode || this.status !== "connected") await this.start()

            if(!this.decoder) this.decoder = createDecoder(this.contentTopic)
            
            const callback = (wakuMessage: any) => {
                if (!wakuMessage.payload) return
                const newMessage = ChatMessage.decode(wakuMessage.payload)
                console.log(newMessage);
            }
            try{
                const subscription = await this.wakuNode?.filter.createSubscription()
                await subscription?.subscribe([this.decoder], callback)
            } catch (error) {
                console.error('Error subscribing to Content Topic:', error);
            }

        },
        async publish(sender: string, message: string) {
            if (!this.wakuNode || this.status !== "connected" ) await this.start()

            if(!this.encoder) this.encoder = createEncoder({ contentTopic: this.contentTopic})

            const timestamp = Date.now()
            const msgID = timestamp + Math.floor(Math.random() * 90000).toString()

            const protoMessage = ChatMessage.create({
                timestamp: timestamp,
                id: msgID,
                sender: sender,
                message: message,
            });

            const serializedMessage = ChatMessage.encode(protoMessage).finish();

            try {
                await this.wakuNode!.lightPush.send(this.encoder, {payload: serializedMessage})
            } catch (error) {
                console.error('Error publishing to Content Topic:', error);
            }
        }
    },
});

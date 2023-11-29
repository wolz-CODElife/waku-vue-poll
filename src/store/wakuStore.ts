import { reactive } from 'vue';
import { LightNode, Decoder, Encoder } from "@waku/sdk";


export const useWakuStore = reactive({
        wakuNode: null as LightNode | null,
        status: 'connecting...',
        contentTopic: "/waku-vue-poll/1/polls/proto",
        sender: localStorage.getItem('senderID') || "",
        encoder: null as Encoder | null,
        decoder: null as Decoder | null,
        queries: null as any
})

    



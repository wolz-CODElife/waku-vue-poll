<template>
  <div class="text-center flex flex-col items-center">
    <h1 class="text-3xl">Vote Public Polls 🗳️</h1>
    <p class="mb-4 font-bold">Polls ({{ waku.polls.value.length }})</p>
    <div class="w-full max-w-lg p-10 h-[calc(100vh-300px)] md:h-[calc(100vh-196px)] overflow-y-auto mx-auto my-auto text-center rounded-xl shadow-lg bg-white" >
      <!-- Blackbox Create a list of polls -->
      <div class="w-full text-start" v-if="waku.polls.value.length" v-for="poll in waku.polls.value" :key="poll.msgid">
        <div class="">
          <p class="font-semibold">Question : {{ poll.message?.question }}</p>
          <p class="text-sm text-gray-500 italic"> {{ formatDate(poll.timestamp) }}</p>
          <form>
            <div v-for="(option, key) in filteredOptions(poll.message?.options)" :key="key" class="rounded-full flex items-center justify-between px-3 py-2 my-4 text-sm leading-6 hover:bg-gray-100 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              {{option.value }}
              <span v-if="isVoted(poll.msgid)">{{ option.votes }}</span>
              <input
                v-if="!isVoted(poll.msgid) && !loading" 
                type="radio" 
                :name="poll.msgid" 
                class="h-5 w-5" 
                @change="handleVote(poll.msgid, key)">
            </div>
          </form>
        </div>
        <hr class="my-12">
      </div>
    </div>
  </div>
</template>
  
<script lang="ts" setup>
import {  onMounted, ref, reactive } from 'vue';
import { useWaku } from '../composables/waku';

const getVotedPollsFromLocalStorage = () => {
  const storedVotedPolls = localStorage.getItem('votedPolls');
  return storedVotedPolls ? JSON.parse(storedVotedPolls) : [];
};
const waku = useWaku();
const votedPolls = ref(getVotedPollsFromLocalStorage());
const loading = ref<boolean>(false)

const filteredOptions = (options:object) => {
  return Object.fromEntries(Object.entries(options || {}).filter(([_, value]) => value.value));
};

const isVoted = (msgid:string) => {
  return votedPolls.value.includes(msgid);
};


const handleVote = async (msgid: string, selectedOption: string | number) => {
  loading.value = true
  try {
    // Find the selected poll in the polls array
    let selectedPollIndex = waku.polls.value.findIndex((poll) => poll.msgid === msgid);

    if (selectedPollIndex !== -1) {
      // Update the vote count before publishing
      waku.polls.value[selectedPollIndex].message.options[selectedOption].votes += 1;

      // Create a reactive copy to trigger reactivity
      const reactiveCopy = reactive({ ...waku.polls.value[selectedPollIndex] });

      // Publish the updated poll
      
      const stringifiedMessage = JSON.stringify(reactiveCopy.message);
      
      await waku.publish(reactiveCopy.sender , stringifiedMessage, reactiveCopy.timestamp, msgid);

      // Store the msgid in local storage
      votedPolls.value.push(msgid);
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls.value));
    }
    loading.value = false
  } catch (error) {
    console.error('Error in handleVote:', error);
  }
};

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const formattedDate = date.toLocaleString('en-US', options);
  return formattedDate;
};

onMounted(() => {
  if (waku.wakuNode && waku.wakuNode.isStarted() && waku.sender.value !== '') {
    waku.subscribe()
    
  }
});




</script>

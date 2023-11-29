<template>
  <div class="text-center flex flex-col items-center">
    <h1 class="text-3xl">Vote Public Polls 🗳️</h1>
    <p class="mb-4 font-bold">Polls (100)</p>
    <div class="w-full max-w-lg p-10 h-[calc(100vh-300px)] md:h-[calc(100vh-196px)] overflow-y-auto mx-auto my-auto text-center rounded-xl shadow-lg bg-white" >
      <!-- Blackbox Create a list of polls -->
      <div class="w-full text-start" v-for="poll in polls" :key="poll.id">
        <div class="">
          <p class="font-semibold">Question {{poll.id}}: {{ poll.question }}</p>
          <form>
            <div v-for="option in poll.options" :key="option" class="rounded-full flex items-center justify-between px-3 py-2 my-4 text-sm leading-6 hover:bg-gray-100 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              {{option}} <input type="radio" :name="poll.id" class="h-5 w-5">
            </div>
          </form>
        </div>
        <hr class="my-12">
      </div>
    </div>
  </div>
</template>
  
<script lang="ts" setup>
import {  onMounted } from 'vue'
import { useWaku } from '../composables/waku'







    const { subscribe } = useWaku()

      onMounted(() => {
        // Subscribe to contentTopic on waku node when the component is mounted
          subscribe()
      })

  

      const  polls = [{ 
          id: "1", 
            question: "Is this the best poll ever?", 
            options: ["Yes!", "No way!"], 
            votes : [{ 
              userId: "1", 
              optionIndex: 0
            }, {
              userId: "2", 
              optionIndex: 1
            }] 
          },
          { 
            id: "2", 
            question: "What is your favorite color?", 
            options: ["Red", "Blue", "Green"], 
            votes: [{ 
              userId: "1", 
              optionIndex: 0
            }, {
              userId: "2", 
              optionIndex: 1
            }]
          },
          { 
            id: "3", 
            question: "Should we build an AI?", 
            options: ["Yes, please.", "No thanks."],
            votes: []
          }]
      }
    }

</script>

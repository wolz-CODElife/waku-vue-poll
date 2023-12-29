<template>
  <nav class="">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="-ml-2 mr-2 flex items-center md:hidden">
            <!-- Mobile menu button -->
            <button @click="isOpen = !isOpen" type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
              <span class="sr-only">Open main menu</span>

              <svg v-if="!isOpen" class="h-6 w-6" :class="isOpen ? 'hidden' : 'block'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>

              <svg v-else class="h-6 w-6" :class="isOpen ? 'block' : 'hidden'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-shrink-0 flex items-center">
            <img class="block lg:hidden h-7 w-auto" src="https://api.iconify.design/fluent:poll-20-filled.svg?color=%23888888" alt="Waku Vue poll logo" />
            <img class="hidden lg:block h-7 w-auto" src="https://api.iconify.design/fluent:poll-20-filled.svg?color=%23888888" alt="Waku Vue poll logo" />
          </div>
          <div class="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
            <router-link v-for="route in routes" :key="route" :to="{ name: route }" :class="`${currentRouteName === route ? 'bg-gray-900 text-white' : 'text-gray-500'} hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium`">{{ route }}</router-link>
          </div>
        </div>
        <div v-if="waku.wakuNode && waku.sender.value" class="flex items-center gap-2">
          <div class="relative -z-100 w-max">
            <button @click="copyToClipboard" type="button" class="hover:bg-gray-200 rounded-md px-3 py-2 text-xs font-bold">{{ waku.sender.value.slice(0, 7) + '...' + waku.sender.value.slice(-5) }}</button>

            <span v-if="copied" class="pointer-events-none absolute -bottom-9 -left-1 w-max z-10 inline-block p-2 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-sm tooltip">
              Copied to clipboard!
            </span>
          </div>
          <button @click="disconnectWallet" title="Disconnect Wallet" class="flex items-center bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="#404040" d="M12 18.5c0 .5.07 1 .18 1.5H6.5c-1.5 0-2.81-.5-3.89-1.57C1.54 17.38 1 16.09 1 14.58c0-1.3.39-2.46 1.17-3.48S4 9.43 5.25 9.15c.42-1.53 1.25-2.77 2.5-3.72S10.42 4 12 4c1.95 0 3.6.68 4.96 2.04C18.32 7.4 19 9.05 19 11c1.15.13 2.1.63 2.86 1.5c.24.26.43.55.6.86A6.37 6.37 0 0 0 18.5 12a6.5 6.5 0 0 0-6.5 6.5m11 0c0 2.5-2 4.5-4.5 4.5S14 21 14 18.5s2-4.5 4.5-4.5s4.5 2 4.5 4.5m-3 2.58L15.92 17c-.27.42-.42.94-.42 1.5c0 1.66 1.34 3 3 3c.56 0 1.08-.15 1.5-.42m1.5-2.58c0-1.66-1.34-3-3-3c-.56 0-1.08.15-1.5.42L21.08 20c.27-.42.42-.94.42-1.5"/></svg>
          </button>
        </div>
        <div v-else class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <circle cx="18" cy="12" r="0" fill="#404040">
              <animate attributeName="r" begin=".67" calcMode="spline" dur="1.5s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0" />
            </circle>
            <circle cx="12" cy="12" r="0" fill="#404040">
              <animate attributeName="r" begin=".33" calcMode="spline" dur="1.5s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0" />
            </circle>
            <circle cx="6" cy="12" r="0" fill="#404040">
              <animate attributeName="r" begin="0" calcMode="spline" dur="1.5s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0" />
            </circle>
          </svg>
        </div>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <button v-if="waku.wakuNode.isStarted() && waku.sender.value !==''" @click="onToggle" class="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md text-sm font-medium flex gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path fill="#404040"
                  d="M17.5 21h1v-2.5H21v-1h-2.5V15h-1v2.5H15v1h2.5V21Zm.5 2q-2.075 0-3.538-1.463T13 18q0-2.075 1.463-3.538T18 13q2.075 0 3.538 1.463T23 18q0 2.075-1.463 3.538T18 23ZM7 9h10V7H7v2Zm4.675 12H5q-.825 0-1.413-.588T3 19V5q0-.825.588-1.413T5 3h14q.825 0 1.413.588T21 5v6.7q-.725-.35-1.463-.525T18 11q-.275 0-.513.012t-.487.063V11H7v2h6.125q-.45.425-.813.925T11.675 15H7v2h4.075q-.05.25-.063.488T11 18q0 .825.15 1.538T11.675 21Z" />
              </svg>
              Create Poll </button>
            <button v-else @click="connectWallet" class="bg-gray-200 cursor-pointer px-3 py-2 rounded-md text-sm font-medium flex gap-1"> 
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="#404040" fill-rule="evenodd" clip-rule="evenodd"><path d="M21.1 8.004C21.045 8 20.984 8 20.92 8h-2.525c-2.068 0-3.837 1.628-3.837 3.75s1.77 3.75 3.837 3.75h2.525c.064 0 .125 0 .182-.004a1.755 1.755 0 0 0 1.645-1.628c.004-.06.004-.125.004-.185V9.817c0-.06 0-.125-.004-.185a1.755 1.755 0 0 0-1.645-1.628m-2.928 4.746c.532 0 .963-.448.963-1s-.431-1-.963-1c-.533 0-.964.448-.964 1s.431 1 .964 1"/><path d="M20.918 17a.22.22 0 0 1 .221.278c-.2.712-.519 1.32-1.03 1.83c-.749.75-1.698 1.081-2.87 1.239c-1.14.153-2.595.153-4.433.153h-2.112c-1.838 0-3.294 0-4.433-.153c-1.172-.158-2.121-.49-2.87-1.238c-.748-.749-1.08-1.698-1.238-2.87C2 15.099 2 13.644 2 11.806v-.112C2 9.856 2 8.4 2.153 7.26c.158-1.172.49-2.121 1.238-2.87c.749-.748 1.698-1.08 2.87-1.238C7.401 3 8.856 3 10.694 3h2.112c1.838 0 3.294 0 4.433.153c1.172.158 2.121.49 2.87 1.238c.511.512.83 1.119 1.03 1.831a.22.22 0 0 1-.221.278h-2.524c-2.837 0-5.337 2.24-5.337 5.25s2.5 5.25 5.337 5.25zM5.75 7a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5z"/></g></svg>
              Connect Wallet
            </button>

          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state. -->
    <div v-if="isOpen" class="md:hidden" id="mobile-menu">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->

        <router-link v-for="route in routes" :key="route" :to="{ name: route }" :class="`${currentRouteName === route ? 'bg-gray-900 text-white' : 'text-gr5y-800 '} hover:bg-gray4300 hover:text-white block px-3 py-2 rounded-md text-base font-medium`"
          :aria-current="currentRouteName === route ? 'page' : null">{{ route }}</router-link>
      </div>
    </div>
  </nav>
  <transition name="fade">
    <div v-if="isModalOpen" class="fixed w-full h-full z-100 p-6 md:p-10 flex-col item-center justify-center">
      <div @click="onToggle" class="absolute bg-black opacity-70 inset-0 outline-none"></div>
      <div class="w-full max-w-lg p-6 md:p-10 max-h-content overflow-y-auto relative mx-auto my-auto text-center rounded-xl shadow-lg bg-white">
        <button @click="onToggle" class="absolute top-4 right-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
            <path fill="#000000"
              d="m12 13.4l2.9 2.9q.275.275.7.275t.7-.275q.275-.275.275-.7t-.275-.7L13.4 12l2.9-2.9q.275-.275.275-.7t-.275-.7q-.275-.275-.7-.275t-.7.275L12 10.6L9.1 7.7q-.275-.275-.7-.275t-.7.275q-.275.275-.275.7t.275.7l2.9 2.9l-2.9 2.9q-.275.275-.275.7t.275.7q.275.275.7.275t.7-.275l2.9-2.9Zm0 8.6q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Z" />
          </svg>
        </button>
        <h1 class="my-4 md:my-8 text-3xl">Create a Poll 🗳️</h1>
        <p>Send a poll to Waku users, and see what people think!</p>
        <p><b>Note: This app works doesn't require gas fees</b></p>


        <form class="mx-auto w-[calc(100%-50px)]">
          <!-- Question -->
          <label for="question" class="block text-gray-700 text-sm font-bold mb-2">Question ({{ questionLength }}/50) </label>
          <textarea v-model="poll.question" type="text" id="question" placeholder="" required class="shadow border rounded w-full p-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>


          <!-- Options -->
          <label for="option" class="block text-gray-700 text-sm font-bold mb-2">Options</label>
          <div>
            <p class="flex justify-between items-center gap-2 my-2 text-gray-700 text-sm font-bold"> (A) <input type="text" v-model="poll.options.a.value" class="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" /></p>
            <p class="flex justify-between items-center gap-2 my-2 text-gray-700 text-sm font-bold"> (B) <input type="text" v-model="poll.options.b.value" class="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" /></p>
            <p class="flex justify-between items-center gap-2 my-2 text-gray-700 text-sm font-bold"> (C) <input type="text" v-model="poll.options.c.value" class="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" /></p>
            <p class="flex justify-between items-center gap-2 my-2 text-gray-700 text-sm font-bold"> (D) <input type="text" v-model="poll.options.d.value" class="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" /></p>
            <p class="flex justify-between items-center gap-2 my-2 text-gray-700 text-sm font-bold"> (E) <input type="text" v-model="poll.options.e.value" class="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" /></p>
          </div>

          <div class="mt-4">
            <button @click.prevent="sendMessage" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-500
                hover:bg-blue-400 focus:outline-none focus:border-blue-600 focus:shadow active:bg-blue-600 transition duration-150 ease-in-out">
              Create Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Poll } from '../interfaces'
import { useWaku } from '../composables/waku'
import {useWalletConnect} from '../composables/client'


const isOpen = ref<boolean>(false)
const isModalOpen = ref<boolean>(false)
const routes = <any>["Home", "Polls"]
const questionLength = ref<string>("100")
const poll = ref<Poll>({
  question: "",
  options: {
    a: {
      value: "",
      votes: 0
    },
    b: {
      value: "",
      votes: 0
    },
    c: {
      value: "",
      votes: 0
    },
    d: {
      value: "",
      votes: 0
    },
    e: {
      value: "",
      votes: 0
    }
  }
})
const Route = useRoute()
const copied = ref<boolean>(false)
const waku = useWaku()
const {connectWallet, disconnectWallet} = useWalletConnect()



const onToggle = () => {
  isModalOpen.value = !isModalOpen.value;
}
const copyToClipboard = () => {
  const textToCopy = waku.sender.value;

  // Create a textarea element to hold the text
  const textarea = document.createElement('textarea');
  textarea.value = textToCopy;
  document.body.appendChild(textarea);

  // Optionally, provide user feedback (e.g., a toast or alert)
  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 1000)
}
const sendMessage = () => {
  const stringifiedMessage = JSON.stringify(poll.value)

  // send a message
  waku.publish(waku.sender.value, stringifiedMessage)

  // reset question state
  poll.value = {
    question: "",
    options: {
      a: {
        value: "",
        votes: 0
      },
      b: {
        value: "",
        votes: 0
      },
      c: {
        value: "",
        votes: 0
      },
      d: {
        value: "",
        votes: 0
      },
      e: {
        value: "",
        votes: 0
      }
    }
  }
  onToggle()
}


const currentRouteName = computed(() => {
  return Route.name;
})


</script>

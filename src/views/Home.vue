<template>
    <div class="text-center py-12 flex flex-col items-center">
      <img src="@/assets/3dpoll.jpg" alt="Stream Live Poll Votes" loading="lazy" class="max-w-full w-[400px]">
      <h1 class="my-4 text-3xl">Poll in <span class="text-blue-500">Real Time!</span></h1>
      <p>Believe it or not, every vote shapes the conversation. Join in now!</p>

      <div class="sm:mb-8 sm:flex sm:justify-center">
        <div class="rounded-full px-3 py-1 my-4 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
          <span class="hidden sm:inline">Do you want to contribute to this project. </span><a href="https://github.com/wolz-CODElife/waku-vue-poll" target="_blank" class="font-semibold text-blue-500">GitHub ❤️ <span>&rarr;</span></a>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue'
  
  export default defineComponent({
    setup() {
  
      return {
      }
    },
  })
  </script>
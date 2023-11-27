<script lang="ts">
import { defineComponent, onMounted, watchEffect } from 'vue';
import NavBar from '@/components/NavBar.vue';
import { useWaku } from './composables/waku';
import { useWakuStore } from './store/wakuStore';

export default defineComponent({
  setup() {
    const wakuStore = useWakuStore()
    const { start } = useWaku()

    // Initialize Waku node when the component is mounted
    onMounted(() => {
      start()
    });

    watchEffect(() => {
      if(!wakuStore.wakuNode || !wakuStore.sender || wakuStore.status !== "connected") start()
    })

    
    return {
      wakuStore
    };
  },
  components: { NavBar },
});
</script>

<template>
  <div class="flex flex-col h-screen justify-between">
    <!-- Conditionally render NavBar when wakunode is defined -->
    <NavBar />
    <router-view class="container max-w-8xl mx-auto mb-auto px-4" />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>

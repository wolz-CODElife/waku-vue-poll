<script lang="ts">
import { defineComponent, onMounted, watchEffect } from 'vue';
import NavBar from '@/components/NavBar.vue';
import { useWaku } from './composables/waku';

export default defineComponent({
  setup() {
    const waku = useWaku()

    // Initialize Waku node when the component is mounted
    onMounted(() => {
      if (!waku.wakuNode.isStarted() && waku.sender.value !== '') {
        waku.start()
      }
    });

    watchEffect(() => {
      if((!waku.wakuNode ||  waku.status.value !== "connected") && waku.sender.value !== '') waku.start()
    })

    return {
      waku
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

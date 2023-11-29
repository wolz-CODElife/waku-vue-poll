<script setup lang="ts">
import { onMounted } from 'vue';
import { useWakuStore } from './store/wakuStore.ts';
import NavBar from '@/components/NavBar.vue';



// Initialize Waku node when the component is mounted
onMounted(() => {
  const wakuStore = useWakuStore();
 wakuStore.start();
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

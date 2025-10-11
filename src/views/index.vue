<template>
  <div class="web-layout">
    <Header />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
</script>
<style scoped>
.web-layout {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  /* padding-top: 80px; */
}
</style>

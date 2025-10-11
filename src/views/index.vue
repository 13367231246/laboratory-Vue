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
  width: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  padding-top: 50px;
}
@media (max-width: 768px) {
  .main-content {
    padding-top: 40px;
  }
}
</style>

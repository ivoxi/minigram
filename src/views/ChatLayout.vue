<script setup lang="ts">
import ChatList from '../components/ChatList.vue'
import ChatWindow from '../components/ChatWindow.vue'
</script>

<template>
  <v-app>
    <v-main class="chat-layout">
      <v-container fluid class="fill-height pa-0">
        <v-row no-gutters class="chat-row fill-height bg-white">
          <v-col cols="12" md="4" lg="3" class="chat-list pa-0">
            <ChatList />
          </v-col>
          <v-col cols="12" md="8" lg="9" class="chat-window pa-0">
            <ChatWindow />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.chat-layout {
  min-height: 100vh;
}

:deep(.chat-row) {
  margin: 0 !important;
  gap: 0 !important;
}

.chat-list,
.chat-window {
  min-height: 50vh;
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
}

.chat-list {
  background: #ffffff;
}

.chat-window {
  background: #ffffff;
}
</style>

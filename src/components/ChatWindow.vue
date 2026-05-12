<script setup lang="ts">
import { storeToRefs } from 'pinia'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'
import { useChatsStore } from '../stores/useChatsStore'

const chatsStore = useChatsStore()
const { activeChatDisplayName, activeChatIsTyping, activeMessages } = storeToRefs(chatsStore)
</script>

<template>
  <v-sheet class="d-flex h-100 flex-column" color="white" rounded="0">
    <v-toolbar flat density="comfortable" class="px-2 border-b border-slate-200" :style="{ height: 'var(--chat-item-height, 72px)' }">
      <v-toolbar-title>
        <v-list-item-title class="font-semibold !text-white">{{ activeChatDisplayName }}</v-list-item-title>
        <v-list-item-subtitle class="!text-white/60">
          <template v-if="activeChatIsTyping">
            <span class="typing-indicator">печатает</span>
          </template>
          <template v-else>был в сети 5 минут назад</template>
        </v-list-item-subtitle>
      </v-toolbar-title>
    </v-toolbar>

    <v-sheet class="flex-1 overflow-y-auto px-4 py-4" color="transparent">
      <MessageBubble
        v-for="message in activeMessages"
        :key="message.id"
        :id="message.id"
        :text="message.text"
        :time="message.time"
        :is-mine="message.isMine"
      />
    </v-sheet>

    <MessageInput />
  </v-sheet>
</template>

<style scoped>
:deep(.v-toolbar__content) {
  height: 100% !important;
  padding-bottom: 0 !important;
}

.typing-indicator::after {
  content: '';
  animation: dots 1.2s steps(3, end) infinite;
}

@keyframes dots {
  0%   { content: ''; }
  33%  { content: '.'; }
  66%  { content: '..'; }
  100% { content: '...'; }
}
</style>

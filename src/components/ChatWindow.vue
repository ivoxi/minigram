<script setup lang="ts">
import { storeToRefs } from 'pinia'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'
import { useChatsStore } from '../stores/useChatsStore'

const chatsStore = useChatsStore()
const { activeChat, activeMessages } = storeToRefs(chatsStore)
</script>

<template>
  <v-sheet class="d-flex h-100 flex-column" color="white" rounded="0">
    <v-toolbar flat density="comfortable" class="border-b border-slate-200 px-2">
      <v-toolbar-title class="text-white-900 text-lg font-semibold">
        {{ activeChat?.name ?? 'Chat' }}
      </v-toolbar-title>
    </v-toolbar>

    <v-sheet class="flex-1 overflow-y-auto px-4 py-4" color="transparent">
      <MessageBubble
        v-for="message in activeMessages"
        :key="message.id"
        :text="message.text"
        :time="message.time"
        :is-mine="message.isMine"
      />
    </v-sheet>

    <MessageInput />
  </v-sheet>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import ChatItem from './ChatItem.vue'
import { useChatsStore } from '../stores/useChatsStore'
import type { Uuid } from '../types/chat'

const chatsStore = useChatsStore()
const { chatsWithPreview, activeChatId } = storeToRefs(chatsStore)
const router = useRouter()

const selectChat = (chatId: Uuid): void => {
  void router.push({ name: 'chat-by-id', params: { chatId } })
}
</script>

<template>
  <v-list class="bg-transparent pa-0">
    <ChatItem
      v-for="chat in chatsWithPreview"
      :key="chat.chatId"
      :name="chat.name"
      :last-message="chat.lastMessage"
      :time="chat.time"
      :active="activeChatId === chat.chatId"
      @select="selectChat(chat.chatId)"
    />
  </v-list>
</template>

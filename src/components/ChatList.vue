<script setup lang="ts">
import { storeToRefs } from 'pinia'
import ChatItem from './ChatItem.vue'
import { useChatsStore } from '../stores/useChatsStore'

const chatsStore = useChatsStore()
const { chatsWithPreview, activeChatId } = storeToRefs(chatsStore)

const selectChat = (chatId: number): void => {
  chatsStore.selectChat(chatId)
}
</script>

<template>
  <v-list class="bg-transparent pa-0">
    <ChatItem
      v-for="chat in chatsWithPreview"
      :key="chat.id"
      :name="chat.name"
      :last-message="chat.lastMessage"
      :time="chat.time"
      :active="activeChatId === chat.id"
      @select="selectChat(chat.id)"
    />
  </v-list>
</template>

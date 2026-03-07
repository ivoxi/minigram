<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ChatList from '../components/ChatList.vue'
import ChatWindow from '../components/ChatWindow.vue'
import { useChatsStore } from '../stores/useChatsStore'
import type { Uuid } from '../types/chat'

const chatsStore = useChatsStore();
const route = useRoute();
const router = useRouter();

const getRouteChatId = (): Uuid | null => {
  const rawChatId = route.params.chatId
  return typeof rawChatId === 'string' ? rawChatId : null
}

const syncRouteWithStore = async (): Promise<void> => {
  if (chatsStore.chats.length === 0) {
    chatsStore.activeChatId = null
    return
  }

  const routeChatId = getRouteChatId()
  const hasRouteChat = routeChatId !== null && chatsStore.chats.some((chat) => chat.chatId === routeChatId)

  if (hasRouteChat && routeChatId !== null) {
    await chatsStore.selectChat(routeChatId)
    return
  }

  const fallbackChatId = chatsStore.chats[0]?.chatId
  if (!fallbackChatId) return

  await chatsStore.selectChat(fallbackChatId)

  if (routeChatId !== fallbackChatId) {
    await router.replace({ name: 'chat-by-id', params: { chatId: fallbackChatId } })
  }
}

onMounted(async () => {
  await chatsStore.initialize()
  await syncRouteWithStore()
})

watch(
  () => route.params.chatId,
  async () => {
    if (chatsStore.isLoading) return
    await syncRouteWithStore()
  },
)
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

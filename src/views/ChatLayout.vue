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
    <v-main>
      <div class="chat-layout">
        <div class="chat-list">
          <ChatList />
        </div>
        <div class="chat-window">
          <ChatWindow />
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.chat-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  --chat-item-height: 72px;
}

.chat-list {
  width: 300px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid #e2e8f0;
  background: #ffffff;
}

.chat-window {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  background: #ffffff;
}
</style>

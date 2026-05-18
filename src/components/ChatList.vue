<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import ChatItem from './ChatItem.vue'
import { useChatsStore } from '../stores/useChatsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useProfileDialog } from '../composables/useProfileDialog'
import { useCreateGroupDialog } from '../composables/useCreateGroupDialog'
import type { Uuid } from '../types/chat'

const chatsStore = useChatsStore()
const authStore = useAuthStore()
const { chatsWithPreview, activeChatId, users } = storeToRefs(chatsStore)
const { userId: currentUserId } = storeToRefs(authStore)
const profileDialog = useProfileDialog()
const groupDialog = useCreateGroupDialog()
const router = useRouter()

const searchQuery = ref('')

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

const filteredChats = computed(() => {
  if (!normalizedQuery.value) return chatsWithPreview.value
  return chatsWithPreview.value.filter((c) => c.name.toLowerCase().includes(normalizedQuery.value))
})

const foundUsers = computed(() => {
  if (!normalizedQuery.value) return []
  const q = normalizedQuery.value
  return users.value.filter((u) => {
    if (u.userId === currentUserId.value) return false
    return (
      (u.nickname ?? '').toLowerCase().includes(q) ||
      (u.name ?? '').toLowerCase().includes(q) ||
      (u.phoneNumber ?? '').toLowerCase().includes(q)
    )
  })
})

const userDisplayName = (user: { nickname: string | null; name: string | null }): string =>
  user.nickname?.trim() || user.name?.trim() || 'Unknown'

const userFirstLetter = (user: { nickname: string | null; name: string | null }): string =>
  userDisplayName(user).charAt(0).toUpperCase()

const selectChat = (chatId: Uuid): void => {
  void router.push({ name: 'chat-by-id', params: { chatId } })
}

const openUserProfile = (userId: Uuid): void => {
  profileDialog.open(userId)
}

const startChatWithUser = async (userId: Uuid, event: MouseEvent): Promise<void> => {
  event.stopPropagation()
  const chatId = await chatsStore.createOrOpenDirectChat(userId)
  if (chatId) {
    searchQuery.value = ''
    await router.push({ name: 'chat-by-id', params: { chatId } })
  }
}
</script>

<template>
  <div class="search-container">
    <v-text-field
      v-model="searchQuery"
      placeholder="Поиск чатов и пользователей"
      variant="solo"
      density="compact"
      hide-details
      flat
      class="search-input flex-1"
      prepend-inner-icon="mdi-magnify"
      clearable
    />
    <v-btn
      icon="mdi-account-multiple-plus"
      color="blue-darken-2"
      size="small"
      variant="flat"
      class="ml-2"
      @click="groupDialog.open"
    />
  </div>

  <v-list class="bg-transparent pa-0">
    <ChatItem
      v-for="chat in filteredChats"
      :key="chat.chatId"
      :name="chat.name"
      :last-message="chat.lastMessage"
      :time="chat.time"
      :is-group="chat.isGroup"
      :member-count="chat.memberCount"
      :active="activeChatId === chat.chatId"
      @select="selectChat(chat.chatId)"
    />

    <template v-if="foundUsers.length > 0">
      <div class="section-header">Пользователи</div>
      <v-list-item
        v-for="user in foundUsers"
        :key="user.userId"
        class="user-result !px-4 !py-3"
        :ripple="false"
        @click="openUserProfile(user.userId)"
      >
        <template #prepend>
          <v-avatar color="blue-grey-lighten-4" class="mr-3 text-slate-700">
            {{ userFirstLetter(user) }}
          </v-avatar>
        </template>
        <v-list-item-title class="font-semibold !text-slate-900">
          {{ userDisplayName(user) }}
        </v-list-item-title>
        <v-list-item-subtitle class="!text-slate-500">
          {{ user.phoneNumber || '@' + (user.nickname || '') }}
        </v-list-item-subtitle>
        <template #append>
          <v-btn
            icon="mdi-message-plus"
            variant="text"
            size="small"
            color="blue-darken-2"
            @click="(e: MouseEvent) => startChatWithUser(user.userId, e)"
          />
        </template>
      </v-list-item>
    </template>

    <div
      v-if="normalizedQuery && filteredChats.length === 0 && foundUsers.length === 0"
      class="empty-state"
    >
      Ничего не найдено
    </div>
  </v-list>
</template>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.search-input :deep(.v-field) {
  background: #f1f5f9 !important;
  border-radius: 10px;
  color: #0f172a !important;
}

.search-input :deep(.v-field input) {
  color: #0f172a !important;
}

.search-input :deep(.v-field input::placeholder) {
  color: #64748b !important;
  opacity: 1;
}

.search-input :deep(.v-field .v-icon) {
  color: #64748b !important;
}

.section-header {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  padding: 10px 16px 6px;
  letter-spacing: 0.5px;
}

.user-result {
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
}

.user-result:hover {
  background: #f8fafc;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  padding: 24px;
}
</style>

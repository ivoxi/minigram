<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useChatsStore } from '../stores/useChatsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useCreateGroupDialog } from '../composables/useCreateGroupDialog'
import type { Uuid } from '../types/chat'

const chatsStore = useChatsStore()
const authStore = useAuthStore()
const { users } = storeToRefs(chatsStore)
const { userId: currentUserId } = storeToRefs(authStore)
const { isOpen, close } = useCreateGroupDialog()
const router = useRouter()

const groupName = ref('')
const selectedIds = ref<Uuid[]>([])
const search = ref('')
const isCreating = ref(false)
const error = ref<string | null>(null)

watch(isOpen, (open) => {
  if (open) {
    groupName.value = ''
    selectedIds.value = []
    search.value = ''
    error.value = null
  }
})

const availableUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  return users.value
    .filter((u) => u.userId !== currentUserId.value)
    .filter((u) => {
      if (!q) return true
      return (
        (u.nickname ?? '').toLowerCase().includes(q) ||
        (u.name ?? '').toLowerCase().includes(q) ||
        (u.phoneNumber ?? '').toLowerCase().includes(q)
      )
    })
})

const displayName = (user: { nickname: string | null; name: string | null }): string =>
  user.nickname?.trim() || user.name?.trim() || 'Unknown'

const firstLetter = (user: { nickname: string | null; name: string | null }): string =>
  displayName(user).charAt(0).toUpperCase()

const isValid = computed(
  () => groupName.value.trim().length > 0 && selectedIds.value.length >= 2,
)

const toggleUser = (userId: Uuid): void => {
  const idx = selectedIds.value.indexOf(userId)
  if (idx === -1) {
    selectedIds.value = [...selectedIds.value, userId]
  } else {
    selectedIds.value = selectedIds.value.filter((id) => id !== userId)
  }
}

const submit = async (): Promise<void> => {
  if (!isValid.value) return
  isCreating.value = true
  error.value = null
  try {
    const chatId = await chatsStore.createGroupChat(groupName.value, selectedIds.value)
    if (chatId) {
      close()
      await router.push({ name: 'chat-by-id', params: { chatId } })
    } else {
      error.value = chatsStore.error || 'Не удалось создать группу'
    }
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <v-dialog :model-value="isOpen" max-width="480" @update:model-value="(v) => !v && close()">
    <v-card rounded="lg" class="group-card">
      <div class="group-header">
        <v-icon size="40" color="white" class="mb-2">mdi-account-group</v-icon>
        <h2 class="group-title">Новая группа</h2>
        <p class="group-subtitle">Минимум 2 участника</p>
      </div>

      <v-card-text class="pa-6">
        <v-text-field
          v-model="groupName"
          label="Название группы"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          class="mb-4"
          theme="dark"
        />

        <v-text-field
          v-model="search"
          placeholder="Поиск участников"
          variant="solo"
          density="compact"
          hide-details
          flat
          prepend-inner-icon="mdi-magnify"
          class="search-input mb-3"
          clearable
        />

        <div class="selected-count">
          Выбрано: {{ selectedIds.length }}
        </div>

        <div class="users-list">
          <div
            v-for="user in availableUsers"
            :key="user.userId"
            class="user-row"
            :class="{ 'user-row--selected': selectedIds.includes(user.userId) }"
            @click="toggleUser(user.userId)"
          >
            <v-avatar size="36" color="blue-grey-lighten-4" class="text-slate-700 mr-3">
              {{ firstLetter(user) }}
            </v-avatar>
            <div class="user-info">
              <div class="user-name">{{ displayName(user) }}</div>
              <div class="user-meta">@{{ user.nickname }}</div>
            </div>
            <v-icon
              v-if="selectedIds.includes(user.userId)"
              color="white"
              size="22"
            >
              mdi-check-circle
            </v-icon>
            <v-icon v-else color="white" size="22" style="opacity: 0.3">
              mdi-circle-outline
            </v-icon>
          </div>

          <div v-if="availableUsers.length === 0" class="empty-state">
            Никого не найдено
          </div>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-3">
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-0">
        <v-btn variant="text" color="white" :disabled="isCreating" @click="close">
          Отмена
        </v-btn>
        <v-spacer />
        <v-btn
          color="white"
          variant="flat"
          class="text-blue-darken-2"
          :loading="isCreating"
          :disabled="!isValid"
          @click="submit"
        >
          Создать группу
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.group-card {
  background: linear-gradient(180deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%) !important;
  color: #ffffff;
}

.group-header {
  padding: 24px 24px 8px;
  text-align: center;
  color: #ffffff;
}

.group-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.group-subtitle {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 2px;
}

.search-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.15) !important;
  border-radius: 10px;
  color: #ffffff;
}

.search-input :deep(.v-field input),
.search-input :deep(.v-field input::placeholder) {
  color: #ffffff !important;
  opacity: 0.9;
}

.search-input :deep(.v-icon) {
  color: #ffffff;
  opacity: 0.85;
}

.selected-count {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  margin-bottom: 8px;
}

.users-list {
  max-height: 280px;
  overflow-y: auto;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.12);
  padding: 6px;
}

.user-row {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  color: #ffffff;
}

.user-row:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-row--selected {
  background: rgba(255, 255, 255, 0.18);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
}

.user-meta {
  font-size: 12px;
  opacity: 0.75;
}

.empty-state {
  text-align: center;
  padding: 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}
</style>

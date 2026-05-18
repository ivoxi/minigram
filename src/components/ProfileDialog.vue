<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { getUserById, updateUser } from '../api/chatApi'
import { useAuthStore } from '../stores/useAuthStore'
import { useChatsStore } from '../stores/useChatsStore'
import { useProfileDialog } from '../composables/useProfileDialog'
import type { GetUserDto } from '../types/chat'

const { profileUserId, close } = useProfileDialog()
const authStore = useAuthStore()
const chatsStore = useChatsStore()
const { userId: currentUserId } = storeToRefs(authStore)
const router = useRouter()

const isStartingChat = ref(false)

const user = ref<GetUserDto | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)
const error = ref<string | null>(null)

const editName = ref('')
const editPhone = ref('')

const isOwnProfile = computed(
  () => !!profileUserId.value && profileUserId.value === currentUserId.value,
)

const displayName = computed(
  () => user.value?.nickname?.trim() || user.value?.name?.trim() || 'Без имени',
)

const firstLetter = computed(() => displayName.value.charAt(0).toUpperCase())

const loadUser = async (id: string): Promise<void> => {
  isLoading.value = true
  error.value = null
  try {
    const fetched = await getUserById(id)
    user.value = fetched
    editName.value = fetched.name ?? ''
    editPhone.value = fetched.phoneNumber ?? ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить профиль'
  } finally {
    isLoading.value = false
  }
}

watch(profileUserId, async (id) => {
  if (id) {
    isEditing.value = false
    await loadUser(id)
  } else {
    user.value = null
    error.value = null
    isEditing.value = false
  }
})

const startEdit = (): void => {
  if (!user.value) return
  editName.value = user.value.name ?? ''
  editPhone.value = user.value.phoneNumber ?? ''
  isEditing.value = true
  error.value = null
}

const cancelEdit = (): void => {
  isEditing.value = false
  error.value = null
}

const startChat = async (): Promise<void> => {
  if (!user.value) return
  isStartingChat.value = true
  try {
    const chatId = await chatsStore.createOrOpenDirectChat(user.value.userId)
    if (chatId) {
      close()
      await router.push({ name: 'chat-by-id', params: { chatId } })
    }
  } finally {
    isStartingChat.value = false
  }
}

const save = async (): Promise<void> => {
  if (!user.value || !editName.value.trim()) return
  isSaving.value = true
  error.value = null
  try {
    const updated = await updateUser(user.value.userId, {
      nickname: user.value.nickname,
      name: editName.value.trim(),
      phoneNumber: editPhone.value.trim() || null,
    })
    user.value = updated
    chatsStore.upsertUser(updated)
    isEditing.value = false
  } catch (e: unknown) {
    const response = (e as { response?: { data?: { error?: string } } }).response
    error.value = response?.data?.error || (e instanceof Error ? e.message : 'Ошибка сохранения')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <v-dialog
    :model-value="!!profileUserId"
    max-width="460"
    @update:model-value="(v) => !v && close()"
  >
    <v-card rounded="lg" class="pa-0 profile-card">
      <div v-if="isLoading" class="d-flex justify-center pa-8">
        <v-progress-circular indeterminate color="blue-darken-2" />
      </div>

      <template v-else-if="user">
        <div class="profile-header">
          <v-avatar size="84" color="blue-darken-2" class="text-white profile-avatar">
            <span class="text-h4 font-weight-bold">{{ firstLetter }}</span>
          </v-avatar>
          <h2 class="profile-name">{{ displayName }}</h2>
          <div class="profile-handle">@{{ user.nickname }}</div>
        </div>

        <v-card-text class="pa-6 pt-2">
          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
            {{ error }}
          </v-alert>

          <template v-if="!isEditing">
            <div class="info-row">
              <v-icon size="20" color="white" class="info-icon" style="opacity: 0.85;">mdi-account</v-icon>
              <div>
                <div class="info-label">Имя</div>
                <div class="info-value">{{ user.name || '—' }}</div>
              </div>
            </div>
            <div class="info-row">
              <v-icon size="20" color="white" class="info-icon" style="opacity: 0.85;">mdi-phone</v-icon>
              <div>
                <div class="info-label">Телефон</div>
                <div class="info-value">{{ user.phoneNumber || '—' }}</div>
              </div>
            </div>
            <div class="info-row">
              <v-icon size="20" color="white" class="info-icon" style="opacity: 0.85;">mdi-at</v-icon>
              <div>
                <div class="info-label">Никнейм</div>
                <div class="info-value">{{ user.nickname || '—' }}</div>
              </div>
            </div>
          </template>

          <template v-else>
            <v-text-field
              v-model="editName"
              label="Имя"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="mb-3"
            />
            <v-text-field
              v-model="editPhone"
              label="Телефон"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="mb-3"
            />
            <v-text-field
              :model-value="user.nickname"
              label="Никнейм (нельзя изменить)"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              readonly
              disabled
              class="mb-3"
            />
          </template>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-0">
          <template v-if="!isEditing">
            <v-btn variant="text" color="white" @click="close">Закрыть</v-btn>
            <v-spacer />
            <v-btn
              v-if="isOwnProfile"
              color="white"
              variant="flat"
              class="text-blue-darken-2"
              prepend-icon="mdi-pencil"
              @click="startEdit"
            >
              Редактировать
            </v-btn>
            <v-btn
              v-else
              color="white"
              variant="flat"
              class="text-blue-darken-2"
              prepend-icon="mdi-message-text"
              :loading="isStartingChat"
              @click="startChat"
            >
              Написать
            </v-btn>
          </template>
          <template v-else>
            <v-btn variant="text" :disabled="isSaving" @click="cancelEdit">Отмена</v-btn>
            <v-spacer />
            <v-btn
              color="blue-darken-2"
              variant="flat"
              :loading="isSaving"
              :disabled="!editName.trim()"
              @click="save"
            >
              Сохранить
            </v-btn>
          </template>
        </v-card-actions>
      </template>

      <div v-else-if="error" class="pa-6">
        <v-alert type="error" variant="tonal">{{ error }}</v-alert>
        <div class="d-flex justify-end mt-4">
          <v-btn variant="text" @click="close">Закрыть</v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.profile-card {
  background: linear-gradient(180deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%) !important;
  color: #ffffff;
}

.profile-card :deep(.v-card-text),
.profile-card :deep(.v-card-actions) {
  color: #ffffff;
}

.profile-header {
  padding: 28px 24px 20px;
  text-align: center;
  color: #ffffff;
}

.profile-avatar {
  border: 4px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 12px;
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}

.profile-handle {
  font-size: 14px;
  opacity: 0.85;
  margin-top: 2px;
  color: #ffffff;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.info-row:last-child {
  border-bottom: none;
}

.info-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.info-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2px;
}

.info-value {
  font-size: 15px;
  color: #ffffff;
  font-weight: 500;
}
</style>

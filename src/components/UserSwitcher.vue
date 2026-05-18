<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/useAuthStore'
import { useChatsStore } from '../stores/useChatsStore'
import { useProfileDialog } from '../composables/useProfileDialog'

const authStore = useAuthStore()
const chatsStore = useChatsStore()
const { nickname, userId } = storeToRefs(authStore)
const profileDialog = useProfileDialog()
const router = useRouter()
const isOpen = ref(false)

const displayName = computed(() => nickname.value?.trim() || 'Пользователь')
const firstLetter = computed(() => displayName.value.charAt(0).toUpperCase())

const openProfile = (): void => {
  isOpen.value = false
  if (userId.value) profileDialog.open(userId.value)
}

const logout = async (): Promise<void> => {
  isOpen.value = false
  chatsStore.reset()
  authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <v-menu v-model="isOpen" :close-on-content-click="false" location="bottom start" offset="4">
    <template #activator="{ props: menuProps }">
      <div
        v-bind="menuProps"
        class="user-switcher px-4 d-flex align-center ga-3 cursor-pointer"
        style="height: var(--chat-item-height, 72px); border-bottom: 1px solid #e2e8f0;"
      >
        <v-avatar color="blue-darken-2" size="36" class="text-white flex-shrink-0">
          {{ firstLetter }}
        </v-avatar>
        <div class="flex-1 min-w-0">
          <div class="text-slate-900 font-semibold text-sm text-truncate">
            {{ displayName }}
          </div>
          <div class="text-slate-400 text-xs">Аккаунт</div>
        </div>
        <v-icon size="16" color="slate-400" :class="isOpen ? 'rotate-180' : ''" style="transition: transform 0.2s">
          mdi-chevron-down
        </v-icon>
      </div>
    </template>

    <v-card min-width="220" elevation="6" class="menu-card">
      <v-list density="compact" class="pa-2 bg-transparent">
        <v-list-item
          rounded="lg"
          class="mb-1 menu-item"
          @click="openProfile"
        >
          <template #prepend>
            <v-icon size="18" class="mr-3" color="white">mdi-account</v-icon>
          </template>
          <v-list-item-title class="text-sm font-weight-medium text-white">
            Профиль
          </v-list-item-title>
        </v-list-item>
        <v-list-item
          rounded="lg"
          class="menu-item menu-item-danger"
          @click="logout"
        >
          <template #prepend>
            <v-icon size="18" class="mr-3" color="white">mdi-logout</v-icon>
          </template>
          <v-list-item-title class="text-sm font-weight-medium text-white">
            Выйти
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<style scoped>
.menu-card {
  background: linear-gradient(135deg, #1e40af, #3b82f6) !important;
}

.menu-item :deep(.v-list-item__overlay) {
  background: rgba(255, 255, 255, 0.12) !important;
}

.menu-item-danger:hover :deep(.v-list-item__overlay) {
  background: rgba(239, 68, 68, 0.35) !important;
  opacity: 1 !important;
}
</style>

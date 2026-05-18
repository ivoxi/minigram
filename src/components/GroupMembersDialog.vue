<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatsStore } from '../stores/useChatsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useProfileDialog } from '../composables/useProfileDialog'
import { useGroupMembersDialog } from '../composables/useGroupMembersDialog'
import type { GetUserDto, Uuid } from '../types/chat'

const chatsStore = useChatsStore()
const authStore = useAuthStore()
const { activeChatMembers, activeChatDisplayName, activeChatMemberCount } = storeToRefs(chatsStore)
const { userId: currentUserId } = storeToRefs(authStore)
const profileDialog = useProfileDialog()
const { isOpen, close } = useGroupMembersDialog()

const displayName = (user: GetUserDto): string =>
  user.nickname?.trim() || user.name?.trim() || 'Без имени'

const firstLetter = (user: GetUserDto): string => displayName(user).charAt(0).toUpperCase()

const sortedMembers = computed<GetUserDto[]>(() => {
  return [...activeChatMembers.value].sort((a, b) => {
    if (a.userId === currentUserId.value) return -1
    if (b.userId === currentUserId.value) return 1
    return displayName(a).localeCompare(displayName(b))
  })
})

const openMemberProfile = (userId: Uuid): void => {
  close()
  profileDialog.open(userId)
}
</script>

<template>
  <v-dialog :model-value="isOpen" max-width="440" @update:model-value="(v) => !v && close()">
    <v-card rounded="lg" class="members-card">
      <div class="members-header">
        <v-icon size="40" color="white" class="mb-2">mdi-account-group</v-icon>
        <h2 class="members-title">{{ activeChatDisplayName }}</h2>
        <p class="members-subtitle">{{ activeChatMemberCount }} участников</p>
      </div>

      <v-card-text class="pa-3">
        <div class="members-list">
          <div
            v-for="user in sortedMembers"
            :key="user.userId"
            class="member-row"
            @click="openMemberProfile(user.userId)"
          >
            <v-avatar size="40" color="blue-grey-lighten-4" class="text-slate-700 mr-3">
              {{ firstLetter(user) }}
            </v-avatar>
            <div class="member-info">
              <div class="member-name">
                {{ displayName(user) }}
                <span v-if="user.userId === currentUserId" class="member-tag">вы</span>
              </div>
              <div class="member-meta">@{{ user.nickname }}</div>
            </div>
            <v-icon size="18" color="white" style="opacity: 0.6">mdi-chevron-right</v-icon>
          </div>

          <div v-if="sortedMembers.length === 0" class="empty-state">
            Список участников пуст
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-4 pb-4 pt-0">
        <v-spacer />
        <v-btn variant="text" color="white" @click="close">Закрыть</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.members-card {
  background: linear-gradient(180deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%) !important;
  color: #ffffff;
}

.members-header {
  padding: 24px 24px 12px;
  text-align: center;
}

.members-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}

.members-subtitle {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 2px;
  color: #ffffff;
}

.members-list {
  max-height: 320px;
  overflow-y: auto;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.12);
  padding: 6px;
}

.member-row {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  color: #ffffff;
}

.member-row:hover {
  background: rgba(255, 255, 255, 0.12);
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.member-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.member-meta {
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

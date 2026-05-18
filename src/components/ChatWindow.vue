<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'
import { useChatsStore } from '../stores/useChatsStore'
import { useProfileDialog } from '../composables/useProfileDialog'
import { useGroupMembersDialog } from '../composables/useGroupMembersDialog'

const chatsStore = useChatsStore()
const {
  activeChatDisplayName,
  activeChatIsTyping,
  activeChatPartnerId,
  activeChatIsGroup,
  activeChatMemberCount,
  activeMessages,
} = storeToRefs(chatsStore)
const profileDialog = useProfileDialog()
const membersDialog = useGroupMembersDialog()

const isTitleClickable = computed(() => activeChatIsGroup.value || !!activeChatPartnerId.value)

const openHeader = (): void => {
  if (activeChatIsGroup.value) {
    membersDialog.open()
  } else if (activeChatPartnerId.value) {
    profileDialog.open(activeChatPartnerId.value)
  }
}
</script>

<template>
  <v-sheet class="d-flex h-100 flex-column" color="white" rounded="0">
    <v-toolbar flat density="comfortable" class="px-2 border-b border-slate-200" :style="{ height: 'var(--chat-item-height, 72px)' }">
      <v-toolbar-title
        :class="isTitleClickable ? 'toolbar-title-clickable' : ''"
        @click="openHeader"
      >
        <v-list-item-title class="font-semibold !text-white d-flex align-center ga-2">
          <span>{{ activeChatDisplayName }}</span>
          <v-icon
            v-if="activeChatIsGroup"
            size="16"
            color="white"
            style="opacity: 0.85"
            title="Групповой чат"
          >
            mdi-account-group
          </v-icon>
        </v-list-item-title>
        <v-list-item-subtitle class="!text-white/60">
          <template v-if="activeChatIsGroup">
            {{ activeChatMemberCount }} участников · нажмите, чтобы посмотреть
          </template>
          <template v-else-if="activeChatIsTyping">
            <span class="typing-indicator">печатает</span>
          </template>
          <template v-else>был в сети 5 минут назад</template>
        </v-list-item-subtitle>
      </v-toolbar-title>
    </v-toolbar>

    <v-sheet class="flex-1 overflow-y-auto px-4 py-4" color="transparent">
      <MessageBubble
        v-for="message in activeMessages"
        :key="message.id"
        :id="message.id"
        :type="message.type"
        :text="message.text"
        :audio-url="message.audioUrl"
        :audio-duration-seconds="message.audioDurationSeconds"
        :time="message.time"
        :is-mine="message.isMine"
        :sender-name="message.senderName"
      />
    </v-sheet>

    <MessageInput />
  </v-sheet>
</template>

<style scoped>
:deep(.v-toolbar__content) {
  height: 100% !important;
  padding-bottom: 0 !important;
}

.toolbar-title-clickable {
  cursor: pointer;
  transition: opacity 0.15s;
}

.toolbar-title-clickable:hover {
  opacity: 0.85;
}

.typing-indicator::after {
  content: '';
  animation: dots 1.2s steps(3, end) infinite;
}

@keyframes dots {
  0%   { content: ''; }
  33%  { content: '.'; }
  66%  { content: '..'; }
  100% { content: '...'; }
}
</style>

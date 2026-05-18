<script setup lang="ts">
import { MessageType } from '../types/chat'
import type { MessageType as MessageTypeValue } from '../types/chat'

type MessageBubbleProps = {
  id: string
  type: MessageTypeValue
  text: string
  audioUrl: string | null
  audioDurationSeconds: number | null
  time: string
  isMine: boolean
  senderName: string | null
}

const props = defineProps<MessageBubbleProps>()

// Stable pseudo-random based on message id (no backend read tracking yet)
const isRead = props.id.charCodeAt(0) % 2 === 0
const isVoice = props.type === MessageType.Voice

// Stable per-user color palette (Telegram-style)
const SENDER_COLORS = [
  '#e11d48', '#db2777', '#9333ea', '#7c3aed',
  '#2563eb', '#0891b2', '#059669', '#65a30d',
  '#d97706', '#ea580c',
]
const hashCode = (str: string): number => {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}
const senderColor = props.senderName
  ? SENDER_COLORS[hashCode(props.senderName) % SENDER_COLORS.length]
  : null
</script>

<template>
  <v-sheet
    color="transparent"
    class="mb-3 d-flex w-100"
    :class="props.isMine ? 'justify-end' : 'justify-start'"
  >
    <v-sheet
      :color="props.isMine ? 'blue-darken-2' : 'grey-lighten-3'"
      class="message-bubble px-4 py-2"
      :class="props.isMine ? 'mine text-white' : 'theirs text-slate-900'"
      rounded="xl"
      elevation="0"
    >
      <div
        v-if="props.senderName && senderColor"
        class="sender-name"
        :style="{ color: senderColor }"
      >
        {{ props.senderName }}
      </div>
      <div class="d-flex flex-wrap align-end" style="column-gap: 8px;">
        <audio
          v-if="isVoice && props.audioUrl"
          :src="props.audioUrl"
          controls
          preload="metadata"
          style="flex: 1; min-width: 220px; height: 36px;"
        />
        <span
          v-else
          class="whitespace-pre-wrap break-words text-body-2"
          style="flex: 1; min-width: 0;"
        >{{ props.text }}</span>
        <div
          class="d-flex align-center gap-1 text-caption flex-shrink-0 ms-auto"
          :class="props.isMine ? 'text-blue-100' : 'text-slate-500'"
          style="line-height: 1; padding-bottom: 1px;"
        >
          {{ props.time }}
          <template v-if="props.isMine">
            <v-icon v-if="isRead" size="14" color="light-blue-lighten-3">mdi-check-all</v-icon>
            <v-icon v-else size="14" color="blue-lighten-4">mdi-check</v-icon>
          </template>
        </div>
      </div>
    </v-sheet>
  </v-sheet>
</template>

<style scoped>
.message-bubble {
  max-width: 75%;
}

.sender-name {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
  line-height: 1.2;
}

.mine {
  border-bottom-right-radius: 6px !important;
}

.theirs {
  border-bottom-left-radius: 6px !important;
}
</style>

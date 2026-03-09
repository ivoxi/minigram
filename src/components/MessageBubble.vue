<script setup lang="ts">
type MessageBubbleProps = {
  id: string
  text: string
  time: string
  isMine: boolean
}

const props = defineProps<MessageBubbleProps>()

// Stable pseudo-random based on message id (no backend read tracking yet)
const isRead = props.id.charCodeAt(0) % 2 === 0
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
      <div class="d-flex flex-wrap align-end" style="column-gap: 8px;">
        <span class="whitespace-pre-wrap break-words text-body-2" style="flex: 1; min-width: 0;">{{ props.text }}</span>
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

.mine {
  border-bottom-right-radius: 6px !important;
}

.theirs {
  border-bottom-left-radius: 6px !important;
}
</style>

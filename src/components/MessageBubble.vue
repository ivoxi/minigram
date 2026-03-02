<script setup lang="ts">
type MessageBubbleProps = {
  text: string
  time: string
  isMine: boolean
}

const props = defineProps<MessageBubbleProps>()
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
      <p class="mb-1 whitespace-pre-wrap break-words text-body-2">
        {{ props.text }}
      </p>
      <div
        class="text-right text-caption"
        :class="props.isMine ? 'text-blue-100' : 'text-slate-500'"
      >
        {{ props.time }}
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

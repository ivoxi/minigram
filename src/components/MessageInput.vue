<script setup lang="ts">
import { ref } from 'vue'
import { useChatsStore } from '../stores/useChatsStore'

const chatsStore = useChatsStore()
const messageText = ref('')

const submitMessage = (): void => {
  const trimmedValue = messageText.value.trim()
  if (!trimmedValue) return

  chatsStore.sendMessage(trimmedValue)
  messageText.value = ''
}
</script>

<template>
  <v-sheet class="border-t border-slate-200 px-4 py-3" color="white">
    <v-form class="d-flex ga-2" @submit.prevent="submitMessage">
      <v-text-field
        v-model="messageText"
        variant="outlined"
        density="comfortable"
        hide-details
        placeholder="Type a message..."
      />
      <v-btn type="submit" color="blue-darken-2" size="large">Send</v-btn>
    </v-form>
  </v-sheet>
</template>

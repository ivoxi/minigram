<script setup lang="ts">
import { computed } from 'vue'

type ChatItemProps = {
  name: string
  lastMessage: string
  time: string
  active?: boolean
}

const props = defineProps<ChatItemProps>()
defineEmits<{
  select: []
}>()

const firstLetter = computed(() => props.name.charAt(0).toUpperCase())
</script>

<template>
  <v-list-item
    class="w-full cursor-pointer border-b border-transparent !px-4 transition-colors"
    :style="{ minHeight: 'var(--chat-item-height, 72px)', height: 'var(--chat-item-height, 72px)' }"
    :class="
      props.active
        ? '!border-blue-200 !bg-blue-100'
        : '!border-slate-200 hover:!bg-slate-50'
    "
    :ripple="false"
    active-color="transparent"
    @click="$emit('select')"
  >
    <template #prepend>
      <v-avatar color="blue-grey-lighten-4" class="mr-3 text-slate-700">
        {{ firstLetter }}
      </v-avatar>
    </template>

    <v-list-item-title class="font-semibold !text-slate-900">
      {{ props.name }}
    </v-list-item-title>
    <v-list-item-subtitle class="!text-slate-600">
      {{ props.lastMessage }}
    </v-list-item-subtitle>

    <template #append>
      <span class="text-xs !text-slate-500">{{ props.time }}</span>
    </template>
  </v-list-item>
</template>

<style scoped>
:deep(.v-list-item__overlay) {
  opacity: 0 !important;
}
</style>

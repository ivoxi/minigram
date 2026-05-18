<script setup lang="ts">
import { computed } from 'vue'

type ChatItemProps = {
  name: string
  lastMessage: string
  time: string
  active?: boolean
  isGroup?: boolean
  memberCount?: number
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
      <v-avatar
        :color="props.isGroup ? 'indigo-lighten-4' : 'blue-grey-lighten-4'"
        class="mr-3 text-slate-700"
      >
        <v-icon v-if="props.isGroup" size="22" color="indigo-darken-2">mdi-account-group</v-icon>
        <template v-else>{{ firstLetter }}</template>
      </v-avatar>
    </template>

    <v-list-item-title class="font-semibold !text-slate-900 d-flex align-center ga-1">
      <span class="text-truncate">{{ props.name }}</span>
      <v-icon
        v-if="props.isGroup"
        size="14"
        color="indigo-darken-2"
        class="flex-shrink-0"
        title="Групповой чат"
      >
        mdi-account-multiple
      </v-icon>
    </v-list-item-title>
    <v-list-item-subtitle class="!text-slate-600">
      <span v-if="props.isGroup" class="group-meta">
        {{ props.memberCount }} уч.
      </span>
      <span v-if="props.isGroup" class="mx-1 !text-slate-400">·</span>
      <span>{{ props.lastMessage }}</span>
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

.group-meta {
  color: #4338ca;
  font-weight: 600;
}
</style>

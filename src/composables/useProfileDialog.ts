import { ref } from 'vue'
import type { Uuid } from '../types/chat'

const profileUserId = ref<Uuid | null>(null)

export const useProfileDialog = () => ({
  profileUserId,
  open: (userId: Uuid) => {
    profileUserId.value = userId
  },
  close: () => {
    profileUserId.value = null
  },
})

import { ref } from 'vue'

const isOpen = ref(false)

export const useCreateGroupDialog = () => ({
  isOpen,
  open: () => {
    isOpen.value = true
  },
  close: () => {
    isOpen.value = false
  },
})

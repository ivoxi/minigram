import { createRouter, createWebHistory } from 'vue-router'
import ChatLayout from '../views/ChatLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/chats',
    },
    {
      path: '/chats',
      name: 'chats',
      component: ChatLayout,
    },
    {
      path: '/chats/:chatId',
      name: 'chat-by-id',
      component: ChatLayout,
    },
  ],
})

export default router

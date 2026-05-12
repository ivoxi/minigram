import { createRouter, createWebHistory } from 'vue-router'
import ChatLayout from '../views/ChatLayout.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import { useAuthStore } from '../stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/chats',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { public: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
      meta: { public: true },
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

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isPublic = to.meta.public === true

  if (!isPublic && !authStore.isAuthenticated) {
    return { name: 'login' }
  }
  if (isPublic && authStore.isAuthenticated) {
    return { name: 'chats' }
  }
  return true
})

export default router

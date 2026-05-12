import { defineStore } from 'pinia'
import { loginUser, registerUser } from '../api/chatApi'
import type { AuthState, LoginUserDto, RegisterUserDto } from '../types/chat'

const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_ID_KEY = 'auth_user_id'
const AUTH_NICKNAME_KEY = 'auth_nickname'

const resolveErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response
    const data = response?.data
    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object') {
      const message = (data as { message?: unknown; title?: unknown }).message
      if (typeof message === 'string' && message.trim()) return message
      const title = (data as { title?: unknown }).title
      if (typeof title === 'string' && title.trim()) return title
    }
  }
  if (error instanceof Error) return error.message
  return 'Request failed'
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    userId: null,
    nickname: null,
    token: null,
    isLoading: false,
    error: null,
  }),
  getters: {
    isAuthenticated(state): boolean {
      return !!state.token && !!state.userId
    },
  },
  actions: {
    hydrate(): void {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      const userId = localStorage.getItem(AUTH_USER_ID_KEY)
      const nickname = localStorage.getItem(AUTH_NICKNAME_KEY)
      if (token && userId) {
        this.token = token
        this.userId = userId
        this.nickname = nickname
      }
    },
    persist(): void {
      if (this.token) localStorage.setItem(AUTH_TOKEN_KEY, this.token)
      if (this.userId) localStorage.setItem(AUTH_USER_ID_KEY, this.userId)
      if (this.nickname) localStorage.setItem(AUTH_NICKNAME_KEY, this.nickname)
    },
    async register(payload: RegisterUserDto): Promise<boolean> {
      this.isLoading = true
      this.error = null
      try {
        const response = await registerUser(payload)
        this.userId = response.userId
        this.nickname = response.nickname
        this.token = response.token
        this.persist()
        return true
      } catch (error: unknown) {
        this.error = resolveErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    async login(payload: LoginUserDto): Promise<boolean> {
      this.isLoading = true
      this.error = null
      try {
        const response = await loginUser(payload)
        this.userId = response.userId
        this.nickname = response.nickname
        this.token = response.token
        this.persist()
        return true
      } catch (error: unknown) {
        this.error = resolveErrorMessage(error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    logout(): void {
      this.userId = null
      this.nickname = null
      this.token = null
      this.error = null
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_ID_KEY)
      localStorage.removeItem(AUTH_NICKNAME_KEY)
    },
  },
})

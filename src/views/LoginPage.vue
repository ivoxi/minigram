<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/useAuthStore'

const authStore = useAuthStore()
const { isLoading, error } = storeToRefs(authStore)
const router = useRouter()

const nickname = ref('')
const password = ref('')

const submit = async (): Promise<void> => {
  if (!nickname.value.trim() || !password.value) return
  const ok = await authStore.login({
    nickname: nickname.value.trim(),
    password: password.value,
  })
  if (ok) {
    await router.push({ name: 'chats' })
  }
}
</script>

<template>
  <v-app>
    <v-main>
      <div class="auth-layout">
        <div class="auth-card">
          <div class="auth-logo">
            <v-icon size="32" color="white">mdi-message-text</v-icon>
          </div>

          <h1 class="auth-title">Вход</h1>
          <p class="auth-subtitle">Войдите в свой аккаунт Minigram</p>

          <form class="auth-form" @submit.prevent="submit">
            <label class="field-label" for="login-nickname">Никнейм</label>
            <input
              id="login-nickname"
              v-model="nickname"
              type="text"
              class="field-input"
              placeholder="username"
              autocomplete="username"
            />

            <label class="field-label" for="login-password">Пароль</label>
            <input
              id="login-password"
              v-model="password"
              type="password"
              class="field-input"
              placeholder="••••••"
              autocomplete="current-password"
            />

            <div v-if="error" class="auth-error">
              {{ error }}
            </div>

            <button
              type="submit"
              class="auth-button"
              :disabled="!nickname.trim() || !password || isLoading"
            >
              <span v-if="!isLoading">Войти</span>
              <span v-else class="auth-button-loader"></span>
            </button>
          </form>

          <div class="auth-footer">
            Нет аккаунта?
            <RouterLink to="/register" class="auth-link">Зарегистрироваться</RouterLink>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
  padding: 16px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 32px 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
}

.auth-logo {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px -5px rgba(30, 64, 175, 0.5);
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 8px 0 4px;
  text-align: center;
}

.auth-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 6px;
  margin-top: 12px;
}

.field-label:first-child {
  margin-top: 0;
}

.field-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 14px;
  color: #0f172a;
  background: #ffffff;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}

.field-input::placeholder {
  color: #94a3b8;
}

.field-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.auth-error {
  margin-top: 16px;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 13px;
}

.auth-button {
  margin-top: 20px;
  height: 46px;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.15s, opacity 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-button:hover:not(:disabled) {
  box-shadow: 0 8px 16px -4px rgba(30, 64, 175, 0.4);
  transform: translateY(-1px);
}

.auth-button:active:not(:disabled) {
  transform: translateY(0);
}

.auth-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-button-loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #64748b;
}

.auth-link {
  color: #1e40af;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>

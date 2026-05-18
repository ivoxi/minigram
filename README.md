# MiniGram

Веб-мессенджер на Vue 3 + TypeScript. Личные и групповые чаты, мгновенная доставка сообщений по SignalR, голосовые/текстовые сообщения, аутентификация по JWT.

## Стек

- **Vue 3** + Composition API (`<script setup>`) + TypeScript
- **Vite** — dev-сервер и сборка
- **Pinia** — глобальное состояние (auth, chats)
- **Vue Router 4** — маршрутизация с guard'ом по аутентификации
- **Vuetify 4** + **MDI Icons** — UI-компоненты
- **Tailwind CSS 4** — утилитарные классы
- **Axios** — HTTP-клиент с JWT-интерсептором
- **@microsoft/signalr** — WebSocket-канал к ASP.NET Core бэкенду

## Возможности

- Регистрация и вход по никнейму + паролю, токен в `localStorage`
- Список чатов с поиском по чатам и по пользователям
- Личные чаты (1-на-1)
- Групповые чаты с маркером в списке (иконка + счётчик участников)
- Просмотр участников группы (клик по шапке чата)
- Профиль пользователя: редактирование своего, просмотр чужого
- Индикатор «печатает», галочки прочтения (визуально), голосовые сообщения с плеером
- Реактивные обновления: новые сообщения и новые чаты приходят через SignalR без перезагрузки

## Требования

- Node.js 20+ (LTS)
- npm 10+
- Запущенный бэкенд (ASP.NET Core), по умолчанию `http://localhost:5017`

## Установка и запуск

```bash
npm install
npm run dev
```

Откройте `http://localhost:5173`.

## Скрипты

| Скрипт          | Описание                                   |
|-----------------|--------------------------------------------|
| `npm run dev`     | Vite dev-сервер с HMR                    |
| `npm run build`   | Проверка типов (`vue-tsc`) и production-сборка |
| `npm run preview` | Локальный предпросмотр собранного бандла |

## Переменные окружения

Создайте `.env` или `.env.local` при необходимости:

| Переменная                | По умолчанию               | Назначение                                         |
|---------------------------|----------------------------|----------------------------------------------------|
| `VITE_API_BASE_URL`       | `/api`                     | Базовый URL для HTTP-запросов (axios).             |
| `VITE_API_PROXY_TARGET`   | `http://localhost:5017`    | Куда Vite-прокси проксирует `/api` и `/hubs` в dev. |

В dev фронт ходит через прокси Vite (`/api` → бэкенд, `/hubs/chat` → SignalR), чтобы обойти CORS. В prod собирается под тот же origin, что и API.

## Структура проекта

```
src/
├─ api/
│  ├─ chatApi.ts          # axios-клиент: чаты, сообщения, пользователи, auth
│  └─ socketService.ts    # SignalR: подписки на MessageReceived, ChatCreated, typing
├─ components/
│  ├─ ChatList.vue        # левая колонка: поиск + список чатов и пользователей
│  ├─ ChatItem.vue        # карточка чата (с group-индикатором)
│  ├─ ChatWindow.vue      # правая колонка: шапка + сообщения + ввод
│  ├─ MessageBubble.vue   # «пузырёк» сообщения (текст/голос)
│  ├─ MessageInput.vue    # поле ввода с уведомлением о typing
│  ├─ ProfileDialog.vue   # просмотр/редактирование профиля
│  ├─ CreateGroupDialog.vue   # модалка создания группового чата
│  ├─ GroupMembersDialog.vue  # модалка со списком участников группы
│  └─ UserSwitcher.vue    # шапка с аккаунтом и выходом
├─ composables/
│  ├─ useProfileDialog.ts
│  ├─ useCreateGroupDialog.ts
│  └─ useGroupMembersDialog.ts
├─ router/
│  └─ index.ts            # маршруты + guard аутентификации
├─ stores/
│  ├─ useAuthStore.ts     # JWT, hydrate из localStorage, login/register/logout
│  └─ useChatsStore.ts    # чаты, сообщения, пользователи, активный чат, typing
├─ types/
│  └─ chat.ts             # DTO и доменные типы
├─ views/
│  ├─ LoginPage.vue
│  ├─ RegisterPage.vue
│  └─ ChatLayout.vue      # двухпанельный layout с диалогами
├─ App.vue
└─ main.ts
```

## API контракт

- `POST /api/users/register` → `{ userId, nickname, token }`
- `POST /api/users/login` → `{ userId, nickname, token }`
- `GET  /api/users`
- `GET  /api/users/:userId`
- `PUT  /api/users/:userId`
- `POST /api/chats` (`isGroup`, `name`, `participantUserIds`)
- `GET  /api/chats/by-user/:userId`
- `GET  /api/chats/:chatId`
- `GET  /api/chats/:chatId/messages`
- `POST /api/chats/:chatId/messages`

SignalR-хаб `/hubs/chat` (методы клиента/сервера):
- `JoinUserChannel(userId)` — подписаться на свои события (например, `ChatCreated`)
- `JoinChat(chatId)` / `LeaveChat(chatId)`
- `StartTyping(chatId, userId)` / `StopTyping(chatId, userId)`
- Серверные события: `MessageReceived`, `ChatCreated`, `UserTyping`, `UserStoppedTyping`

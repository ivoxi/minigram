import { defineStore } from 'pinia'
import {
  getChatsByUser,
  getMessagesByChat,
  getUsers,
  sendMessageToChat,
} from '../api/chatApi'
import type {
  ActiveMessage,
  ChatPreview,
  ChatsState,
  GetChatDto,
  GetMessageDto,
  GetUserDto,
  Uuid,
} from '../types/chat'

const TEMP_CURRENT_USER_ID: Uuid = 'db737de2-4602-41bb-97d7-00e5799e0cf3'

const formatTime = (date: Date): string => {
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}

const getLastMessage = (messages: GetMessageDto[]): GetMessageDto | null => {
  if (messages.length === 0) return null
  return [...messages].sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt))[0] ?? null
}

const normalizeMessages = (messages: GetMessageDto[]): GetMessageDto[] => {
  return messages
    .slice()
    .sort((a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt))
}

const resolveChatName = (chat: GetChatDto, users: GetUserDto[], currentUserId: Uuid | null): string => {
  if (chat.isGroup) return chat.name?.trim() || 'Group'
  const otherId = chat.participantUserIds?.find((id) => id !== currentUserId)
  const other = users.find((u) => u.userId === otherId)
  return other?.nickname?.trim() || other?.name?.trim() || chat.name?.trim() || 'Unknown'
}

const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  return 'Request failed'
}

const pickCurrentUserId = (users: Array<{ userId: Uuid }>): Uuid | null => {
  const envUserId = import.meta.env.VITE_CURRENT_USER_ID as string | undefined

  if (envUserId && users.some((user) => user.userId === envUserId)) {
    return envUserId
  }

  if (users.some((user) => user.userId === TEMP_CURRENT_USER_ID)) {
    return TEMP_CURRENT_USER_ID
  }

  return users[0]?.userId ?? null
}

export const useChatsStore = defineStore('chats', {
  state: (): ChatsState => ({
    chats: [],
    messagesByChat: {},
    users: [],
    currentUserId: null,
    activeChatId: null,
    isLoading: false,
    error: null,
  }),
  getters: {
    activeChat(state): GetChatDto | null {
      return state.chats.find((chat) => chat.chatId === state.activeChatId) ?? null
    },
    chatsWithPreview(state): ChatPreview[] {
      return state.chats
        .map((chat) => {
          const messages = state.messagesByChat[chat.chatId] ?? []
          const lastMessage = getLastMessage(messages)
          return {
            chatId: chat.chatId,
            name: resolveChatName(chat, state.users, state.currentUserId),
            lastMessage: lastMessage?.text ?? 'No messages yet',
            time: lastMessage ? formatTime(new Date(lastMessage.sentAt)) : '',
            lastCreatedAt: lastMessage ? Date.parse(lastMessage.sentAt) : 0,
          }
        })
        .sort((a, b) => b.lastCreatedAt - a.lastCreatedAt)
        .map(({ lastCreatedAt, ...chat }) => chat)
    },
    activeChatDisplayName(): string {
      if (!this.activeChat) return 'Chat'
      return resolveChatName(this.activeChat, this.users, this.currentUserId)
    },
    activeMessages(state): ActiveMessage[] {
      if (state.activeChatId === null) return []
      const messages = state.messagesByChat[state.activeChatId] ?? []
      return normalizeMessages(messages).map((message) => ({
        id: message.messageId,
        text: message.text ?? '',
        isMine: message.senderUserId === state.currentUserId,
        time: formatTime(new Date(message.sentAt)),
      }))
    },
  },
  actions: {
    async initialize(): Promise<void> {
      if (this.isLoading) return
      this.isLoading = true
      this.error = null

      try {
        const users = await getUsers()
        this.users = users

        const currentUserId = pickCurrentUserId(users)
        this.currentUserId = currentUserId

        if (!currentUserId) {
          this.chats = []
          this.messagesByChat = {}
          this.activeChatId = null
          this.error = 'Users not found: cannot resolve current user'
          return
        }

        const chats = await getChatsByUser(currentUserId)
        this.chats = chats
        this.activeChatId = chats[0]?.chatId ?? null

        const messagesByChatEntries = await Promise.all(
          chats.map(async (chat) => {
            const messages = await getMessagesByChat(chat.chatId)
            return [chat.chatId, normalizeMessages(messages)] as const
          }),
        )

        this.messagesByChat = Object.fromEntries(messagesByChatEntries)
      } catch (error: unknown) {
        this.error = resolveErrorMessage(error)
        console.error('Failed to initialize chats store:', error)
      } finally {
        this.isLoading = false
      }
    },
    async selectChat(chatId: Uuid): Promise<void> {
      this.activeChatId = chatId

      if (this.messagesByChat[chatId]) return

      try {
        const messages = await getMessagesByChat(chatId)
        this.messagesByChat[chatId] = normalizeMessages(messages)
      } catch (error: unknown) {
        this.error = resolveErrorMessage(error)
      }
    },
    async sendMessage(text: string): Promise<void> {
      const trimmedText = text.trim()
      if (!trimmedText || this.activeChatId === null || this.currentUserId === null) return

      try {
        const message = await sendMessageToChat(this.activeChatId, {
          senderUserId: this.currentUserId,
          text: trimmedText,
        })

        const nextMessages = this.messagesByChat[this.activeChatId] ?? []
        this.messagesByChat[this.activeChatId] = normalizeMessages([...nextMessages, message])
      } catch (error: unknown) {
        this.error = resolveErrorMessage(error)
      }
    },
  },
})

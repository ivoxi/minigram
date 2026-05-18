import { defineStore } from 'pinia'
import {
  createChat,
  getChatsByUser,
  getMessagesByChat,
  getUsers,
  sendMessageToChat,
} from '../api/chatApi'
import { socketService } from '../api/socketService'
import { useAuthStore } from './useAuthStore'
import {
  MessageType,
  type ActiveMessage,
  type ChatPreview,
  type ChatsState,
  type GetChatDto,
  type GetMessageDto,
  type GetUserDto,
  type Uuid,
} from '../types/chat'

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

export const useChatsStore = defineStore('chats', {
  state: (): ChatsState => ({
    chats: [],
    messagesByChat: {},
    users: [],
    activeChatId: null,
    isLoading: false,
    isConnected: false,
    typingByChatId: {},
    error: null,
  }),
  getters: {
    currentUserId(): Uuid | null {
      return useAuthStore().userId
    },
    activeChat(state): GetChatDto | null {
      return state.chats.find((chat) => chat.chatId === state.activeChatId) ?? null
    },
    chatsWithPreview(state): ChatPreview[] {
      const currentUserId = useAuthStore().userId
      return state.chats
        .map((chat) => {
          const messages = state.messagesByChat[chat.chatId] ?? []
          const lastMessage = getLastMessage(messages)
          const lastMessageText = lastMessage
            ? lastMessage.type === MessageType.Voice
              ? '🎤 Голосовое сообщение'
              : (lastMessage.text ?? '')
            : 'No messages yet'
          return {
            chatId: chat.chatId,
            name: resolveChatName(chat, state.users, currentUserId),
            lastMessage: lastMessageText,
            time: lastMessage ? formatTime(new Date(lastMessage.sentAt)) : '',
            isGroup: !!chat.isGroup,
            memberCount: chat.participantUserIds?.length ?? 0,
            lastCreatedAt: lastMessage ? Date.parse(lastMessage.sentAt) : 0,
          }
        })
        .sort((a, b) => b.lastCreatedAt - a.lastCreatedAt)
        .map(({ lastCreatedAt, ...chat }) => chat)
    },
    activeChatDisplayName(): string {
      if (!this.activeChat) return 'Chat'
      return resolveChatName(this.activeChat, this.users, useAuthStore().userId)
    },
    activeChatPartnerId(): Uuid | null {
      const chat = this.activeChat
      if (!chat || chat.isGroup) return null
      const currentUserId = useAuthStore().userId
      return chat.participantUserIds?.find((id) => id !== currentUserId) ?? null
    },
    activeChatIsGroup(): boolean {
      return !!this.activeChat?.isGroup
    },
    activeChatMembers(state): GetUserDto[] {
      const chat = state.chats.find((c) => c.chatId === state.activeChatId)
      if (!chat?.isGroup) return []
      const ids = chat.participantUserIds ?? []
      return ids
        .map((id) => state.users.find((u) => u.userId === id))
        .filter((u): u is GetUserDto => !!u)
    },
    activeChatMemberCount(): number {
      const chat = this.activeChat
      if (!chat?.isGroup) return 0
      return chat.participantUserIds?.length ?? 0
    },
    activeChatIsTyping(state): boolean {
      if (!state.activeChatId) return false
      const currentUserId = useAuthStore().userId
      const typers = state.typingByChatId[state.activeChatId] ?? []
      return typers.some((id) => id !== currentUserId)
    },
    activeMessages(state): ActiveMessage[] {
      if (state.activeChatId === null) return []
      const currentUserId = useAuthStore().userId
      const chat = state.chats.find((c) => c.chatId === state.activeChatId)
      const isGroup = !!chat?.isGroup
      const messages = state.messagesByChat[state.activeChatId] ?? []
      return normalizeMessages(messages).map((message) => {
        const isMine = message.senderUserId === currentUserId
        let senderName: string | null = null
        if (isGroup && !isMine) {
          const sender = state.users.find((u) => u.userId === message.senderUserId)
          senderName = sender?.nickname?.trim() || sender?.name?.trim() || 'Unknown'
        }
        return {
          id: message.messageId,
          type: message.type,
          text: message.text ?? '',
          audioUrl: message.audioUrl,
          audioDurationSeconds: message.audioDurationSeconds,
          isMine,
          senderName,
          time: formatTime(new Date(message.sentAt)),
        }
      })
    },
  },
  actions: {
    async initialize(): Promise<void> {
      if (this.isLoading) return
      const currentUserId = useAuthStore().userId
      if (!currentUserId) return

      this.isLoading = true
      this.error = null

      try {
        const users = await getUsers()
        this.users = users

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

        await socketService.connect(currentUserId)
        socketService.onNewMessage((msg) => {
          const chatMessages = this.messagesByChat[msg.chatId] ?? []
          if (chatMessages.some((m) => m.messageId === msg.messageId)) return
          this.messagesByChat[msg.chatId] = normalizeMessages([...chatMessages, msg])
        })
        socketService.onTyping(({ userId, chatId }) => {
          const typers = this.typingByChatId[chatId] ?? []
          if (!typers.includes(userId)) {
            this.typingByChatId[chatId] = [...typers, userId]
          }
        })
        socketService.onStopTyping(({ userId, chatId }) => {
          const typers = this.typingByChatId[chatId] ?? []
          this.typingByChatId[chatId] = typers.filter((id) => id !== userId)
        })
        socketService.onChatCreated((chat) => {
          if (this.chats.some((c) => c.chatId === chat.chatId)) return
          this.chats = [...this.chats, chat]
          if (!this.messagesByChat[chat.chatId]) {
            this.messagesByChat = { ...this.messagesByChat, [chat.chatId]: [] }
          }
        })
        this.isConnected = socketService.isConnected
      } catch (error: unknown) {
        this.error = resolveErrorMessage(error)
        console.error('Failed to initialize chats store:', error)
      } finally {
        this.isLoading = false
      }
    },
    async selectChat(chatId: Uuid): Promise<void> {
      if (this.activeChatId) socketService.leaveChat(this.activeChatId)
      this.activeChatId = chatId
      socketService.joinChat(chatId)

      if (this.messagesByChat[chatId]) return

      try {
        const messages = await getMessagesByChat(chatId)
        this.messagesByChat[chatId] = normalizeMessages(messages)
      } catch (error: unknown) {
        this.error = resolveErrorMessage(error)
      }
    },
    notifyTyping(): void {
      if (this.activeChatId) socketService.emitTyping(this.activeChatId)
    },
    notifyStopTyping(): void {
      if (this.activeChatId) socketService.emitStopTyping(this.activeChatId)
    },
    findDirectChatWith(otherUserId: Uuid): GetChatDto | null {
      const currentUserId = useAuthStore().userId
      if (!currentUserId) return null
      return (
        this.chats.find((c) => {
          if (c.isGroup) return false
          const ids = c.participantUserIds ?? []
          return ids.length === 2 && ids.includes(currentUserId) && ids.includes(otherUserId)
        }) ?? null
      )
    },
    async createOrOpenDirectChat(otherUserId: Uuid): Promise<Uuid | null> {
      const currentUserId = useAuthStore().userId
      if (!currentUserId || otherUserId === currentUserId) return null

      const existing = this.findDirectChatWith(otherUserId)
      if (existing) return existing.chatId

      try {
        const chat = await createChat({
          isGroup: false,
          participantUserIds: [currentUserId, otherUserId],
        })
        // SignalR ChatCreated broadcast may arrive before this HTTP response.
        if (!this.chats.some((c) => c.chatId === chat.chatId)) {
          this.chats = [...this.chats, chat]
        }
        if (!this.messagesByChat[chat.chatId]) {
          this.messagesByChat = { ...this.messagesByChat, [chat.chatId]: [] }
        }
        return chat.chatId
      } catch (e: unknown) {
        this.error = resolveErrorMessage(e)
        return null
      }
    },
    async createGroupChat(name: string, participantUserIds: Uuid[]): Promise<Uuid | null> {
      const currentUserId = useAuthStore().userId
      if (!currentUserId) return null

      const allParticipants = Array.from(new Set([currentUserId, ...participantUserIds]))
      try {
        const chat = await createChat({
          isGroup: true,
          name: name.trim() || null,
          participantUserIds: allParticipants,
        })
        if (!this.chats.some((c) => c.chatId === chat.chatId)) {
          this.chats = [...this.chats, chat]
        }
        if (!this.messagesByChat[chat.chatId]) {
          this.messagesByChat = { ...this.messagesByChat, [chat.chatId]: [] }
        }
        return chat.chatId
      } catch (e: unknown) {
        this.error = resolveErrorMessage(e)
        return null
      }
    },
    upsertUser(user: GetUserDto): void {
      const idx = this.users.findIndex((u) => u.userId === user.userId)
      if (idx === -1) {
        this.users = [...this.users, user]
      } else {
        this.users = [
          ...this.users.slice(0, idx),
          user,
          ...this.users.slice(idx + 1),
        ]
      }
    },
    reset(): void {
      socketService.offNewMessage()
      socketService.offTyping()
      socketService.offChatCreated()
      socketService.disconnect()
      this.chats = []
      this.messagesByChat = {}
      this.users = []
      this.activeChatId = null
      this.typingByChatId = {}
      this.isConnected = false
      this.error = null
    },
    destroy(): void {
      socketService.offNewMessage()
      socketService.offTyping()
      socketService.offChatCreated()
      socketService.disconnect()
      this.isConnected = false
    },
    async sendMessage(text: string): Promise<void> {
      const trimmedText = text.trim()
      const currentUserId = useAuthStore().userId
      if (!trimmedText || this.activeChatId === null || currentUserId === null) return

      try {
        const message = await sendMessageToChat(this.activeChatId, {
          senderUserId: currentUserId,
          text: trimmedText,
        })

        const nextMessages = this.messagesByChat[this.activeChatId] ?? []
        // SignalR broadcast may arrive before this HTTP response — check by messageId.
        if (nextMessages.some((m) => m.messageId === message.messageId)) return
        this.messagesByChat[this.activeChatId] = normalizeMessages([...nextMessages, message])
      } catch (error: unknown) {
        this.error = resolveErrorMessage(error)
      }
    },
  },
})

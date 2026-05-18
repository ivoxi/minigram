import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'
import type { GetChatDto, GetMessageDto } from '../types/chat'

// Relative URL — goes through Vite dev proxy (vite.config.ts /hubs) in dev,
// and same-origin in prod. Absolute URL would hit backend CORS, which only
// allows :5066/:5067 origins.
const HUB_PATH = '/hubs/chat'
const AUTH_TOKEN_KEY = 'auth_token'

type MessageHandler = (msg: GetMessageDto) => void
type TypingHandler = (payload: { userId: string; chatId: string }) => void
type ChatCreatedHandler = (chat: GetChatDto) => void

class SocketService {
  private connection: HubConnection | null = null
  private messageHandler: MessageHandler | null = null
  private typingHandler: TypingHandler | null = null
  private stopTypingHandler: TypingHandler | null = null
  private chatCreatedHandler: ChatCreatedHandler | null = null
  private activeChatId: string | null = null
  private userId: string | null = null

  async connect(userId: string): Promise<void> {
    if (this.connection) return
    this.userId = userId

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_PATH, {
        accessTokenFactory: () => localStorage.getItem(AUTH_TOKEN_KEY) ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on('MessageReceived', (msg: GetMessageDto) => {
      this.messageHandler?.(msg)
    })
    connection.on('UserTyping', (userId: string, chatId: string) => {
      this.typingHandler?.({ userId, chatId })
    })
    connection.on('UserStoppedTyping', (userId: string, chatId: string) => {
      this.stopTypingHandler?.({ userId, chatId })
    })
    connection.on('ChatCreated', (chat: GetChatDto) => {
      this.chatCreatedHandler?.(chat)
    })

    const subscribeToOwnChannel = (): void => {
      if (this.userId) void connection.invoke('JoinUserChannel', this.userId)
    }

    connection.onreconnected(() => {
      subscribeToOwnChannel()
      if (this.activeChatId) {
        void connection.invoke('JoinChat', this.activeChatId)
      }
    })

    this.connection = connection
    try {
      await connection.start()
      subscribeToOwnChannel()
      if (this.activeChatId) {
        void connection.invoke('JoinChat', this.activeChatId)
      }
    } catch (error: unknown) {
      console.error('SignalR connection failed:', error)
    }
  }

  disconnect(): void {
    if (!this.connection) return
    void this.connection.stop()
    this.connection = null
    this.activeChatId = null
    this.userId = null
  }

  joinChat(chatId: string): void {
    this.activeChatId = chatId
    if (this.connection?.state === HubConnectionState.Connected) {
      void this.connection.invoke('JoinChat', chatId)
    }
  }

  leaveChat(chatId: string): void {
    if (this.activeChatId === chatId) this.activeChatId = null
    if (this.connection?.state === HubConnectionState.Connected) {
      void this.connection.invoke('LeaveChat', chatId)
    }
  }

  onNewMessage(handler: MessageHandler): void {
    this.messageHandler = handler
  }

  offNewMessage(): void {
    this.messageHandler = null
  }

  onChatCreated(handler: ChatCreatedHandler): void {
    this.chatCreatedHandler = handler
  }

  offChatCreated(): void {
    this.chatCreatedHandler = null
  }

  emitTyping(chatId: string): void {
    const userId = localStorage.getItem('auth_user_id')
    if (this.connection?.state === HubConnectionState.Connected && userId) {
      void this.connection.invoke('StartTyping', chatId, userId)
    }
  }

  emitStopTyping(chatId: string): void {
    const userId = localStorage.getItem('auth_user_id')
    if (this.connection?.state === HubConnectionState.Connected && userId) {
      void this.connection.invoke('StopTyping', chatId, userId)
    }
  }

  onTyping(handler: TypingHandler): void {
    this.typingHandler = handler
  }

  onStopTyping(handler: TypingHandler): void {
    this.stopTypingHandler = handler
  }

  offTyping(): void {
    this.typingHandler = null
    this.stopTypingHandler = null
  }

  get isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected
  }
}

export const socketService = new SocketService()

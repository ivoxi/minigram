import { defineStore } from 'pinia'

export type ChatMessage = {
  id: number
  text: string
  isMine: boolean
  createdAt: number
}

export type Chat = {
  id: number
  name: string
}

export type ChatPreview = Chat & {
  lastMessage: string
  time: string
}

type ChatsState = {
  chats: Chat[]
  messagesByChat: Record<number, ChatMessage[]>
  activeChatId: number | null
}

const initialChats: Chat[] = [
  { id: 1, name: 'Alex' },
  { id: 2, name: 'Mia' },
  { id: 3, name: 'Daniel' },
  { id: 4, name: 'Emma' },
  { id: 5, name: 'Noah' },
  { id: 6, name: 'Sophie' },
]

const formatTime = (date: Date): string => {
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}

const createTimestamp = (hours: number, minutes: number): number => {
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.getTime()
}

const seedMessagesByChat = (): Record<number, ChatMessage[]> => ({
  1: [
    { id: 101, text: 'Hey! Are you free this evening?', isMine: false, createdAt: createTimestamp(18, 2) },
    { id: 102, text: 'Yes, after 7 PM.', isMine: true, createdAt: createTimestamp(18, 4) },
    { id: 103, text: 'Great, lets do a quick call.', isMine: false, createdAt: createTimestamp(18, 5) },
  ],
  2: [
    { id: 201, text: 'See you in 10 minutes', isMine: false, createdAt: createTimestamp(10, 2) },
    { id: 202, text: 'On my way.', isMine: true, createdAt: createTimestamp(10, 4) },
  ],
  3: [
    { id: 301, text: 'I pushed the fix to main', isMine: false, createdAt: createTimestamp(11, 47) },
  ],
  4: [
    { id: 401, text: 'Lets sync after lunch', isMine: false, createdAt: createTimestamp(13, 20) },
    { id: 402, text: 'Works for me.', isMine: true, createdAt: createTimestamp(13, 22) },
  ],
  5: [
    { id: 501, text: 'Voice call tonight?', isMine: false, createdAt: createTimestamp(15, 3) },
  ],
  6: [
    { id: 601, text: 'Thanks, got it', isMine: false, createdAt: createTimestamp(16, 41) },
  ],
})

const normalizeMessageMap = (): Record<number, ChatMessage[]> => {
  const seededMap = seedMessagesByChat()
  return initialChats.reduce<Record<number, ChatMessage[]>>((acc, chat) => {
    acc[chat.id] = seededMap[chat.id] ?? []
    return acc
  }, {})
}

const getLastMessage = (messages: ChatMessage[]): ChatMessage | null => {
  if (messages.length === 0) return null
  return [...messages].sort((a, b) => b.createdAt - a.createdAt)[0] ?? null
}

export const useChatsStore = defineStore('chats', {
  state: (): ChatsState => ({
    chats: [...initialChats],
    messagesByChat: normalizeMessageMap(),
    activeChatId: initialChats[0]?.id ?? null,
  }),
  getters: {
    activeChat(state): Chat | null {
      return state.chats.find((chat) => chat.id === state.activeChatId) ?? null
    },
    chatsWithPreview(state): ChatPreview[] {
      return state.chats
        .map((chat) => {
          const messages = state.messagesByChat[chat.id] ?? []
          const lastMessage = getLastMessage(messages)
          return {
            id: chat.id,
            name: chat.name,
            lastMessage: lastMessage?.text ?? 'No messages yet',
            time: lastMessage ? formatTime(new Date(lastMessage.createdAt)) : '',
            lastCreatedAt: lastMessage?.createdAt ?? 0,
          }
        })
        .sort((a, b) => b.lastCreatedAt - a.lastCreatedAt)
        .map(({ lastCreatedAt, ...chat }) => chat)
    },
    activeMessages(state): Array<Omit<ChatMessage, 'createdAt'> & { time: string }> {
      if (state.activeChatId === null) return []
      const messages = state.messagesByChat[state.activeChatId] ?? []
      return messages
        .slice()
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((message) => ({
          id: message.id,
          text: message.text,
          isMine: message.isMine,
          time: formatTime(new Date(message.createdAt)),
        }))
    },
  },
  actions: {
    selectChat(chatId: number): void {
      this.activeChatId = chatId
    },
    sendMessage(text: string): void {
      const trimmedText = text.trim()
      if (!trimmedText || this.activeChatId === null) return

      const chatId = this.activeChatId
      const message: ChatMessage = {
        id: Date.now(),
        text: trimmedText,
        isMine: true,
        createdAt: Date.now(),
      }

      const nextMessages = this.messagesByChat[chatId] ?? []
      this.messagesByChat[chatId] = [...nextMessages, message]
    },
  },
})

export type Uuid = string
export type IsoDateTime = string

export const MessageType = {
  Text: 0,
  Voice: 1,
} as const

export type MessageType = (typeof MessageType)[keyof typeof MessageType]

export type CreateChatDto = {
  isGroup?: boolean
  name?: string | null
  participantUserIds?: Uuid[] | null
}

export type GetChatDto = {
  chatId: Uuid
  createdAt: IsoDateTime
  isGroup: boolean
  name: string | null
  participantUserIds: Uuid[] | null
}

export type SendMessageDto = {
  senderUserId?: Uuid
  text?: string | null
}

export type GetMessageDto = {
  messageId: Uuid
  chatId: Uuid
  senderUserId: Uuid
  type: MessageType
  text: string | null
  audioUrl: string | null
  audioContentType: string | null
  audioDurationSeconds: number | null
  audioSizeBytes: number | null
  sentAt: IsoDateTime
}

export type CreateUserDto = {
  nickname?: string | null
  name?: string | null
  phoneNumber?: string | null
}

export type UpdateUserDto = CreateUserDto

export type GetUserDto = {
  userId: Uuid
  nickname: string | null
  name: string | null
  phoneNumber: string | null
}

export type ChatPreview = {
  chatId: Uuid
  name: string
  lastMessage: string
  time: string
  isGroup: boolean
  memberCount: number
}

export type ActiveMessage = {
  id: Uuid
  type: MessageType
  text: string
  audioUrl: string | null
  audioDurationSeconds: number | null
  isMine: boolean
  senderName: string | null
  time: string
}

export type ChatsState = {
  chats: GetChatDto[]
  messagesByChat: Record<Uuid, GetMessageDto[]>
  users: GetUserDto[]
  activeChatId: Uuid | null
  isLoading: boolean
  isConnected: boolean
  typingByChatId: Record<Uuid, Uuid[]>
  error: string | null
}

export type RegisterUserDto = {
  nickname?: string | null
  name?: string | null
  phoneNumber?: string | null
  password?: string | null
}

export type LoginUserDto = {
  nickname?: string | null
  password?: string | null
}

export type AuthResponseDto = {
  userId: Uuid
  nickname: string | null
  token: string | null
}

export type AuthState = {
  userId: Uuid | null
  nickname: string | null
  token: string | null
  isLoading: boolean
  error: string | null
}

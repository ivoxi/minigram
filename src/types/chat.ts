export type Uuid = string
export type IsoDateTime = string

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
  text: string | null
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
}

export type ActiveMessage = {
  id: Uuid
  text: string
  isMine: boolean
  time: string
}

export type ChatsState = {
  chats: GetChatDto[]
  messagesByChat: Record<Uuid, GetMessageDto[]>
  users: GetUserDto[]
  currentUserId: Uuid | null
  activeChatId: Uuid | null
  isLoading: boolean
  error: string | null
}

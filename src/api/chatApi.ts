import axios from 'axios'
import type {
  CreateChatDto,
  CreateUserDto,
  GetChatDto,
  GetMessageDto,
  GetUserDto,
  SendMessageDto,
  UpdateUserDto,
  Uuid,
} from '../types/chat'

const apiClient = axios.create({
  // In dev we use Vite proxy (/api -> backend) to avoid browser CORS blocking.
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
})

export const createChat = async (payload: CreateChatDto): Promise<GetChatDto> => {
  const { data } = await apiClient.post<GetChatDto>('/chats', payload)
  return data
}

export const getChatById = async (chatId: Uuid): Promise<GetChatDto> => {
  const { data } = await apiClient.get<GetChatDto>(`/chats/${chatId}`)
  return data
}

export const getChatsByUser = async (userId: Uuid): Promise<GetChatDto[]> => {
  const { data } = await apiClient.get<GetChatDto[]>(`/chats/by-user/${userId}`)
  return data
}

export const getMessagesByChat = async (chatId: Uuid): Promise<GetMessageDto[]> => {
  const { data } = await apiClient.get<GetMessageDto[]>(`/chats/${chatId}/messages`)
  return data
}

export const sendMessageToChat = async (chatId: Uuid, payload: SendMessageDto): Promise<GetMessageDto> => {
  const { data } = await apiClient.post<GetMessageDto>(`/chats/${chatId}/messages`, payload)
  return data
}

export const getUsers = async (): Promise<GetUserDto[]> => {
  const { data } = await apiClient.get<GetUserDto[]>('/users')
  return data
}

export const createUser = async (payload: CreateUserDto): Promise<GetUserDto> => {
  const { data } = await apiClient.post<GetUserDto>('/users', payload)
  return data
}

export const getUserById = async (userId: Uuid): Promise<GetUserDto> => {
  const { data } = await apiClient.get<GetUserDto>(`/users/${userId}`)
  return data
}

export const updateUser = async (userId: Uuid, payload: UpdateUserDto): Promise<GetUserDto> => {
  const { data } = await apiClient.put<GetUserDto>(`/users/${userId}`, payload)
  return data
}

import axios from 'axios'
import type {
  AuthResponseDto,
  CreateChatDto,
  CreateUserDto,
  GetChatDto,
  GetMessageDto,
  GetUserDto,
  LoginUserDto,
  RegisterUserDto,
  SendMessageDto,
  UpdateUserDto,
  Uuid,
} from '../types/chat'

const AUTH_TOKEN_KEY = 'auth_token'

const apiClient = axios.create({
  // In dev we use Vite proxy (/api -> backend) to avoid browser CORS blocking.
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let onUnauthorized: (() => void) | null = null

export const setUnauthorizedHandler = (handler: () => void): void => {
  onUnauthorized = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && onUnauthorized) {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

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

export const registerUser = async (payload: RegisterUserDto): Promise<AuthResponseDto> => {
  const { data } = await apiClient.post<AuthResponseDto>('/users/register', payload)
  return data
}

export const loginUser = async (payload: LoginUserDto): Promise<AuthResponseDto> => {
  const { data } = await apiClient.post<AuthResponseDto>('/users/login', payload)
  return data
}

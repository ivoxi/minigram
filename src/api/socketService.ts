import { io, Socket } from 'socket.io-client'
import type { GetMessageDto } from '../types/chat'

const BASE_URL = import.meta.env.VITE_API_PROXY_TARGET ?? ''

class SocketService {
  private socket: Socket | null = null

  connect(userId: string): void {
    this.socket = io(BASE_URL, { query: { userId } })
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }

  joinChat(chatId: string): void {
    this.socket?.emit('join-chat', chatId)
  }

  leaveChat(chatId: string): void {
    this.socket?.emit('leave-chat', chatId)
  }

  onNewMessage(handler: (msg: GetMessageDto) => void): void {
    this.socket?.on('message:new', handler)
  }

  offNewMessage(): void {
    this.socket?.off('message:new')
  }

  emitTyping(chatId: string): void {
    this.socket?.emit('typing', chatId)
  }

  emitStopTyping(chatId: string): void {
    this.socket?.emit('stop-typing', chatId)
  }

  onTyping(handler: (payload: { userId: string; chatId: string }) => void): void {
    this.socket?.on('user:typing', handler)
  }

  onStopTyping(handler: (payload: { userId: string; chatId: string }) => void): void {
    this.socket?.on('user:stop-typing', handler)
  }

  offTyping(): void {
    this.socket?.off('user:typing')
    this.socket?.off('user:stop-typing')
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}

export const socketService = new SocketService()

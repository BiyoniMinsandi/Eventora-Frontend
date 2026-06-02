import * as signalR from '@microsoft/signalr'
import { getStoredToken } from '@/lib/jwt'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5125'

let connection: signalR.HubConnection | null = null

export function getChatConnection(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/chat`, {
        accessTokenFactory: () => getStoredToken() ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()
  }
  return connection
}

export async function startChatConnection(): Promise<void> {
  const conn = getChatConnection()
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start()
  }
}

export async function stopChatConnection(): Promise<void> {
  if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
    await connection.stop()
  }
}

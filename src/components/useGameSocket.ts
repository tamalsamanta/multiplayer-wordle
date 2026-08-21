'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  ClientMessage,
  Mode,
  Room,
  SelfInfo,
  ServerMessage,
  Toast,
} from '@/lib/types'

export function useGameSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nameRef = useRef<string | null>(null)
  const joinCodeRef = useRef<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [joinCode, setJoinCode] = useState<string | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [self, setSelf] = useState<SelfInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    const code =
      new URLSearchParams(window.location.search).get('join')?.trim().toUpperCase() ??
      null
    if (code) {
      joinCodeRef.current = code
      setJoinCode(code)
    }
  }, [])

  useEffect(() => {
    let closed = false
    let retry: ReturnType<typeof setTimeout> | null = null

    const connect = () => {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${proto}//${window.location.host}/ws`)
      wsRef.current = ws

      ws.onopen = () => {
        if (wsRef.current === ws) {
          setConnected(true)
          const code = joinCodeRef.current
          if (code && nameRef.current) {
            ws.send(
              JSON.stringify({ type: 'join-room', code, name: nameRef.current })
            )
          }
        }
      }

      ws.onmessage = (event) => {
        if (wsRef.current !== ws) return
        const msg = JSON.parse(event.data) as ServerMessage
        if (msg.type === 'room') {
          setRoom(msg.room)
          setSelf(msg.self)
          if (msg.toast) {
            setToast(msg.toast)
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
            toastTimerRef.current = setTimeout(() => setToast(null), 4500)
          }
        } else if (msg.type === 'error') {
          setError(msg.message)
          if (timerRef.current) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => setError(null), 3500)
        }
      }

      ws.onclose = () => {
        if (wsRef.current !== ws) return
        setConnected(false)
        if (!closed) retry = setTimeout(connect, 1000)
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      closed = true
      if (retry) clearTimeout(retry)
      if (timerRef.current) clearTimeout(timerRef.current)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      wsRef.current?.close()
    }
  }, [])

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
    }
  }, [])

  return {
    connected,
    joinCode,
    room,
    self,
    error,
    toast,
    createRoom: useCallback(
      (mode: Mode, name: string) => send({ type: 'create-room', name, mode }),
      [send]
    ),
    joinRoom: useCallback(
      (name: string) => {
        const code = joinCodeRef.current
        if (!code) return
        nameRef.current = name
        send({ type: 'join-room', code, name })
      },
      [send]
    ),
    makeGuess: useCallback(
      (guess: string) => send({ type: 'make-guess', guess }),
      [send]
    ),
    pickWord: useCallback(
      (word: string) => send({ type: 'pick-word', word }),
      [send]
    ),
    nextRound: useCallback(() => send({ type: 'next-round' }), [send]),
  }
}

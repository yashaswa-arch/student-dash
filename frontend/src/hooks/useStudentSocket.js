import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for managing WebSocket connection to student dashboard
 * @returns {Object} { events, sendEvent, connected }
 */
export function useStudentSocket() {
  const [events, setEvents] = useState([])
  const [connected, setConnected] = useState(false)
  
  const wsRef = useRef(null)
  const retryTimeoutRef = useRef(null)
  const reconnectAttemptRef = useRef(false)
  const maxEventsLength = 200

  /**
   * Build WebSocket URL from backend server
   */
  const getWebSocketUrl = useCallback(() => {
    // Get backend URL from environment or use current host
    const backend = import.meta.env.VITE_BACKEND || `http://${window.location.hostname}:5000`
    const backendUrl = new URL(backend)
    const protocol = backendUrl.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = backendUrl.host
    return `${protocol}//${host}/dashboard-student`
  }, [])

  /**
   * Add event to events array (newest first)
   * Limits array to maxEventsLength
   */
  const addEvent = useCallback((event) => {
    setEvents(prev => {
      const newEvents = [event, ...prev]
      // Keep only the most recent maxEventsLength events
      return newEvents.slice(0, maxEventsLength)
    })
  }, [])

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    // Don't connect if already connected or attempting to reconnect
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    // Clean up existing connection if any
    if (wsRef.current) {
      try {
        wsRef.current.close()
      } catch (e) {
        // Ignore errors when closing
      }
    }

    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    try {
      const url = getWebSocketUrl()
      const ws = new WebSocket(url)

      ws.onopen = () => {
        console.log('WebSocket connected to', url)
        setConnected(true)
        reconnectAttemptRef.current = false
        
        // Clear any pending retry
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
          retryTimeoutRef.current = null
        }

        // Add connection event
        addEvent({
          type: 'connection',
          message: 'Connected to dashboard',
          timestamp: new Date().toISOString()
        })
      }

      ws.onmessage = (messageEvent) => {
        try {
          // Try to parse as JSON, fallback to plain text
          let data
          try {
            data = JSON.parse(messageEvent.data)
          } catch (e) {
            data = {
              type: 'message',
              data: messageEvent.data
            }
          }

          addEvent({
            ...data,
            timestamp: data.timestamp || new Date().toISOString()
          })
        } catch (error) {
          console.error('Error processing WebSocket message:', error)
          addEvent({
            type: 'error',
            message: 'Failed to process message',
            error: error.message,
            timestamp: new Date().toISOString()
          })
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnected(false)
        
        addEvent({
          type: 'error',
          message: 'WebSocket connection error',
          timestamp: new Date().toISOString()
        })
      }

      ws.onclose = (closeEvent) => {
        console.log('WebSocket closed:', closeEvent.code, closeEvent.reason)
        setConnected(false)

        addEvent({
          type: 'disconnection',
          message: 'Disconnected from dashboard',
          code: closeEvent.code,
          reason: closeEvent.reason || 'Connection closed',
          timestamp: new Date().toISOString()
        })

        // Attempt to reconnect after 5 seconds if not a normal closure
        // Don't reconnect if component is unmounting or if we're already attempting
        if (closeEvent.code !== 1000 && !reconnectAttemptRef.current) {
          reconnectAttemptRef.current = true
          
          retryTimeoutRef.current = setTimeout(() => {
            reconnectAttemptRef.current = false
            console.log('Attempting to reconnect WebSocket...')
            connect()
          }, 5000)
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnected(false)
      
      addEvent({
        type: 'error',
        message: 'Failed to establish WebSocket connection',
        error: error.message,
        timestamp: new Date().toISOString()
      })

      // Retry after 5 seconds
      if (!reconnectAttemptRef.current) {
        reconnectAttemptRef.current = true
        retryTimeoutRef.current = setTimeout(() => {
          reconnectAttemptRef.current = false
          connect()
        }, 5000)
      }
    }
  }, [getWebSocketUrl, addEvent])

  /**
   * Send event through WebSocket
   * @param {Object|string} event - Event data to send
   */
  const sendEvent = useCallback((event) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected. Cannot send event.')
      addEvent({
        type: 'error',
        message: 'Cannot send event: WebSocket not connected',
        timestamp: new Date().toISOString()
      })
      return false
    }

    try {
      const data = typeof event === 'string' ? event : JSON.stringify(event)
      wsRef.current.send(data)
      return true
    } catch (error) {
      console.error('Error sending WebSocket message:', error)
      addEvent({
        type: 'error',
        message: 'Failed to send event',
        error: error.message,
        timestamp: new Date().toISOString()
      })
      return false
    }
  }, [addEvent])

  // Initialize connection on mount
  useEffect(() => {
    connect()

    // Cleanup on unmount
    return () => {
      // Clear retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }

      // Close WebSocket connection
      if (wsRef.current) {
        try {
          // Prevent reconnection attempts
          reconnectAttemptRef.current = true
          wsRef.current.close(1000, 'Component unmounting')
        } catch (e) {
          // Ignore errors
        }
        wsRef.current = null
      }
    }
  }, [connect])

  return {
    events,
    sendEvent,
    connected
  }
}


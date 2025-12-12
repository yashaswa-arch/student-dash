const WebSocket = require('ws');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> Set of WebSocket connections
  }

  initialize(server) {
    // Create WebSocket server on /dashboard-student path
    this.wss = new WebSocket.Server({ 
      server,
      path: '/dashboard-student',
      verifyClient: (info) => {
        // Allow all connections for now (can add auth later)
        return true;
      }
    });

    this.wss.on('connection', (ws, req) => {
      console.log('📡 WebSocket client connected to /dashboard-student');
      
      // Extract userId from query params or headers if available
      const url = new URL(req.url, `http://${req.headers.host}`);
      const userId = url.searchParams.get('userId') || null;
      
      if (userId) {
        if (!this.clients.has(userId)) {
          this.clients.set(userId, new Set());
        }
        this.clients.get(userId).add(ws);
        console.log(`📡 User ${userId} connected to dashboard WebSocket`);
      }

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to dashboard updates',
        timestamp: new Date().toISOString()
      }));

      ws.on('close', () => {
        console.log('📡 WebSocket client disconnected');
        if (userId && this.clients.has(userId)) {
          this.clients.get(userId).delete(ws);
          if (this.clients.get(userId).size === 0) {
            this.clients.delete(userId);
          }
        }
      });

      ws.on('error', (error) => {
        console.error('📡 WebSocket error:', error);
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          console.log('📡 Received WebSocket message:', data);
        } catch (e) {
          console.error('📡 Error parsing WebSocket message:', e);
        }
      });
    });

    console.log('✅ WebSocket server initialized on /dashboard-student');
  }

  // Emit event to a specific user
  emitToUser(userId, event) {
    if (!this.wss) {
      console.warn('⚠️ WebSocket server not initialized');
      return;
    }

    const userClients = this.clients.get(userId);
    if (userClients && userClients.size > 0) {
      const message = JSON.stringify({
        ...event,
        timestamp: new Date().toISOString()
      });
      
      userClients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
      console.log(`📡 Emitted ${event.type} event to user ${userId}`);
    } else {
      // If no specific user connection, broadcast to all (for development)
      this.broadcast(event);
    }
  }

  // Broadcast event to all connected clients
  broadcast(event) {
    if (!this.wss) {
      console.warn('⚠️ WebSocket server not initialized');
      return;
    }

    const message = JSON.stringify({
      ...event,
      timestamp: new Date().toISOString()
    });

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
    
    console.log(`📡 Broadcasted ${event.type} event to all clients`);
  }

  // Emit submission event
  emitSubmission(userId, submission) {
    this.emitToUser(userId, {
      type: 'submission',
      status: submission.verdict === 'PASSED' ? 'AC' : submission.verdict,
      payload: {
        _id: submission._id,
        problemTitle: submission.questionTitle,
        platform: submission.source || 'quick-practice',
        status: submission.verdict === 'PASSED' ? 'AC' : submission.verdict,
        timestamp: submission.createdAt || new Date(),
        timeTakenInMinutes: submission.timeTakenInMinutes
      }
    });
  }

  // Emit practice event
  emitPractice(userId, practiceData) {
    this.emitToUser(userId, {
      type: 'practice',
      payload: {
        totalToday: practiceData.totalMinutes || practiceData.totalToday || 0
      }
    });
  }

  // Emit interview event
  emitInterview(userId, interviewData) {
    this.emitToUser(userId, {
      type: 'interview',
      payload: interviewData
    });
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
module.exports = websocketService;


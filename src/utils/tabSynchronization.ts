// Utility for synchronizing timer state across browser tabs
// Uses localStorage and BroadcastChannel API for real-time sync

// Define the types of messages that can be sent between tabs
export type SyncMessageType = 
  | 'TIMER_START' 
  | 'TIMER_PAUSE' 
  | 'TIMER_RESET'
  | 'TIMER_SKIP'
  | 'TIMER_COMPLETE'
  | 'TIMER_UPDATE'
  | 'TIMER_CHANGE'
  | 'TASK_SELECT'
  | 'PING'
  | 'PONG';

export type SyncMessage = {
  type: SyncMessageType;
  data?: any;
  timestamp: number;
  tabId: string;
};

export class TabSynchronization {
  private channel: BroadcastChannel | null = null;
  private tabId: string;
  private handlers: Map<SyncMessageType, ((message: SyncMessage) => void)[]> = new Map();
  private lastPingTime: number = 0;
  private activeTabs: Set<string> = new Set();
  private isLeader: boolean = false;
  private leaderCheckInterval: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Generate a unique ID for this tab
    this.tabId = Math.random().toString(36).substring(2, 15);
    
    // Try to initialize the BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('pomodoro_sync');
        this.setupListeners();
        this.startLeaderElection();
        this.startPingInterval();
      } catch (error) {
        console.error('Failed to initialize BroadcastChannel:', error);
        this.fallbackToLocalStorage();
      }
    } else {
      this.fallbackToLocalStorage();
    }
  }

  private setupListeners() {
    if (!this.channel) return;

    this.channel.onmessage = (event) => {
      const message = event.data as SyncMessage;
      
      // Don't process our own messages
      if (message.tabId === this.tabId) return;
      
      // Update active tabs list
      if (message.type === 'PING' || message.type === 'PONG') {
        this.activeTabs.add(message.tabId);
        
        // Respond to pings with a pong
        if (message.type === 'PING') {
          this.sendMessage('PONG');
        }
      }
      
      // Process message handlers
      const handlers = this.handlers.get(message.type) || [];
      handlers.forEach(handler => handler(message));
    };

    // Handle tab closing
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        // If this is the leader tab, store that information
        if (this.isLeader) {
          localStorage.setItem('pomodoroLeaderTabClosed', Date.now().toString());
        }
        
        // Close the channel
        if (this.channel) {
          this.channel.close();
        }
        
        // Clear intervals
        if (this.leaderCheckInterval) {
          clearInterval(this.leaderCheckInterval);
        }
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
        }
      });
    }
  }

  private fallbackToLocalStorage() {
    console.log('Using localStorage fallback for tab synchronization');
    
    // Set up storage event listener for cross-tab communication
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'pomodoroSyncMessage') {
          try {
            const message = JSON.parse(e.newValue || '{}') as SyncMessage;
            
            // Don't process our own messages
            if (message.tabId === this.tabId) return;
            
            // Process message handlers
            const handlers = this.handlers.get(message.type) || [];
            handlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Failed to parse sync message:', error);
          }
        }
      });
    }
  }

  private startLeaderElection() {
    // Check if we should become the leader
    this.checkLeadership();
    
    // Set up periodic leadership check
    this.leaderCheckInterval = setInterval(() => {
      this.checkLeadership();
    }, 5000);
  }

  private checkLeadership() {
    const lastLeaderClosed = localStorage.getItem('pomodoroLeaderTabClosed');
    const leaderTabId = localStorage.getItem('pomodoroLeaderTabId');
    
    // If there's no leader, or the leader tab was closed recently, elect a new one
    if (!leaderTabId || 
        (lastLeaderClosed && Date.now() - parseInt(lastLeaderClosed) < 10000)) {
      // Become the leader
      this.isLeader = true;
      localStorage.setItem('pomodoroLeaderTabId', this.tabId);
      localStorage.removeItem('pomodoroLeaderTabClosed');
      console.log('This tab is now the leader:', this.tabId);
    } else if (leaderTabId === this.tabId) {
      this.isLeader = true;
    } else {
      this.isLeader = false;
    }
  }

  private startPingInterval() {
    // Send a ping every 3 seconds to let other tabs know we're active
    this.pingInterval = setInterval(() => {
      this.sendMessage('PING');
      
      // Clean up tabs that haven't responded in a while
      const now = Date.now();
      if (now - this.lastPingTime > 10000) {
        this.activeTabs.clear();
        this.lastPingTime = now;
      }
    }, 3000);
  }

  public sendMessage(type: SyncMessageType, data?: any) {
    const message: SyncMessage = {
      type,
      data,
      timestamp: Date.now(),
      tabId: this.tabId
    };
    
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (error) {
        console.error('Failed to send message via BroadcastChannel:', error);
        this.sendViaLocalStorage(message);
      }
    } else {
      this.sendViaLocalStorage(message);
    }
  }

  private sendViaLocalStorage(message: SyncMessage) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroSyncMessage', JSON.stringify(message));
      // Immediately remove it to trigger another event for the next message
      setTimeout(() => {
        localStorage.removeItem('pomodoroSyncMessage');
      }, 10);
    }
  }

  public onMessage(type: SyncMessageType, handler: (message: SyncMessage) => void) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)?.push(handler);
  }

  public offMessage(type: SyncMessageType, handler: (message: SyncMessage) => void) {
    if (!this.handlers.has(type)) return;
    
    const handlers = this.handlers.get(type) || [];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  public isLeaderTab() {
    return this.isLeader;
  }

  public getActiveTabsCount() {
    return this.activeTabs.size + 1; // +1 for this tab
  }

  public getTabId() {
    return this.tabId;
  }

  public cleanup() {
    if (this.channel) {
      this.channel.close();
    }
    if (this.leaderCheckInterval) {
      clearInterval(this.leaderCheckInterval);
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }
}

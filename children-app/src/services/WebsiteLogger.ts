export interface WebsiteLog {
  id: string;
  url: string;
  title: string;
  timestamp: Date;
  duration: number; // in seconds
  childId?: string; // for future use when connecting to parent dashboard
}

export interface LoggingConfig {
  enabled: boolean;
  logToConsole: boolean;
  apiEndpoint?: string;
  apiKey?: string;
  childId?: string;
}

export class WebsiteLogger {
  private config: LoggingConfig;
  private logs: WebsiteLog[] = [];
  private currentSession: WebsiteLog | null = null;
  private listeners: ((log: WebsiteLog) => void)[] = [];

  constructor(config: LoggingConfig) {
    this.config = config;
  }

  public startSession(url: string, title: string): void {
    if (!this.config.enabled) return;

    // End previous session if exists
    this.endCurrentSession();

    // Start new session
    this.currentSession = {
      id: Date.now().toString(),
      url,
      title,
      timestamp: new Date(),
      duration: 0,
      childId: this.config.childId,
    };
  }

  public endCurrentSession(): void {
    if (!this.currentSession) return;

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - this.currentSession.timestamp.getTime()) / 1000
    );
    const completedLog = { ...this.currentSession, duration };

    this.logs.push(completedLog);
    this.logWebsiteVisit(completedLog);
    this.notifyListeners(completedLog);

    this.currentSession = null;
  }

  private logWebsiteVisit(log: WebsiteLog): void {
    if (this.config.logToConsole) {
      console.log("🛡️ GuardNest - Website Visit Logged:", {
        url: log.url,
        title: log.title,
        timestamp: log.timestamp.toISOString(),
        duration: `${log.duration} seconds`,
        childId: log.childId || "unknown",
      });
    }

    // Future: Send to API
    this.sendToAPI(log);
  }

  private async sendToAPI(log: WebsiteLog): Promise<void> {
    if (!this.config.apiEndpoint || !this.config.apiKey) {
      return; // API not configured yet
    }

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(log),
      });

      if (!response.ok) {
        console.error(
          "Failed to send website log to API:",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error sending website log to API:", error);
    }
  }

  public getLogs(): WebsiteLog[] {
    return [...this.logs];
  }

  public getCurrentSession(): WebsiteLog | null {
    return this.currentSession;
  }

  public addListener(listener: (log: WebsiteLog) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (log: WebsiteLog) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(log: WebsiteLog): void {
    this.listeners.forEach((listener) => listener(log));
  }

  public updateConfig(newConfig: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): LoggingConfig {
    return { ...this.config };
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public getStats(): {
    totalVisits: number;
    totalTime: number;
    averageTime: number;
    uniqueDomains: number;
  } {
    const totalVisits = this.logs.length;
    const totalTime = this.logs.reduce((sum, log) => sum + log.duration, 0);
    const averageTime = totalVisits > 0 ? totalTime / totalVisits : 0;

    const uniqueDomains = new Set(
      this.logs.map((log) => new URL(log.url).hostname)
    ).size;

    return {
      totalVisits,
      totalTime,
      averageTime,
      uniqueDomains,
    };
  }
}

// Export singleton instance
export const websiteLogger = new WebsiteLogger({
  enabled: true,
  logToConsole: true,
  childId: "child-1", // This will be configurable later
});

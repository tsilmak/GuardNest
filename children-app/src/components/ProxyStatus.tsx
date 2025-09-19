import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface ProxyStatusProps {
  className?: string;
}

export function ProxyStatus({ className = "" }: ProxyStatusProps) {
  const [isRunning, setIsRunning] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRestarting, setIsRestarting] = useState(false);

  const checkProxyStatus = async () => {
    try {
      const status = await invoke<boolean>("get_proxy_status");
      setIsRunning(status);
      setLastCheck(new Date());
      setError(null);
    } catch (err) {
      setError(err as string);
      setIsRunning(false);
    }
  };

  const restartProxy = async () => {
    setIsRestarting(true);
    try {
      await invoke("restart_proxy");
      // Wait a moment for the restart to complete
      setTimeout(() => {
        checkProxyStatus();
        setIsRestarting(false);
      }, 2000);
    } catch (err) {
      setError(err as string);
      setIsRestarting(false);
    }
  };

  useEffect(() => {
    // Check immediately
    checkProxyStatus();

    // Check every 10 seconds
    const interval = setInterval(checkProxyStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isRunning === null) return "text-gray-500";
    return isRunning ? "text-green-600" : "text-red-600";
  };

  const getStatusText = () => {
    if (isRunning === null) return "Checking...";
    return isRunning ? "Running" : "Stopped";
  };

  const getStatusIcon = () => {
    if (isRunning === null) return "⏳";
    return isRunning ? "🟢" : "🔴";
  };

  return (
    <div
      className={`flex items-center space-x-2 p-3 bg-gray-50 rounded-lg ${className}`}
    >
      <span className="text-lg">{getStatusIcon()}</span>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Proxy Status:</span>
          <span className={`font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        {lastCheck && (
          <div className="text-sm text-gray-500">
            Last checked: {lastCheck.toLocaleTimeString()}
          </div>
        )}
        {error && <div className="text-sm text-red-600">Error: {error}</div>}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={checkProxyStatus}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
        <button
          onClick={restartProxy}
          disabled={isRestarting}
          className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRestarting ? "Restarting..." : "Restart"}
        </button>
      </div>
    </div>
  );
}

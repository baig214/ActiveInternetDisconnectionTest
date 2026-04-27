"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type ConnectionStatus = "online" | "offline" | "checking";

export interface ConnectionLogEntry {
  id: string;
  timestamp: Date;
  previousStatus: ConnectionStatus;
  newStatus: ConnectionStatus;
  detectionMethod: "browser_event" | "active_probe";
  message: string;
}

export interface ConnectivityState {
  status: ConnectionStatus;
  isOnline: boolean;
  lastChecked: Date | null;
  lastOnline: Date | null;
  lastOffline: Date | null;
  log: ConnectionLogEntry[];
  totalDisconnections: number;
  pingLatency: number | null;
  consecutiveFailures: number;
}

interface UseConnectivityOptions {
  /** Interval in ms for active probing (default: 3000) */
  pingInterval?: number;
  /** Number of consecutive failures before declaring offline (default: 2) */
  failureThreshold?: number;
  /** Enable/disable audio alerts (default: true) */
  enableAudioAlert?: boolean;
  /** Callback when status changes */
  onStatusChange?: (status: ConnectionStatus) => void;
}

export function useConnectivity(options: UseConnectivityOptions = {}) {
  const {
    pingInterval = 3000,
    failureThreshold = 2,
    enableAudioAlert = true,
    onStatusChange,
  } = options;

  const [state, setState] = useState<ConnectivityState>({
    status: "online",
    isOnline: true,
    lastChecked: null,
    lastOnline: new Date(),
    lastOffline: null,
    log: [],
    totalDisconnections: 0,
    pingLatency: null,
    consecutiveFailures: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStatusRef = useRef<ConnectionStatus>("online");
  const failureThresholdRef = useRef(failureThreshold);
  useEffect(() => {
    failureThresholdRef.current = failureThreshold;
  });

  const addLogEntry = useCallback(
    (
      previousStatus: ConnectionStatus,
      newStatus: ConnectionStatus,
      detectionMethod: "browser_event" | "active_probe",
      message: string
    ) => {
      const entry: ConnectionLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date(),
        previousStatus,
        newStatus,
        detectionMethod,
        message,
      };

      setState((prev) => ({
        ...prev,
        log: [entry, ...prev.log].slice(0, 100),
        totalDisconnections:
          newStatus === "offline"
            ? prev.totalDisconnections + 1
            : prev.totalDisconnections,
      }));
    },
    []
  );

  const playAlertSound = useCallback(() => {
    if (!enableAudioAlert) return;
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.5
      );
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch {
      // Audio context not available
    }
  }, [enableAudioAlert]);

  // Use a ref for updateStatus so it can be called from within setState
  const updateStatusRef = useRef<
    (
      newStatus: ConnectionStatus,
      detectionMethod: "browser_event" | "active_probe",
      message: string
    ) => void
  >(() => {});

  useEffect(() => {
    updateStatusRef.current = (
      newStatus: ConnectionStatus,
      detectionMethod: "browser_event" | "active_probe",
      message: string
    ) => {
    const prevStatus = prevStatusRef.current;
    if (prevStatus === newStatus) return;

    prevStatusRef.current = newStatus;
    addLogEntry(prevStatus, newStatus, detectionMethod, message);

    if (newStatus === "offline") {
      playAlertSound();
    }

    setState((prev) => ({
      ...prev,
      status: newStatus,
      isOnline: newStatus === "online",
      lastOffline: newStatus === "offline" ? new Date() : prev.lastOffline,
      lastOnline: newStatus === "online" ? new Date() : prev.lastOnline,
    }));

      onStatusChange?.(newStatus);
    };
  });

  const performPing = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const startTime = performance.now();
      const res = await fetch("/api/health", {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      const latency = Math.round(performance.now() - startTime);
      clearTimeout(timeout);

      if (res.ok) {
        setState((prev) => ({
          ...prev,
          consecutiveFailures: 0,
          pingLatency: latency,
          lastChecked: new Date(),
        }));
        updateStatusRef.current(
          "online",
          "active_probe",
          `Ping successful (${latency}ms)`
        );
      } else {
        setState((prev) => {
          const newFailures = prev.consecutiveFailures + 1;
          const threshold = failureThresholdRef.current;
          if (newFailures >= threshold) {
            setTimeout(() => {
              updateStatusRef.current(
                "offline",
                "active_probe",
                "Server responded with error"
              );
            }, 0);
          } else {
            updateStatusRef.current(
              "checking",
              "active_probe",
              `Ping failed (${newFailures}/${threshold}) — retrying...`
            );
          }
          return {
            ...prev,
            consecutiveFailures: newFailures,
            lastChecked: new Date(),
            pingLatency: null,
          };
        });
      }
    } catch {
      clearTimeout(timeout);
      setState((prev) => {
        const newFailures = prev.consecutiveFailures + 1;
        const threshold = failureThresholdRef.current;
        if (newFailures >= threshold) {
          setTimeout(() => {
            updateStatusRef.current(
              "offline",
              "active_probe",
              "Ping failed — no response"
            );
          }, 0);
        } else {
          updateStatusRef.current(
            "checking",
            "active_probe",
            `Ping failed (${newFailures}/${threshold}) — retrying...`
          );
        }
        return {
          ...prev,
          consecutiveFailures: newFailures,
          lastChecked: new Date(),
          pingLatency: null,
        };
      });
    }
  }, []);

  // Stable references for event handlers
  const performPingRef = useRef(performPing);
  useEffect(() => {
    performPingRef.current = performPing;
  });

  // Browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({
        ...prev,
        consecutiveFailures: 0,
      }));
      updateStatusRef.current(
        "online",
        "browser_event",
        "Browser reports connection restored"
      );
      performPingRef.current();
    };

    const handleOffline = () => {
      updateStatusRef.current(
        "offline",
        "browser_event",
        "Browser reports network disconnected"
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Active probing interval
  useEffect(() => {
    // Initial ping with slight delay to allow mount
    const initialTimeout = setTimeout(() => {
      performPing();
    }, 500);

    intervalRef.current = setInterval(() => {
      performPing();
    }, pingInterval);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pingInterval, performPing]);

  return state;
}

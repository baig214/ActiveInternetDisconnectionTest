"use client";

import { useConnectivity } from "@/hooks/use-connectivity";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Wifi,
  WifiOff,
  Loader2,
  Activity,
  Clock,
  AlertTriangle,
  Radio,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  ArrowDownUp,
  Zap,
} from "lucide-react";

function formatTime(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(date: Date | null): string {
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ago`;
}

export default function InternetMonitor() {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [pingInterval, setPingInterval] = useState(3);

  const state = useConnectivity({
    pingInterval: pingInterval * 1000,
    enableAudioAlert: audioEnabled,
    failureThreshold: 2,
  });

  const { status, pingLatency, lastChecked, lastOnline, lastOffline, log, totalDisconnections } = state;

  const isOnline = status === "online";
  const isChecking = status === "checking";
  const isOffline = status === "offline";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-destructive text-destructive-foreground px-4 py-3 flex items-center justify-center gap-3 animate-pulse">
          <WifiOff className="h-5 w-5" />
          <span className="font-semibold text-sm sm:text-base">
            Internet Connection Lost!
          </span>
          <span className="text-xs sm:text-sm opacity-90">
            Please check your network and try again.
          </span>
        </div>
      )}

      {isChecking && (
        <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-b border-yellow-500/20 px-4 py-2.5 flex items-center justify-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">
            Connection unstable — verifying...
          </span>
        </div>
      )}

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isOffline
                  ? "bg-red-500/10"
                  : isChecking
                  ? "bg-yellow-500/10"
                  : "bg-emerald-500/10"
              }`}
            >
              {isOffline ? (
                <WifiOff className="h-6 w-6 text-red-500" />
              ) : isChecking ? (
                <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />
              ) : (
                <Wifi className="h-6 w-6 text-emerald-500" />
              )}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                Internet Monitor
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Real-time connectivity watchdog
              </p>
            </div>
          </div>
          <Badge
            variant={isOffline ? "destructive" : "secondary"}
            className={`text-xs sm:text-sm px-3 py-1 ${
              !isOffline && !isChecking
                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400"
                : isChecking
                ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/15 dark:text-yellow-400"
                : ""
            }`}
          >
            {isOffline ? "OFFLINE" : isChecking ? "CHECKING..." : "ONLINE"}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Status Hero Card */}
        <Card
          className={`overflow-hidden transition-colors duration-500 ${
            isOffline
              ? "border-red-500/50 shadow-lg shadow-red-500/5"
              : isChecking
              ? "border-yellow-500/50 shadow-lg shadow-yellow-500/5"
              : "border-emerald-500/50 shadow-lg shadow-emerald-500/5"
          }`}
        >
          <div
            className={`h-1.5 transition-colors duration-500 ${
              isOffline
                ? "bg-red-500"
                : isChecking
                ? "bg-yellow-500"
                : "bg-emerald-500"
            }`}
          />
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* Big Status Icon */}
              <div
                className={`relative flex-shrink-0 ${
                  isOffline ? "animate-pulse" : ""
                }`}
              >
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-colors duration-500 ${
                    isOffline
                      ? "bg-red-500/10"
                      : isChecking
                      ? "bg-yellow-500/10"
                      : "bg-emerald-500/10"
                  }`}
                >
                  {isOffline ? (
                    <WifiOff className="h-12 w-12 sm:h-14 sm:w-14 text-red-500" />
                  ) : isChecking ? (
                    <Loader2 className="h-12 w-12 sm:h-14 sm:w-14 text-yellow-500 animate-spin" />
                  ) : (
                    <Wifi className="h-12 w-12 sm:h-14 sm:w-14 text-emerald-500" />
                  )}
                </div>
                {isOnline && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
                {isOffline && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center animate-bounce">
                    <XCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Status Info */}
              <div className="flex-1 space-y-2">
                <h2
                  className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                    isOffline
                      ? "text-red-500"
                      : isChecking
                      ? "text-yellow-500"
                      : "text-emerald-500"
                  }`}
                >
                  {isOffline
                    ? "No Internet Connection"
                    : isChecking
                    ? "Checking Connection..."
                    : "Connected to Internet"}
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base max-w-md">
                  {isOffline
                    ? "Your device is not connected to the internet. This could be due to WiFi being turned off, disconnected from the router, or network cable/switch issues."
                    : isChecking
                    ? "One or more connectivity checks failed. Verifying your internet connection..."
                    : "All connectivity checks are passing. Your internet connection is healthy."}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                  {pingLatency !== null && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Zap className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-muted-foreground">Latency:</span>
                      <span className="font-mono font-medium">
                        {pingLatency}ms
                      </span>
                    </div>
                  )}
                  {lastChecked && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Checked:</span>
                      <span className="font-mono font-medium">
                        {formatTime(lastChecked)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detection Methods Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Detection Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-1.5 rounded-md bg-blue-500/10 mt-0.5">
                  <Wifi className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Browser Events</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Detects WiFi/LAN off, WiFi disconnected from router
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-1.5 rounded-md bg-emerald-500/10 mt-0.5">
                  <Activity className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Active Probing</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Detects switch disconnected, ISP down, no actual internet
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-1.5 rounded-md bg-orange-500/10 mt-0.5">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Failure Threshold</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Requires 2 consecutive failures before alerting
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Status</span>
              <span
                className={`text-sm font-bold ${
                  isOffline
                    ? "text-red-500"
                    : isChecking
                    ? "text-yellow-500"
                    : "text-emerald-500"
                }`}
              >
                {status.toUpperCase()}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Latency</span>
              <span className="text-sm font-bold font-mono">
                {pingLatency !== null ? `${pingLatency}ms` : "—"}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Disconnections</span>
              <span className="text-sm font-bold font-mono">
                {totalDisconnections}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
              <ArrowDownUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Last Offline</span>
              <span className="text-sm font-bold font-mono">
                {lastOffline ? formatDuration(lastOffline) : "Never"}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Connection Log */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Connection Log
                </CardTitle>
                <CardDescription className="mt-1">
                  Real-time history of connectivity changes
                </CardDescription>
              </div>
              {log.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {log.length} events
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {log.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No events recorded yet</p>
                <p className="text-xs mt-1">
                  Connectivity events will appear here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[320px] rounded-md border">
                <div className="p-2 space-y-1">
                  {log.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-start gap-3 p-3 rounded-lg text-sm transition-colors ${
                        entry.newStatus === "offline"
                          ? "bg-red-500/5 border border-red-500/10"
                          : entry.newStatus === "online"
                          ? "bg-emerald-500/5 border border-emerald-500/10"
                          : "bg-yellow-500/5 border border-yellow-500/10"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {entry.newStatus === "offline" ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : entry.newStatus === "online" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Loader2 className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{entry.message}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${
                              entry.detectionMethod === "browser_event"
                                ? "border-blue-500/30 text-blue-500"
                                : "border-emerald-500/30 text-emerald-500"
                            }`}
                          >
                            {entry.detectionMethod === "browser_event"
                              ? "Event"
                              : "Probe"}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {entry.timestamp.toLocaleString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Settings</CardTitle>
            <CardDescription>
              Configure monitoring behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {audioEnabled ? (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <Label className="text-sm font-medium">Audio Alert</Label>
                  <p className="text-xs text-muted-foreground">
                    Play a sound when connection drops
                  </p>
                </div>
              </div>
              <Switch
                checked={audioEnabled}
                onCheckedChange={setAudioEnabled}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">
                    Ping Interval
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    How often to check connection
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {[2, 3, 5, 10].map((sec) => (
                  <Button
                    key={sec}
                    variant={pingInterval === sec ? "default" : "outline"}
                    size="sm"
                    className="text-xs w-14"
                    onClick={() => setPingInterval(sec)}
                  >
                    {sec}s
                  </Button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Last Online</span>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(lastOnline)}
                  </p>
                </div>
              </div>
            </div>
            {lastOffline && (
              <>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Last Offline</span>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(lastOffline)}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Scenarios Covered */}
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Scenarios Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  title: "WiFi/LAN turned off or cable removed",
                  desc: "Detected instantly via browser offline event",
                  method: "Browser Event",
                },
                {
                  title: "WiFi connected but not to router",
                  desc: "Detected via browser event + confirmed by failed ping",
                  method: "Dual Detection",
                },
                {
                  title: "LAN connected but switch disconnected",
                  desc: "Detected by active probe failing after 2 consecutive timeouts",
                  method: "Active Probe",
                },
              ].map((scenario, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{scenario.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {scenario.desc}
                    </p>
                    <Badge variant="outline" className="text-[10px] mt-1.5">
                      {scenario.method}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          Internet Connectivity Monitor — Uses dual-layer detection (Browser
          Events + Active Probing) for reliable disconnection alerts
        </div>
      </footer>
    </div>
  );
}

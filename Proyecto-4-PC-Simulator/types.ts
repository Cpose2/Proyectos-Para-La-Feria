import React from 'react';

export type ComponentType = 'cpu' | 'gpu' | 'ram' | 'disk' | 'psu' | 'motherboard' | 'fan';

export interface PcComponent {
  id: ComponentType;
  name: string;
  description: string;
  function: string;
  failureSymptoms: string;
  icon: string;
}

export type AppId = 'browser' | 'editor' | 'video' | 'game' | 'taskmanager' | 'workshop' | 'diagnostic' | 'antivirus' | 'settings' | 'explorer' | 'store' | 'missions' | 'teacher' | 'mail' | 'music' | 'assistant' | 'eventviewer';

export interface VirtualApp {
  id: AppId;
  name: string;
  icon: React.ReactNode; 
  minRam: number; 
  needsGpu: boolean;
  cpuIntensity: 'low' | 'medium' | 'high';
  restricted?: boolean; // For parental control
}

export interface HardwareState {
  cpu: { name: string; speed: number; temp: number; health: number; pasteApplied: boolean; wearLevel: number }; 
  ram: { size: number; usage: number; health: number; wearLevel: number }; 
  gpu: { name: string; vram: number; health: number; installed: boolean; artifacting: boolean };
  disk: { type: 'HDD' | 'SSD'; speed: number; health: number; fragmented: boolean }; 
  psu: { wattage: number; health: number; voltageStable: boolean; peakLoadCount: number }; 
  fans: { speed: number; dustLevel: number; noiseLevel: number }; 
}

export type VirusType = 'adware_popups' | 'purple_buddy' | 'miner_trojan' | 'ransomware_light' | 'clipboard_hijacker';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  isCorrupted: boolean;
  isHidden: boolean;
  isReadOnly?: boolean; // New: simulating "file in use" or permissions
  isSystemFile?: boolean; // New: For false positive lessons
}

export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  virusAttachment?: VirusType;
  isRead: boolean;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'usb';
  timestamp: Date;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  reward: number;
  condition: (hw: HardwareState, sw: SoftwareState) => boolean;
}

export type ThemeType = 'light' | 'dark' | 'blue';

export interface UserPreferences {
  wallpaper: string;
  theme: ThemeType;
  volume: number;
  wifiConnected: boolean;
  focusAssist: boolean; // New: Do not disturb
  powerMode: 'balanced' | 'performance' | 'saver'; // New
}

export interface UserAccount {
  id: string;
  name: string;
  role: 'admin' | 'user' | 'child';
  password?: string;
  avatar: string;
}

export interface SystemLog {
  id: number;
  timestamp: Date;
  source: string;
  event: string;
  type: 'info' | 'warning' | 'error' | 'critical';
}

export interface RestorePoint {
  id: number;
  name: string;
  timestamp: Date;
  hardware: HardwareState;
  software: SoftwareState; 
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
}

export interface UsbDrive {
    id: string;
    name: string;
    capacity: number;
    files: FileNode[];
    virus?: VirusType;
    isInfected: boolean;
}

export interface SoftwareState {
  installedViruses: VirusType[];
  isAntivirusRunning: boolean;
  browserHistory: string[];
  files: FileNode[];
  notifications: Notification[];
  score: number;
  userRank: 'Novato' | 'Técnico' | 'Experto' | 'Ingeniero';
  preferences: UserPreferences;
  users: UserAccount[];
  currentUser: string | null; 
  logs: SystemLog[];
  restorePoints: RestorePoint[];
  clipboard: string;
  updatesPending: boolean;
  achievements: Achievement[];
  connectedUsb: UsbDrive | null; 
  currentDesktop: number;
  
  // Advanced Simulation State
  registryCorruption: number; // 0-100. Causes random settings changes/crashes
  driverStability: number; // 0-100. Causes visual glitches/black screens
  lastUpdateStatus: 'success' | 'failed' | 'rollback' | 'none';
}

export type SnapPosition = 'normal' | 'maximized' | 'left' | 'right';

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  isMinimized: boolean;
  snapPosition: SnapPosition;
  status: 'running' | 'frozen' | 'crashed' | 'loading' | 'not_responding';
  errorMessage?: string;
  zIndex: number;
  desktopId: number; 
}

export type SimulationMode = 'idle' | 'low_ram' | 'slow_disk' | 'overheat' | 'bsod';

export type OsState = 'off' | 'boot' | 'lock' | 'login' | 'desktop' | 'bsod' | 'updating' | 'shutting_down' | 'glitch_restart';
export type BootMode = 'normal' | 'safe';
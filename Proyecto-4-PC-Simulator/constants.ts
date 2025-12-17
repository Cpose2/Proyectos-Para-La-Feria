import { PcComponent, VirtualApp, HardwareState, VirusType, FileNode, Mission, SoftwareState, Email, UserAccount, Achievement, UsbDrive } from './types';
import React from 'react';

export const PC_COMPONENTS: Record<string, PcComponent> = {
  cpu: {
    id: 'cpu',
    name: 'Procesador (CPU)',
    description: 'Cerebro del PC.',
    function: 'Calcula todo. Si se calienta, el sistema se apaga.',
    failureSymptoms: 'Lentitud extrema, apagados repentinos.',
    icon: 'cpu',
  },
  gpu: {
    id: 'gpu',
    name: 'Tarjeta Gráfica',
    description: 'Renderizado de video y juegos.',
    function: 'Esencial para juegos y video HD.',
    failureSymptoms: 'Pantalla negra, glitches visuales, juegos no abren.',
    icon: 'monitor',
  },
  ram: {
    id: 'ram',
    name: 'Memoria RAM',
    description: 'Espacio de trabajo temporal.',
    function: 'Permite tener varias apps abiertas.',
    failureSymptoms: 'Programas se cierran solos, navegador lento.',
    icon: 'grid',
  },
  disk: {
    id: 'disk',
    name: 'Disco Duro',
    description: 'Almacenamiento permanente.',
    function: 'Guarda archivos y el SO.',
    failureSymptoms: 'El sistema tarda años en arrancar, archivos corruptos.',
    icon: 'hard-drive',
  },
  psu: {
    id: 'psu',
    name: 'Fuente de Poder',
    description: 'Energía eléctrica.',
    function: 'Alimenta todo.',
    failureSymptoms: 'El PC no enciende o se reinicia bajo carga.',
    icon: 'zap',
  },
  motherboard: {
    id: 'motherboard',
    name: 'Placa Madre',
    description: 'Conector principal.',
    function: 'Conecta todo.',
    failureSymptoms: 'USB no funciona, errores aleatorios.',
    icon: 'layers',
  },
  fan: {
    id: 'fan',
    name: 'Ventilación',
    description: 'Disipación de calor.',
    function: 'Enfría el CPU.',
    failureSymptoms: 'Ruido fuerte, sobrecalentamiento.',
    icon: 'wind',
  }
};

export const VIRTUAL_APPS: VirtualApp[] = [
  { id: 'settings', name: 'Configuración', icon: '⚙️', minRam: 0.5, needsGpu: false, cpuIntensity: 'low' },
  { id: 'explorer', name: 'Explorador', icon: '📁', minRam: 1, needsGpu: false, cpuIntensity: 'low' },
  { id: 'browser', name: 'Edge (Sim)', icon: '🌍', minRam: 4, needsGpu: false, cpuIntensity: 'medium' },
  { id: 'store', name: 'Tienda', icon: '🛍️', minRam: 2, needsGpu: false, cpuIntensity: 'medium' },
  { id: 'mail', name: 'Correo', icon: '✉️', minRam: 1, needsGpu: false, cpuIntensity: 'low' },
  { id: 'assistant', name: 'Asistente IA', icon: '🤖', minRam: 2, needsGpu: false, cpuIntensity: 'medium' },
  { id: 'music', name: 'Música', icon: '🎵', minRam: 1, needsGpu: false, cpuIntensity: 'low' },
  { id: 'video', name: 'Cine y TV', icon: '🎬', minRam: 2, needsGpu: true, cpuIntensity: 'medium' },
  { id: 'game', name: 'CyberRun', icon: '🎮', minRam: 8, needsGpu: true, cpuIntensity: 'high', restricted: true },
  { id: 'missions', name: 'Misiones', icon: '🎯', minRam: 1, needsGpu: false, cpuIntensity: 'low' },
  { id: 'antivirus', name: 'Seguridad', icon: '🛡️', minRam: 2, needsGpu: false, cpuIntensity: 'medium' },
  { id: 'taskmanager', name: 'Admin Tareas', icon: '📊', minRam: 0.5, needsGpu: false, cpuIntensity: 'low' },
  { id: 'diagnostic', name: 'Diagnóstico', icon: '🩺', minRam: 0.5, needsGpu: false, cpuIntensity: 'low' },
  { id: 'eventviewer', name: 'Visor Eventos', icon: '📋', minRam: 0.5, needsGpu: false, cpuIntensity: 'low' },
  { id: 'editor', name: 'Bloc Notas', icon: '📝', minRam: 0.2, needsGpu: false, cpuIntensity: 'low' },
  { id: 'teacher', name: 'Control Sala', icon: '🎓', minRam: 0, needsGpu: false, cpuIntensity: 'low' },
  { id: 'workshop', name: 'TALLER PC', icon: '🛠️', minRam: 0, needsGpu: false, cpuIntensity: 'low' },
];

export const WALLPAPERS = [
  { id: 'w1', name: 'Windows Bloom', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80' },
  { id: 'w2', name: 'Dark Abstract', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80' },
  { id: 'w3', name: 'Nature', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80' },
  { id: 'w4', name: 'Tech', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80' },
];

export const INITIAL_EMAILS: Email[] = [
  { 
    id: 'e1', from: 'Jefe (admin@empresa.com)', subject: 'RE: Informe urgente', body: 'Necesito que termines el informe para mañana. No olvides revisar los adjuntos en la carpeta compartida.', isRead: false 
  },
  { 
    id: 'e2', from: 'Soporte Técnico', subject: 'Actualización Requerida', body: 'Su sistema está desactualizado. Haga clic aquí para descargar el parche de seguridad: [DESCARGAR_PARCHE.EXE]', virusAttachment: 'miner_trojan', isRead: false 
  },
  { 
    id: 'e3', from: 'Abogado Nigeria', subject: 'Herencia millonaria', body: 'Estimado, soy el abogado de su tío lejano. Ha heredado 5 millones de dólares. Solo necesito sus datos bancarios en este formulario seguro.', virusAttachment: 'ransomware_light', isRead: false 
  },
  { 
    id: 'e4', from: 'Mamá', subject: 'Fotos del gato', body: 'Mira que lindo está Michi. Te mando un beso.', isRead: true 
  },
  {
    id: 'e5', from: 'WinStore Rewards', subject: '¡Ganaste un premio!', body: 'Felicidades usuario. Has sido seleccionado. Reclama tu premio aquí: [RECLAMAR_PREMIO]', virusAttachment: 'purple_buddy', isRead: false
  },
  {
    id: 'e6', from: 'ClipBoard Tool', subject: 'Mejora tu copiar y pegar', body: 'Utilidad gratuita para gestionar el portapapeles. [INSTALAR.EXE]', virusAttachment: 'clipboard_hijacker', isRead: false
  }
];

export const VIRUS_DB: Record<VirusType, { name: string, description: string, cure: string }> = {
  'adware_popups': { 
    name: 'Adware Storm', 
    description: 'Abre ventanas de publicidad infinitas.', 
    cure: 'Antivirus' 
  },
  'purple_buddy': { 
    name: 'Purple Buddy', 
    description: 'Asistente molesto que consume RAM y bloquea la pantalla.', 
    cure: 'Admin Tareas (Finalizar Proceso) o Modo Seguro' 
  },
  'miner_trojan': { 
    name: 'Miner X', 
    description: 'Usa tu CPU para minar cripto. PC muy lenta.', 
    cure: 'Antivirus + Reinicio' 
  },
  'ransomware_light': {
    name: 'CrypToFail',
    description: 'Impide guardar archivos y encripta datos.',
    cure: 'Restaurar Sistema (simulado)'
  },
  'clipboard_hijacker': {
    name: 'ClipThief',
    description: 'Cambia lo que copias por direcciones de cartera falsas.',
    cure: 'Antivirus'
  }
};

export const FAKE_WEBSITES = [
  { url: 'www.noticias-seguras.com', title: 'Noticias del Mundo', safe: true },
  { url: 'www.descargar-ram-gratis.net', title: 'DOWNLOAD 64GB RAM FREE', safe: false, virus: 'miner_trojan' as VirusType },
  { url: 'www.ganaste-un-iphone.xyz', title: '¡ERES EL GANADOR 1000!', safe: false, virus: 'adware_popups' as VirusType },
  { url: 'www.asistente-divertido.com', title: 'Instala Buddy, tu amigo virtual', safe: false, virus: 'purple_buddy' as VirusType },
];

export const INITIAL_FILES: FileNode[] = [
  { id: '1', name: 'Tesis_Final.docx', type: 'file', isCorrupted: false, isHidden: false },
  { id: '2', name: 'Fotos_Vacaciones', type: 'folder', isCorrupted: false, isHidden: false },
  { id: '3', name: 'passwords.txt', type: 'file', isCorrupted: false, isHidden: false, content: 'Facebook: 123456\nBanco: 0000' },
  { id: '4', name: 'system32.dll', type: 'file', isCorrupted: false, isHidden: true, isReadOnly: true, isSystemFile: true },
  { id: '5', name: 'hal.dll', type: 'file', isCorrupted: false, isHidden: true, isReadOnly: true, isSystemFile: true },
];

export const POSSIBLE_USB_DRIVES: UsbDrive[] = [
    {
        id: 'usb_clean',
        name: 'Kingston 16GB',
        capacity: 16,
        isInfected: false,
        files: [{ id: 'u1', name: 'Tarea_Escuela.docx', type: 'file', isCorrupted: false, isHidden: false }]
    },
    {
        id: 'usb_infected',
        name: 'USB Encontrado',
        capacity: 8,
        isInfected: true,
        virus: 'adware_popups',
        files: [{ id: 'u2', name: 'JUEGOS_GRATIS.exe', type: 'file', isCorrupted: false, isHidden: false }]
    }
];

export const MISSIONS: Mission[] = [
  { 
    id: 'm1', 
    title: 'PC Lenta', 
    description: 'El cliente dice que su PC está muy lenta. Encuentra el problema y solucionalo.', 
    completed: false, 
    reward: 100,
    condition: (hw, sw) => hw.cpu.temp < 50 && sw.installedViruses.length === 0
  },
  { 
    id: 'm2', 
    title: 'Limpieza de Primavera', 
    description: 'Los ventiladores suenan como turbina de avión. Límpialos.', 
    completed: false, 
    reward: 50,
    condition: (hw, sw) => hw.fans.dustLevel === 0
  },
  {
    id: 'm3',
    title: 'Gamer Pro',
    description: 'Instala una tarjeta gráfica decente (GPU Dedicada) para poder jugar.',
    completed: false,
    reward: 150,
    condition: (hw, sw) => hw.gpu.installed && hw.gpu.vram >= 4
  }
];

export const INITIAL_HARDWARE: HardwareState = {
  cpu: { name: 'Intel Core i3 Old-Gen', speed: 2.4, temp: 45, health: 100, pasteApplied: false, wearLevel: 10 }, 
  ram: { size: 4, usage: 30, health: 100, wearLevel: 5 }, 
  gpu: { name: 'Integrated Graphics', vram: 1, health: 80, installed: true, artifacting: false }, 
  disk: { type: 'HDD', speed: 50, health: 40, fragmented: true }, 
  psu: { wattage: 450, health: 100, voltageStable: true, peakLoadCount: 0 },
  fans: { speed: 1200, dustLevel: 80, noiseLevel: 60 }, 
};

export const INITIAL_USERS: UserAccount[] = [
  { id: 'u1', name: 'Admin', role: 'admin', avatar: '👨‍💻' },
  { id: 'u2', name: 'Invitado', role: 'user', avatar: '👤' },
  { id: 'u3', name: 'Hermanito', role: 'child', avatar: '👶' }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'Primer Arranque', icon: '🚀', unlocked: true },
  { id: 'a2', title: 'Cazador de Virus', icon: '🛡️', unlocked: false },
  { id: 'a3', title: 'Ingeniero de Hardware', icon: '🔧', unlocked: false },
  { id: 'a4', title: 'Salvador de Datos', icon: '💾', unlocked: false },
];
import React, { useState, useEffect } from 'react';
import PcView from './components/PcView';
import Desktop from './components/Desktop';
import WorkshopPanel from './components/WorkshopPanel';
import { ComponentType, HardwareState, SoftwareState, VirusType, OsState, BootMode, Notification, SystemLog } from './types';
import { INITIAL_HARDWARE, INITIAL_FILES, MISSIONS, WALLPAPERS, INITIAL_USERS, ACHIEVEMENTS, POSSIBLE_USB_DRIVES } from './constants';
import { playSystemSound } from './services/soundService';

const App: React.FC = () => {
  const [view, setView] = useState<'desktop' | 'workshop'>('desktop');
  const [osState, setOsState] = useState<OsState>('boot');
  const [bootMode, setBootMode] = useState<BootMode>('normal');
  
  const [hardware, setHardware] = useState<HardwareState>(INITIAL_HARDWARE);
  const [software, setSoftware] = useState<SoftwareState>({
     installedViruses: [],
     isAntivirusRunning: false,
     browserHistory: [],
     files: INITIAL_FILES,
     notifications: [],
     score: 0,
     userRank: 'Novato',
     preferences: {
        wallpaper: WALLPAPERS[0].url,
        theme: 'light',
        volume: 50,
        wifiConnected: true,
        focusAssist: false,
        powerMode: 'balanced'
     },
     users: INITIAL_USERS,
     currentUser: INITIAL_USERS[0].id,
     logs: [],
     restorePoints: [
        { id: 1, name: 'Instalación limpia', timestamp: new Date(), hardware: INITIAL_HARDWARE, software: { ...INITIAL_FILES } as any } // simplified snapshot
     ],
     clipboard: '',
     updatesPending: true,
     achievements: ACHIEVEMENTS,
     connectedUsb: null,
     currentDesktop: 0,
     // Advanced State
     registryCorruption: 5,
     driverStability: 95,
     lastUpdateStatus: 'none'
  });
  
  const [selectedComponent, setSelectedComponent] = useState<ComponentType | null>(null);

  // --- ENTROPY ENGINE HELPERS ---

  const generateRandomLog = (type: 'info' | 'warning' | 'error' | 'critical', source: string, msg: string) => {
      const newLog: SystemLog = {
         id: Date.now(),
         timestamp: new Date(),
         source: source,
         event: msg,
         type: type
      };
      setSoftware(prev => ({ ...prev, logs: [...prev.logs, newLog] }));
  };

  const notify = (title: string, message: string, type: 'info'|'warning'|'error'|'usb' = 'info') => {
     if(software.preferences.focusAssist && type !== 'error') return; 

     // Simulate notification overload/glitches
     if (software.registryCorruption > 40 && Math.random() < 0.2) {
         // Duplicate notification
         setTimeout(() => notify(title, message, type), 200);
     }

     const newNotif: Notification = { id: Date.now(), title, message, type, timestamp: new Date() };
     setSoftware(prev => ({ ...prev, notifications: [...prev.notifications, newNotif] }));
     playSystemSound(type === 'error' ? 'error' : 'success');
     
     generateRandomLog(type === 'error' ? 'error' : 'info', 'NotificationService', `${title}: ${message}`);

     setTimeout(() => {
        setSoftware(prev => ({ ...prev, notifications: prev.notifications.filter(n => n.id !== newNotif.id) }));
     }, 5000);
  };

  // --- HANDLERS ---

  const handleUpdatePreferences = (key: string, value: any) => {
     setSoftware(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [key]: value }
     }));
  };

  const handleUpdateClipboard = (text: string) => {
      setSoftware(prev => ({ ...prev, clipboard: text }));
  };

  const handleLoginUser = (uid: string) => {
      setSoftware(prev => ({ ...prev, currentUser: uid }));
      playSystemSound('startup');
  };

  const handleRestoreSystem = (pointId: number) => {
      setOsState('boot');
      setTimeout(() => {
          setSoftware(prev => ({
              ...prev,
              installedViruses: [],
              files: INITIAL_FILES, 
              notifications: [],
              connectedUsb: null,
              registryCorruption: 0,
              driverStability: 100
          }));
          notify("Restauración Completada", "El sistema se ha restaurado al punto seleccionado.", 'info');
      }, 2000);
  };

  const handleMountUsb = (id: string) => {
      if (!id) {
          setSoftware(prev => ({ ...prev, connectedUsb: null }));
          notify("USB Expulsado", "Es seguro quitar el hardware.", 'info');
          return;
      }
      
      const usb = POSSIBLE_USB_DRIVES.find(u => u.id === id);
      if (usb) {
          setSoftware(prev => ({ ...prev, connectedUsb: usb }));
          // Intermittent USB failure simulation
          if (hardware.motherboard && hardware.cpu.wearLevel > 30 && Math.random() < 0.3) {
             setTimeout(() => {
                 setSoftware(prev => ({ ...prev, connectedUsb: null }));
                 playSystemSound('error');
                 generateRandomLog('error', 'USBHOST', 'Device descriptor request failed.');
             }, 1000);
          } else {
             notify("USB Conectado", `${usb.name} ha sido detectado.`, 'usb');
          }
      }
  };

  const handleSwitchDesktop = (id: number) => {
      setSoftware(prev => ({ ...prev, currentDesktop: id }));
  };
  
  const handleSystemUpdate = () => {
      setOsState('updating');
      
      // REALISTIC UPDATE LOGIC:
      // Updates can fix pending issues but break stability if hardware is old/worn.
      const chanceOfFailure = (hardware.cpu.wearLevel + hardware.disk.health < 100 ? 0.3 : 0.05);
      
      setTimeout(() => {
          if (Math.random() < chanceOfFailure) {
             // Update Failed or caused regression
             setOsState('boot');
             setSoftware(prev => ({
                 ...prev,
                 updatesPending: false,
                 driverStability: Math.max(20, prev.driverStability - 30), // Break drivers
                 registryCorruption: prev.registryCorruption + 10,
                 lastUpdateStatus: 'failed'
             }));
             setTimeout(() => notify("Error de actualización", "La actualización KB5034441 falló. Revirtiendo cambios...", 'error'), 3000);
          } else {
             // Success
             setOsState('boot');
             setSoftware(prev => ({
                 ...prev,
                 updatesPending: false,
                 driverStability: 100, // Fresh drivers
                 registryCorruption: Math.max(0, prev.registryCorruption - 20), // Fix registry
                 lastUpdateStatus: 'success'
             }));
             setTimeout(() => notify("Sistema Actualizado", "Nuevas características instaladas.", 'info'), 3000);
          }
      }, 5000);
  };

  // --- ENTROPY ENGINE (GAME LOOP) ---
  useEffect(() => {
    const simInterval = setInterval(() => {
       
       // 1. HARDWARE SIMULATION
       setHardware(prevHw => {
          const hw = { ...prevHw };
          
          // --- THERMAL PHYSICS & WEAR ---
          if (osState === 'off' || osState === 'bsod') {
             const ambient = 25;
             if (hw.cpu.temp > ambient) {
                 const coolingFactor = (100 - hw.fans.dustLevel) / 100; 
                 const rate = 0.5 + (1.5 * coolingFactor); 
                 hw.cpu.temp = Math.max(ambient, hw.cpu.temp - rate);
             }
             return hw;
          }

          const fanEfficiency = Math.max(0.1, 1 - (hw.fans.dustLevel / 100));
          const pasteFactor = hw.cpu.pasteApplied ? 1 : 0.4; 
          
          let baseTarget = 35 + (hw.fans.dustLevel * 0.5);
          if (!hw.cpu.pasteApplied) baseTarget += 30; 

          if (bootMode === 'normal' && osState === 'desktop') {
             if (software.installedViruses.includes('miner_trojan')) {
                baseTarget += 40; 
                hw.ram.usage = Math.min(99, hw.ram.usage + 1);
             }
             // General load increases with uptime/corruption
             baseTarget += (software.registryCorruption / 10);
          }

          if (hw.cpu.temp < baseTarget) {
             const heatRate = hw.cpu.pasteApplied ? 0.1 : 0.8;
             hw.cpu.temp += heatRate; 
          } else if (hw.cpu.temp > baseTarget) {
             const coolingRate = 0.5 * fanEfficiency * pasteFactor;
             hw.cpu.temp -= coolingRate;
          }
          
          // WEAR CALCULATION (Permanent damage)
          if (hw.cpu.temp > 80) {
              hw.cpu.wearLevel += 0.05; // Fast degradation
              hw.cpu.health = Math.max(0, 100 - hw.cpu.wearLevel);
          } else if (hw.cpu.temp > 60) {
              hw.cpu.wearLevel += 0.005; // Slow degradation
          }

          if (hw.psu.voltageStable === false) {
              hw.disk.health = Math.max(0, hw.disk.health - 0.05);
              hw.gpu.health = Math.max(0, hw.gpu.health - 0.05);
          }

          // BSOD Trigger
          if (hw.cpu.temp > 105 || hw.ram.health < 10) {
             setOsState('bsod');
             playSystemSound('error');
             generateRandomLog('critical', 'KERNEL_POWER', 'System halted due to critical hardware failure.');
          }

          return hw;
       });

       // 2. SOFTWARE ENTROPY (Ghost behaviors)
       setSoftware(prevSw => {
           let sw = { ...prevSw };
           
           // Registry Corruption accumulation over time if maintenance isn't done
           if (hardware.disk.fragmented && Math.random() < 0.05) {
               sw.registryCorruption = Math.min(100, sw.registryCorruption + 0.1);
           }
           if (sw.installedViruses.length > 0 && Math.random() < 0.1) {
               sw.registryCorruption = Math.min(100, sw.registryCorruption + 0.5);
           }

           // GHOST BEHAVIORS (Based on corruption/stability)
           if (osState === 'desktop') {
               const roll = Math.random();
               
               // Ghost Settings (Registry Corruption)
               if (sw.registryCorruption > 40 && roll < 0.01) {
                   // Randomly toggle Focus Assist
                   sw.preferences.focusAssist = !sw.preferences.focusAssist;
                   generateRandomLog('warning', 'SettingsBroker', 'Configuration changed by unknown source.');
               }

               // Driver Instability (Visual Glitches)
               if (sw.driverStability < 50 && roll < 0.02) {
                   // Screen flicker simulation could be triggered via state here, 
                   // but visual effect handled in Desktop.tsx via driverStability prop
                   playSystemSound('error');
               }

               // Random App Crashes (RAM Wear)
               if (hardware.ram.wearLevel > 40 && roll < 0.005) {
                   notify('Error de Aplicación', 'El Explorador de Windows dejó de responder.', 'error');
               }
           }

           return sw;
       });

    }, 1000);
    return () => clearInterval(simInterval);
  }, [software.installedViruses, osState, bootMode, hardware.cpu.wearLevel, software.registryCorruption]);

  // Handle Infections
  const handleInfect = (virus: VirusType) => {
     if (!software.installedViruses.includes(virus)) {
        setSoftware(prev => ({ ...prev, installedViruses: [...prev.installedViruses, virus] }));
        notify("Seguridad Comprometida", "Se ha detectado software malicioso.", 'error');
        
        setSoftware(s => ({
             ...s,
             registryCorruption: s.registryCorruption + 15, // Infection hurts registry
             logs: [...s.logs, { id: Date.now(), timestamp: new Date(), source: 'Windows Defender', event: `Threat detected: ${virus}`, type: 'error' }]
        }));

        if (software.installedViruses.length > 4 && osState !== 'bsod') {
           setTimeout(() => setOsState('bsod'), 2000);
        }
     }
  };

  const handleCleanVirus = (virus: VirusType) => {
     setSoftware(prev => ({
        ...prev,
        installedViruses: prev.installedViruses.filter(v => v !== virus),
        score: prev.score + 50
     }));
     notify("Amenaza Eliminada", `El virus ${virus} ha sido eliminado.`, 'info');
  };

  const handleDeleteFile = (id: string) => {
     const file = software.files.find(f => f.id === id);
     
     // LESSON: FALSE POSITIVES
     if (file && file.isSystemFile) {
         setOsState('bsod');
         playSystemSound('error');
         setTimeout(() => {
             alert("¡ERROR CRÍTICO! Has borrado un archivo del sistema (system32.dll). El antivirus dio un falso positivo y caíste en la trampa. Nunca borres archivos del sistema sin verificar.");
         }, 1000);
         return;
     }

     setSoftware(prev => ({ ...prev, files: prev.files.filter(f => f.id !== id) }));
  };

  // Workshop Repair Logic (Enhanced)
  const handleRepair = (action: string, component: ComponentType) => {
     setHardware(prev => {
        const hw = { ...prev };
        let points = 0;

        if (action === 'clean' && component === 'fan') {
           hw.fans.dustLevel = 0;
           hw.fans.speed = 1200;
           // Cleaning dust doesn't fix wear, only prevents future wear
           points = 50;
        }
        if (component === 'ram') {
           if (action === 'upgrade_8') { hw.ram.size = 8; hw.ram.wearLevel = 0; }
           if (action === 'upgrade_16') { hw.ram.size = 16; hw.ram.wearLevel = 0; }
           hw.ram.health = 100;
           points = 100;
        }
        if (component === 'disk') {
           if (action === 'swap_ssd') { hw.disk.type = 'SSD'; hw.disk.speed = 100; hw.disk.health = 100; hw.disk.fragmented = false; }
           if (action === 'format') { hw.disk.fragmented = false; } // Formatting fixes software issues, not health
           points = 80;
        }
        if (action === 'paste' && component === 'cpu') {
           hw.cpu.pasteApplied = true; 
           hw.cpu.temp = 40; 
           points = 30;
        }
        if (action === 'replace' && component === 'gpu') {
           hw.gpu.installed = true;
           hw.gpu.name = "RTX 4060 Ti";
           hw.gpu.vram = 8;
           hw.gpu.health = 100;
           hw.gpu.artifacting = false;
           points = 150;
        }
        if (action === 'stabilize' && component === 'psu') {
           hw.psu.voltageStable = true;
           hw.psu.health = 100;
           points = 60;
        }
        
        if (points > 0) notify("Reparación Exitosa", `Hardware optimizado. +${points} pts`, 'info');
        setSoftware(s => ({ ...s, score: s.score + points }));
        return hw;
     });
  };

  const handleManualTrigger = (type: string) => {
     if (type === 'heat') setHardware(h => ({ ...h, cpu: { ...h.cpu, temp: 110 } }));
     if (type === 'dust') setHardware(h => ({ ...h, fans: { ...h.fans, dustLevel: 100 } }));
     if (type === 'virus_all') setSoftware(s => ({ ...s, installedViruses: ['adware_popups', 'miner_trojan', 'purple_buddy'] }));
     if (type === 'bsod') setOsState('bsod');
     if (type === 'gpu_fail') setHardware(h => ({ ...h, gpu: { ...h.gpu, health: 0, installed: true } }));
     notify("Modo Control", `Comando ejecutado: ${type}`, 'warning');
  };

  // Determine visual lag based on hardware stress
  const systemLagLevel = (hardware.cpu.temp > 80 || hardware.ram.usage > 90 || software.registryCorruption > 60) ? 'duration-[1500ms]' : 'duration-200';

  return (
    <div className={`w-full h-screen bg-slate-950 overflow-hidden flex flex-col font-sans transition-all ease-linear ${systemLagLevel}`}>
      {view === 'desktop' ? (
        <Desktop 
           hardware={hardware}
           software={software}
           osState={osState}
           bootMode={bootMode}
           onOpenWorkshop={() => setView('workshop')}
           onInfect={handleInfect}
           onCleanVirus={handleCleanVirus}
           onSetOsState={setOsState}
           onSetBootMode={setBootMode}
           onDeleteFile={handleDeleteFile}
           onManualTrigger={handleManualTrigger}
           onUpdatePreferences={handleUpdatePreferences}
           onRestoreSystem={handleRestoreSystem}
           onUpdateClipboard={handleUpdateClipboard}
           onLoginUser={handleLoginUser}
           onMountUsb={handleMountUsb}
           onSwitchDesktop={handleSwitchDesktop}
           onSystemUpdate={handleSystemUpdate}
        />
      ) : (
        <div className="flex-1 flex flex-col md:flex-row h-full relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
           {/* Realistic Wood Background */}
           <div className="absolute inset-0 z-0 bg-[#5d4037]" style={{ 
               backgroundImage: `
                   repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 8px),
                   linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))
               `,
               backgroundBlendMode: 'overlay'
           }}></div>
           
           {/* Workbench Lighting */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-white/10 blur-[100px] rounded-full z-0 pointer-events-none"></div>

           <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative p-8 perspective-container z-10">
              {/* PC VIEW AREA */}
              <PcView 
                 onSelectComponent={setSelectedComponent}
                 selectedComponent={selectedComponent}
                 hardware={hardware}
              />
           </div>

           {/* Workshop Controls Sidebar */}
           <div className="w-full md:w-96 h-[300px] md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-slate-700 shadow-2xl z-20 relative">
              <WorkshopPanel 
                 componentId={selectedComponent} 
                 hardware={hardware}
                 onRepair={handleRepair}
                 onBackToDesktop={() => setView('desktop')}
              />
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
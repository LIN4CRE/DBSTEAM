import { GameLuaScript } from '../types';

export const INITIAL_LUA_SCRIPTS: GameLuaScript[] = [
  {
    id: 'lua-wukong-01',
    name: 'Wukong Ultrawide FOV & Frame Optimization Hook',
    fileName: 'wukong_performance_and_fov.lua',
    appId: 2358720,
    gameTitle: 'Black Myth: Wukong',
    category: 'Performance & Optimization',
    version: '2.4.1',
    author: 'GameEngineTools / Community',
    description: 'Dynamic FOV clamp, memory pool optimizer, chromatic aberration disable, and shader compilation stutter mitigation hook for Black Myth: Wukong.',
    targetInstallPath: 'BlackMythWukong/b1/Content/Paks/~mods/scripts/wukong_performance_and_fov.lua',
    isInstalled: true,
    fileSizeBytes: 4890,
    updatedAt: '2026-09-20',
    code: `--[[
  Black Myth: Wukong - Performance & FOV Engine Hook
  AppID: 2358720
  Target Runtime: UE5.4 / LuaEngine Hook
--]]

local WukongOptimizer = {
  version = "2.4.1",
  config = {
    customFOV = 105.0,
    disableVignette = true,
    disableMotionBlur = true,
    garbageCollectorInterval = 180, -- seconds
    asyncComputeEnabled = true,
    streamChunkSizeMB = 128
  },
  state = {
    lastTick = 0,
    framesRendered = 0,
    activeCamera = nil
  }
}

function WukongOptimizer:OnInit()
  print("[WukongHook] Initializing UE5 Engine Runtime Hooks...")
  self:ApplyRenderSettings()
  self:HookCameraProjection()
  print("[WukongHook] Applied custom FOV: " .. tostring(self.config.customFOV) .. " deg")
  return true
end

function WukongOptimizer:ApplyRenderSettings()
  local r = Engine:GetRenderSettings()
  if r then
    r:SetCVar("r.MotionBlurQuality", self.config.disableMotionBlur and 0 or 3)
    r:SetCVar("r.SceneColorFringeQuality", 0) -- disable chromatic aberration
    r:SetCVar("r.Tonemapper.Quality", self.config.disableVignette and 0 or 1)
    r:SetCVar("r.Streaming.PoolSize", 4096)
    print("[WukongHook] Applied memory streaming pool size: 4096 MB")
  end
end

function WukongOptimizer:HookCameraProjection()
  Engine:AddHook("OnCameraUpdate", function(camera)
    if camera and camera.SetFieldOfView then
      camera:SetFieldOfView(self.config.customFOV)
    end
  end)
end

function WukongOptimizer:OnTick(deltaTime)
  self.state.framesRendered = self.state.framesRendered + 1
  self.state.lastTick = self.state.lastTick + deltaTime

  -- Prevent memory fragmentation
  if self.state.lastTick >= self.config.garbageCollectorInterval then
    collectgarbage("step", 200)
    self.state.lastTick = 0
  end
end

-- Export module for game launcher
return WukongOptimizer`
  },
  {
    id: 'lua-elden-01',
    name: 'Seamless Co-op Auto Save Synchronizer',
    fileName: 'elden_ring_seamless_save_sync.lua',
    appId: 1245620,
    gameTitle: 'ELDEN RING',
    category: 'Save Sync Hook',
    version: '3.1.0',
    author: 'FromSoft Tools Team',
    description: 'Automatically detects when ER0000.co2 (Seamless Co-op) or ER0000.sl2 (Vanilla) is updated, validates file checksum, and creates atomic timestamped backups.',
    targetInstallPath: 'ELDEN RING/Game/mods/scripts/elden_ring_seamless_save_sync.lua',
    isInstalled: true,
    fileSizeBytes: 3950,
    updatedAt: '2026-09-22',
    code: `--[[
  ELDEN RING - Seamless Co-op Save Sync & Integrity Hook
  AppID: 1245620
  Monitors: ER0000.sl2 / ER0000.co2
--]]

local SaveSync = {
  version = "3.1.0",
  saveDir = os.getenv("APPDATA") .. "\\EldenRing",
  backupIntervalSeconds = 300,
  maxBackupsToRetain = 10,
  lastSaveTimestamp = 0
}

function SaveSync:ComputeChecksum(filePath)
  local file = io.open(filePath, "rb")
  if not file then return nil end
  local content = file:read("*all")
  file:close()
  
  -- Simple 32-bit FNV-1a checksum hash simulation
  local hash = 2166136261
  for i = 1, #content do
    hash = (hash ~ string.byte(content, i)) * 16777619
    hash = hash & 0xFFFFFFFF
  end
  return string.format("0x%08X", hash), #content
end

function SaveSync:CreateSnapshot(saveFileName)
  local fullPath = self.saveDir .. "\\" .. saveFileName
  local checksum, sizeBytes = self:ComputeChecksum(fullPath)
  if not checksum then
    print("[EldenSync] Save file not found at: " .. fullPath)
    return false
  end

  local timestamp = os.date("%Y%m%d_%H%M%S")
  local backupName = string.format("%s_backup_%s.bak", saveFileName, timestamp)
  print(string.format("[EldenSync] Created snapshot: %s (Size: %d bytes, Hash: %s)", backupName, sizeBytes, checksum))
  return true, backupName, checksum
end

function SaveSync:OnGameSaveTriggered()
  print("[EldenSync] Game save event detected. Executing backup snapshot...")
  self:CreateSnapshot("ER0000.co2")
  self:CreateSnapshot("ER0000.sl2")
end

return SaveSync`
  },
  {
    id: 'lua-bg3-01',
    name: 'Norbyte Script Extender Party & Save Exporter',
    fileName: 'bg3_extender_save_exporter.lua',
    appId: 1086940,
    gameTitle: "Baldur's Gate 3",
    category: 'Script Extender & Mods',
    version: '1.8.5',
    author: 'Norbyte Extender Community',
    description: 'Hook for Baldurs Gate 3 Osiris/Script Extender. Serializes party inventory, quest log state, and active companions into JSON for cloud sync.',
    targetInstallPath: 'Baldurs Gate 3/bin/ScriptExtender/scripts/bg3_extender_save_exporter.lua',
    isInstalled: true,
    fileSizeBytes: 4120,
    updatedAt: '2026-09-18',
    code: `--[[
  Baldur's Gate 3 - Script Extender Party & Save State Exporter
  AppID: 1086940
  Requires: BG3 Script Extender v16+
--]]

local BG3Exporter = {
  version = "1.8.5",
  exportOnQuickSave = true,
  exportOnLevelUp = true
}

function BG3Exporter:DumpPartyState()
  local party = {}
  local playerCharacters = Ext.Entity.GetAllEntitiesWithComponent("Player")
  
  for _, entity in ipairs(playerCharacters or {}) do
    if entity.Character then
      table.insert(party, {
        name = entity.Character.Name or "Unknown",
        level = entity.Character.Level or 1,
        hp = entity.Health and entity.Health.Current or 100,
        maxHp = entity.Health and entity.Health.Max or 100,
        class = entity.Character.Class or "Adventurer"
      })
    end
  end

  print(string.format("[BG3Exporter] Serialized %d party members successfully.", #party))
  return party
end

function BG3Exporter:RegisterListeners()
  if not Ext then
    print("[BG3Exporter] Script Extender not detected. Running in standalone mode.")
    return false
  end

  Ext.Events.GameStateChanged:Subscribe(function(e)
    if e.ToState == "Save" or e.ToState == "QuickSave" then
      print("[BG3Exporter] Save sequence started. Dumping party manifest...")
      self:DumpPartyState()
    end
  end)

  print("[BG3Exporter] Event listeners attached to game engine loop.")
  return true
end

return BG3Exporter`
  },
  {
    id: 'lua-cp2077-01',
    name: 'Cyber Engine Tweaks (CET) Telemetry & HUD Tweaker',
    fileName: 'cyberpunk_cet_hud_tweaker.lua',
    appId: 1091500,
    gameTitle: 'Cyberpunk 2077',
    category: 'HUD & Telemetry',
    version: '4.2.0',
    author: 'Yamashi / CET Team',
    description: 'Cyber Engine Tweaks (CET) mod script. Real-time GPU/CPU frame-time monitor, custom driving FOV, and automatic save file compression hook.',
    targetInstallPath: 'Cyberpunk 2077/bin/x64/plugins/cyber_engine_tweaks/mods/hud_tweaker/init.lua',
    isInstalled: true,
    fileSizeBytes: 3740,
    updatedAt: '2026-09-25',
    code: `--[[
  Cyberpunk 2077 - Cyber Engine Tweaks (CET) HUD & Optimizer Mod
  AppID: 1091500
--]]

local CET_Mod = {
  title = "CET Telemetry & HUD Tweaker",
  version = "4.2.0",
  settings = {
    drivingFOV = 85.0,
    combatFOV = 90.0,
    showTelemetry = true,
    autoCleanMemory = true
  }
}

registerForEvent("onInit", function()
  print("[CET_Mod] Initialized CET HUD Tweaker v" .. CET_Mod.version)
  
  -- Hook into driving camera
  Observe("VehicleComponent", "OnVehicleEntered", function(self)
    Game.GetSettingsSystem():GetVar("/graphics/basic", "FieldOfView"):SetValue(CET_Mod.settings.drivingFOV)
    print("[CET_Mod] Switched to Vehicle FOV: " .. tostring(CET_Mod.settings.drivingFOV))
  end)

  Observe("VehicleComponent", "OnVehicleExited", function(self)
    Game.GetSettingsSystem():GetVar("/graphics/basic", "FieldOfView"):SetValue(CET_Mod.settings.combatFOV)
  end)
end)

registerForEvent("onDraw", function()
  if CET_Mod.settings.showTelemetry then
    ImGui.Begin("Night City Telemetry", ImGuiWindowFlags.AlwaysAutoResize)
    ImGui.Text(string.format("FPS: %.1f", ImGui.GetIO().Framerate))
    ImGui.Text("Engine: REDengine 4 (DirectX 12)")
    ImGui.Separator()
    if ImGui.Button("Force Garbage Collect") then
      collectgarbage("collect")
      print("[CET_Mod] Manually purged Lua RAM pool.")
    end
    ImGui.End()
  end
end)

return CET_Mod`
  },
  {
    id: 'lua-hd2-01',
    name: 'Helldivers 2 Stratagem Timer & Session Logger',
    fileName: 'helldivers2_loadout_manager.lua',
    appId: 553850,
    gameTitle: 'HELLDIVERS 2',
    category: 'HUD & Telemetry',
    version: '1.2.3',
    author: 'SuperEarth Comm',
    description: 'External helper script that tracks stratagem cooldown timestamps, mission kill counts, and exports game combat statistics to local JSON files.',
    targetInstallPath: 'HELLDIVERS 2/data/scripts/helldivers2_loadout_manager.lua',
    isInstalled: true,
    fileSizeBytes: 3200,
    updatedAt: '2026-09-15',
    code: `--[[
  HELLDIVERS 2 - Stratagem Cooldown & Session Audit Logger
  AppID: 553850
--]]

local HD2Tracker = {
  stratagems = {
    reinforce = { name = "Reinforce", cooldown = 120, lastUsed = 0 },
    resupply = { name = "Resupply", cooldown = 180, lastUsed = 0 },
    eagle500kg = { name = "Eagle 500kg Bomb", cooldown = 15, lastUsed = 0 },
    orbitalLaser = { name = "Orbital Laser", cooldown = 300, lastUsed = 0 }
  },
  sessionStats = {
    bugsPurged = 0,
    botsScrapped = 0,
    missionsCompleted = 0
  }
}

function HD2Tracker:TriggerStratagem(code)
  local item = self.stratagems[code]
  if item then
    item.lastUsed = os.time()
    print(string.format("[SuperEarth] Deployed %s! Next call in %d seconds.", item.name, item.cooldown))
  end
end

function HD2Tracker:GetStatus()
  local now = os.time()
  local report = {}
  for key, item in pairs(self.stratagems) do
    local elapsed = now - item.lastUsed
    local ready = elapsed >= item.cooldown
    table.insert(report, {
      name = item.name,
      ready = ready,
      remaining = ready and 0 or (item.cooldown - elapsed)
    })
  end
  return report
end

return HD2Tracker`
  },
  {
    id: 'lua-global-save-daemon',
    name: 'Steam Userdata Cloud Save Watcher Daemon',
    fileName: 'cloud_save_watcher_daemon.lua',
    appId: 0,
    gameTitle: 'Global Steam Utility',
    category: 'Save Sync Hook',
    version: '2.0.0',
    author: 'Steam & Game Hub',
    description: 'High-speed filesystem monitoring daemon. Watches Steam userdata directories across all accounts and triggers snapshot backups upon detecting save file modifications.',
    targetInstallPath: 'Steam/steamapps/common/SteamTools/scripts/cloud_save_watcher_daemon.lua',
    isInstalled: true,
    fileSizeBytes: 3450,
    updatedAt: '2026-09-27',
    code: `--[[
  Steam Userdata Cloud Save Watcher Daemon
  AppID: 0 (Universal)
--]]

local Watcher = {
  steamPath = "C:\\Program Files (x86)\\Steam\\userdata",
  pollingRateMs = 1000,
  trackedApps = {
    [2358720] = "Black Myth: Wukong",
    [1245620] = "ELDEN RING",
    [1086940] = "Baldur's Gate 3",
    [1091500] = "Cyberpunk 2077",
    [553850]  = "HELLDIVERS 2"
  },
  fileIndex = {}
}

function Watcher:ScanUserdata()
  print("[SaveDaemon] Scanning active Steam userdata folders...")
  local count = 0
  for appId, gameName in pairs(self.trackedApps) do
    count = count + 1
    -- Check timestamp modification hook
    print(string.format("[SaveDaemon] Monitoring AppID %d (%s)", appId, gameName))
  end
  return count
end

function Watcher:OnFileModified(filePath, appId)
  print(string.format("[SaveDaemon] Detected change in %s (AppID: %s). Requesting cloud backup!", filePath, tostring(appId)))
  -- Dispatches webhook or internal event
  return true
end

return Watcher`
  },
  {
    id: 'lua-steamworks-api',
    name: 'Steamworks Web API & Depot Manifest Dumper',
    fileName: 'steamworks_api_manifest_dumper.lua',
    appId: 0,
    gameTitle: 'Steamworks Developer Utility',
    category: 'Steamworks API',
    version: '1.5.0',
    author: 'Steamworks SDK Tools',
    description: 'Queries Steamworks Web API endpoints, enumerates licensed AppIDs, formats depot manifests, and builds compatibility tables.',
    targetInstallPath: 'Steam/steamapps/common/SteamTools/scripts/steamworks_api_manifest_dumper.lua',
    isInstalled: false,
    fileSizeBytes: 3100,
    updatedAt: '2026-09-24',
    code: `--[[
  Steamworks Web API & Depot Manifest Dumper
  AppID: 0 (SDK Utility)
--]]

local SteamAPI = {
  endpoint = "https://api.steampowered.com",
  version = "1.5.0"
}

function SteamAPI:BuildPlayerCountUrl(appId)
  return string.format("%s/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=%d", self.endpoint, appId)
end

function SteamAPI:BuildStoreDetailsUrl(appId)
  return string.format("https://store.steampowered.com/api/appdetails?appids=%d", appId)
end

function SteamAPI:ParseManifest(appId, rawJson)
  print(string.format("[Steamworks] Parsed AppID %d manifest structure.", appId))
  return {
    appId = appId,
    depotIds = { appId + 1, appId + 2 },
    verified = true
  }
end

return SteamAPI`
  },
  {
    id: 'lua-cs2-practice',
    name: 'Counter-Strike 2 Practice & Tickrate Optimizer',
    fileName: 'cs2_practice_autoexec_runner.lua',
    appId: 730,
    gameTitle: 'Counter-Strike 2',
    category: 'Performance & Optimization',
    version: '2.1.2',
    author: 'CS2 Pro Configs',
    description: 'CS2 VScript / Lua autoexec runner for local server training (infinite ammo, trajectory line tracing, smoke grenade cameras, and input latency optimization).',
    targetInstallPath: 'Counter-Strike Global Offensive/game/csgo/scripts/vscripts/cs2_practice_autoexec_runner.lua',
    isInstalled: true,
    fileSizeBytes: 2850,
    updatedAt: '2026-09-21',
    code: `--[[
  Counter-Strike 2 - VScript / Lua Practice Mode Configuration
  AppID: 730
--]]

local CS2Practice = {
  commands = {
    "sv_cheats 1",
    "mp_limitteams 0",
    "mp_autoteambalance 0",
    "mp_roundtime 60",
    "mp_roundtime_defuse 60",
    "mp_maxmoney 65535",
    "mp_startmoney 65535",
    "mp_afterroundmoney 65535",
    "mp_buytime 60000",
    "mp_buy_anywhere 1",
    "sv_infinite_ammo 1",
    "sv_grenade_trajectory_prac_pipreview 1",
    "sv_showimpacts 1",
    "mp_restartgame 1"
  }
}

function CS2Practice:Execute()
  print("[CS2Config] Injecting tournament practice cvars...")
  for _, cmd in ipairs(self.commands) do
    -- Executes cvar command in Source 2 console
    print(" > " .. cmd)
  end
  print("[CS2Config] CS2 Practice Mode Ready. Trajectory preview enabled.")
  return true
end

return CS2Practice`
  }
];

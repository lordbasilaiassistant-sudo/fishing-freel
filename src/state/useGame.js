import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STARTER_OWNED, STARTER_LOADOUT, computeTackle, itemById } from '../tackle/catalog.js'
import { QUESTS } from '../quests/quests.js'

// The fishing loop phases the rest of the game reads from.
export const PHASES = {
  IDLE: 'idle', // standing, rod in hand
  AIMING: 'aiming', // holding to charge cast power
  CASTING: 'casting', // lure in flight
  WAITING: 'waiting', // lure in water, waiting for a bite
  BITE: 'bite', // fish on — set the hook!
  REELING: 'reeling', // tension minigame
  LANDED: 'landed', // catch card shown
}

export const MAX_LEVEL = 20
export const xpToNext = (level) => Math.round(70 * Math.pow(1.32, level - 1))

export const useGame = create(
  persist(
    (set, get) => ({
      // ---- progression (persisted) ----
      level: 1,
      xp: 0,
      money: 0, // in-game currency (sell catches, quest rewards -> buy tackle)
      caught: [], // recent catch log
      owned: [...STARTER_OWNED], // gear item ids the player owns
      loadout: { ...STARTER_LOADOUT }, // equipped item per slot
      consumables: { bait_worm: 24, hook_aberdeen10: 25 }, // itemId -> remaining qty
      currentArea: 'stillwater',
      unlockedAreas: ['stillwater'],
      caughtSpecies: {}, // speciesId -> count (collection + quests)
      questIndex: 0,
      questProgress: {}, // `${questId}:${objIdx}` -> count
      completedQuests: [],
      settings: { sensitivity: 1.0, fov: 90, invertLookY: false, reelMode: 'hold', scrollWheelReel: false, castMeterStyle: 'ramp-hold', sound: true },

      // ---- live session state (not persisted) ----
      phase: PHASES.IDLE,
      castPower: 0, // 0..1 while aiming
      tension: 0, // 0..1 line tension during the fight (1 = snap)
      fishDistance: 1, // 1 = hooked far out (line out), 0 = landed
      fishStamina: 1, // 1 = fresh & fighting, 0 = exhausted
      rodLoad: 0, // 0..1 how loaded/bent the rod is from pumping (Right-click)
      reeling: false, // is the player actively reeling (for reel-spin anim)
      currentFish: null, // the fish currently hooked
      lastCatch: null, // last landed fish, for the catch card
      message: null, // transient banner (e.g. "Line snapped!")
      locked: false, // pointer-lock engaged (mouse-look active)
      started: false, // has the player engaged pointer-lock at least once this session

      // Derived from the equipped line + reel (recomputed on equip / rehydrate).
      tackle: computeTackle(STARTER_LOADOUT),
      bench: null, // null | 'box' | 'shop' — tackle box / shop overlay

      patch: (partial) => set(partial),
      setLocked: (locked) => set((s) => ({ locked, started: s.started || locked })),

      xpForNext: () => xpToNext(get().level),

      addXp: (amount) =>
        set((s) => {
          let xp = s.xp + amount
          let level = s.level
          while (level < MAX_LEVEL && xp >= xpToNext(level)) {
            xp -= xpToNext(level)
            level += 1
          }
          return { xp, level }
        }),

      addMoney: (amount) => set((s) => ({ money: Math.round((s.money + amount) * 100) / 100 })),

      setPhase: (phase) => set({ phase }),
      setCastPower: (castPower) => set({ castPower }),

      logCatch: (fish) =>
        set((s) => ({ caught: [{ ...fish, t: Date.now() }, ...s.caught].slice(0, 50) })),

      setBench: (mode) => set({ bench: mode }),
      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),
      resetSettings: () =>
        set({ settings: { sensitivity: 1.0, fov: 90, invertLookY: false, reelMode: 'hold', scrollWheelReel: false, castMeterStyle: 'ramp-hold', sound: true } }),

      buy: (item) =>
        set((s) => {
          if (s.money < item.price || s.level < item.unlockLevel) return s
          const owned = s.owned.includes(item.id) ? s.owned : [...s.owned, item.id]
          const consumables = item.consumable
            ? { ...s.consumables, [item.id]: (s.consumables[item.id] || 0) + item.qty }
            : s.consumables
          return { money: Math.round((s.money - item.price) * 100) / 100, owned, consumables }
        }),
      equip: (slot, id) =>
        set((s) => {
          if (!s.owned.includes(id)) return s
          const loadout = { ...s.loadout, [slot]: id }
          return { loadout, tackle: computeTackle(loadout) }
        }),
      // spend one unit of a consumable (live bait, prepared baits, hooks); no-op
      // for reusable gear (which has no consumables entry).
      useConsumable: (id) =>
        set((s) => {
          if (s.consumables[id] === undefined) return s
          const it = itemById(id)
          if (it && it.price === 0) return s // free starter bait/hooks never run out
          return { consumables: { ...s.consumables, [id]: Math.max(0, s.consumables[id] - 1) } }
        }),
      travelTo: (areaId) => set((s) => (s.unlockedAreas.includes(areaId) ? { currentArea: areaId } : s)),
      unlockArea: (areaId) =>
        set((s) => (s.unlockedAreas.includes(areaId) ? s : { unlockedAreas: [...s.unlockedAreas, areaId] })),
      recordCatch: (fish) =>
        set((s) => ({ caughtSpecies: { ...s.caughtSpecies, [fish.id]: (s.caughtSpecies[fish.id] || 0) + 1 } })),

      // Ticks the active quest's objectives; grants rewards once on completion, then advances.
      advanceQuest: (eventType, payload = {}) => {
        const s = get()
        const q = QUESTS[s.questIndex]
        if (!q || s.completedQuests.includes(q.id)) return
        const progress = { ...s.questProgress }
        let changed = false
        q.objectives.forEach((o, i) => {
          const key = `${q.id}:${i}`
          const cur = progress[key] || 0
          if (cur >= o.count) return
          const hit =
            o.type === eventType &&
            (o.target === undefined ||
              o.target === 'any' ||
              o.target === payload.target ||
              (o.minWeightKg ? payload.target === o.target && payload.weight >= o.minWeightKg : false) ||
              (typeof o.target === 'number' ? payload.target >= o.target : false))
          if (hit) {
            progress[key] = cur + 1
            changed = true
          }
        })
        if (!changed) {
          set({ questProgress: progress })
          return
        }
        const done = q.objectives.every((o, i) => (progress[`${q.id}:${i}`] || 0) >= o.count)
        if (!done) {
          set({ questProgress: progress })
          return
        }
        set({
          questProgress: progress,
          completedQuests: [...s.completedQuests, q.id],
          questIndex: Math.min(s.questIndex + 1, QUESTS.length),
        })
        get().addXp(q.rewards.xp)
        get().addMoney(q.rewards.money)
        if (q.rewards.unlock === 'area_cedar_lake') get().unlockArea('cedar_lake')
        if (q.rewards.unlock === 'area_rapids') get().unlockArea('rapids')
        get().patch({ message: `Quest complete: ${q.title}  +${q.rewards.xp}xp +$${q.rewards.money}` })
      },

      resetSave: () => set({ level: 1, xp: 0, caught: [], phase: PHASES.IDLE }),
    }),
    {
      name: 'fishingfreel-save',
      version: 2,
      partialize: (s) => ({
        level: s.level,
        xp: s.xp,
        money: s.money,
        caught: s.caught,
        owned: s.owned,
        loadout: s.loadout,
        consumables: s.consumables,
        unlockedAreas: s.unlockedAreas,
        currentArea: s.currentArea,
        caughtSpecies: s.caughtSpecies,
        questIndex: s.questIndex,
        questProgress: s.questProgress,
        completedQuests: s.completedQuests,
        settings: s.settings,
      }),
      migrate: (persisted, version) => {
        // v1 saves predate gear/quests — keep level/xp/money, fresh-start the rest.
        if (!persisted || version < 2) {
          return {
            ...(persisted || {}),
            owned: [...STARTER_OWNED],
            loadout: { ...STARTER_LOADOUT },
            consumables: { bait_worm: 24, hook_aberdeen10: 25 },
            unlockedAreas: ['stillwater'],
            currentArea: 'stillwater',
            caughtSpecies: {},
            questIndex: 0,
            questProgress: {},
            completedQuests: [],
          }
        }
        return persisted
      },
      // tackle is derived, not persisted — recompute from the equipped loadout.
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.tackle = computeTackle(state.loadout || STARTER_LOADOUT)
        // keep free starter bait/hooks topped up so a returning player is never stranded
        state.consumables = {
          ...state.consumables,
          bait_worm: Math.max(state.consumables?.bait_worm || 0, 24),
          hook_aberdeen10: Math.max(state.consumables?.hook_aberdeen10 || 0, 25),
        }
      },
    },
  ),
)

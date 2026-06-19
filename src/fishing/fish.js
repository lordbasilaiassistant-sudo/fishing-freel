// Fish roster — researched bait/lure preferences per species, mapped to the
// three areas (stillwater pond / cedar_lake / rapids). weightKg=[min,max];
// strength (0..1) drives the fight; spawnWeight gates rarity; baits[]/lures[]
// are gear tokens that decide what catches what.
export const GEAR_TOKENS = {
  baits: ['worm', 'nightcrawler', 'cricket', 'grasshopper', 'wax_worm', 'meal_worm', 'minnow', 'shiner', 'leech', 'cut_bait', 'stinkbait', 'chicken_liver', 'corn', 'boilie', 'dough_ball', 'salmon_egg', 'live_sucker'],
  lures: ['jig_tiny', 'jig', 'spinner_small', 'inline_spinner', 'spinnerbait', 'crankbait', 'lipless_crankbait', 'jerkbait', 'suspending_jerkbait', 'swimbait', 'spoon', 'topwater_frog', 'topwater', 'tube', 'grub', 'drop_shot', 'texas_rig', 'carolina_rig', 'wacky_worm', 'fly_dry', 'fly_wet', 'fly_streamer', 'bucktail', 'powerbait'],
}

export const SPECIES = [
  { id: 'bluegill', name: 'Bluegill', area: 'stillwater', weightKg: [0.05, 0.45], strength: 0.2, difficulty: 1, xp: 10, baseValue: 2, spawnWeight: 30, baits: ['worm', 'cricket', 'grasshopper', 'wax_worm', 'meal_worm'], lures: ['jig_tiny', 'spinner_small', 'fly_wet'], depth: [0.3, 3], timeOfDay: 'all' },
  { id: 'pumpkinseed', name: 'Pumpkinseed', area: 'stillwater', weightKg: [0.05, 0.4], strength: 0.2, difficulty: 1, xp: 10, baseValue: 2, spawnWeight: 24, baits: ['worm', 'cricket', 'wax_worm', 'meal_worm'], lures: ['jig_tiny', 'spinner_small', 'fly_wet'], depth: [0.3, 2], timeOfDay: 'all' },
  { id: 'brown_bullhead', name: 'Brown Bullhead', area: 'stillwater', weightKg: [0.2, 1.4], strength: 0.4, difficulty: 2, xp: 18, baseValue: 3, spawnWeight: 18, baits: ['worm', 'nightcrawler', 'cut_bait', 'chicken_liver', 'stinkbait'], lures: [], depth: [1, 4], timeOfDay: 'dusk_night' },
  { id: 'largemouth_pond', name: 'Pond Largemouth Bass', area: 'stillwater', weightKg: [0.4, 3.0], strength: 0.6, difficulty: 2, xp: 28, baseValue: 6, spawnWeight: 14, baits: ['nightcrawler', 'minnow', 'shiner'], lures: ['spinnerbait', 'crankbait', 'jerkbait', 'topwater_frog', 'topwater', 'jig', 'texas_rig', 'wacky_worm'], depth: [0.5, 4], timeOfDay: 'dawn_dusk' },
  { id: 'common_carp', name: 'Common Carp', area: 'stillwater', weightKg: [1.5, 15.0], strength: 0.8, difficulty: 3, xp: 46, baseValue: 4, spawnWeight: 8, baits: ['corn', 'boilie', 'dough_ball', 'nightcrawler', 'worm'], lures: [], depth: [1, 4], timeOfDay: 'dawn_dusk' },
  { id: 'yellow_perch', name: 'Yellow Perch', area: 'cedar_lake', weightKg: [0.1, 0.6], strength: 0.4, difficulty: 2, xp: 14, baseValue: 3, spawnWeight: 26, baits: ['minnow', 'shiner', 'worm', 'leech', 'wax_worm'], lures: ['jig_tiny', 'jig', 'grub', 'tube', 'spinner_small'], depth: [3, 9], timeOfDay: 'day' },
  { id: 'crappie', name: 'Crappie', area: 'cedar_lake', weightKg: [0.1, 1.0], strength: 0.4, difficulty: 2, xp: 16, baseValue: 3, spawnWeight: 22, baits: ['minnow', 'shiner'], lures: ['jig', 'jig_tiny', 'grub', 'tube'], depth: [1, 9], timeOfDay: 'dawn_dusk' },
  { id: 'largemouth_bass', name: 'Largemouth Bass', area: 'cedar_lake', weightKg: [0.5, 4.5], strength: 0.6, difficulty: 2, xp: 32, baseValue: 6, spawnWeight: 16, baits: ['nightcrawler', 'minnow', 'shiner'], lures: ['spinnerbait', 'crankbait', 'lipless_crankbait', 'jerkbait', 'suspending_jerkbait', 'swimbait', 'topwater_frog', 'topwater', 'jig', 'texas_rig', 'carolina_rig', 'wacky_worm', 'drop_shot'], depth: [1, 5], timeOfDay: 'dawn_dusk' },
  { id: 'rainbow_trout', name: 'Rainbow Trout', area: 'cedar_lake', weightKg: [0.3, 3.5], strength: 0.6, difficulty: 2, xp: 30, baseValue: 8, spawnWeight: 14, baits: ['worm', 'salmon_egg', 'wax_worm'], lures: ['powerbait', 'inline_spinner', 'spinner_small', 'spoon', 'fly_dry', 'fly_wet', 'fly_streamer'], depth: [1, 6], timeOfDay: 'dawn_dusk' },
  { id: 'walleye', name: 'Walleye', area: 'cedar_lake', weightKg: [0.5, 4.0], strength: 0.6, difficulty: 3, xp: 40, baseValue: 6, spawnWeight: 10, baits: ['minnow', 'nightcrawler', 'leech'], lures: ['jig', 'crankbait', 'jerkbait', 'lipless_crankbait'], depth: [3, 12], timeOfDay: 'night' },
  { id: 'channel_catfish', name: 'Channel Catfish', area: 'cedar_lake', weightKg: [0.5, 7.0], strength: 0.8, difficulty: 3, xp: 44, baseValue: 5, spawnWeight: 9, baits: ['cut_bait', 'stinkbait', 'chicken_liver', 'nightcrawler', 'worm'], lures: [], depth: [2, 8], timeOfDay: 'night' },
  { id: 'northern_pike', name: 'Northern Pike', area: 'cedar_lake', weightKg: [1.0, 9.0], strength: 0.8, difficulty: 3, xp: 48, baseValue: 8, spawnWeight: 8, baits: ['live_sucker', 'minnow'], lures: ['spoon', 'spinnerbait', 'inline_spinner', 'crankbait', 'jerkbait', 'bucktail'], depth: [1, 8], timeOfDay: 'day' },
  { id: 'brook_trout', name: 'Brook Trout', area: 'rapids', weightKg: [0.1, 1.5], strength: 0.4, difficulty: 2, xp: 22, baseValue: 8, spawnWeight: 22, baits: ['worm', 'wax_worm', 'cricket', 'grasshopper', 'salmon_egg', 'minnow'], lures: ['spinner_small', 'inline_spinner', 'fly_dry', 'fly_wet'], depth: [0.3, 2.5], timeOfDay: 'all' },
  { id: 'rainbow_trout_river', name: 'Rainbow Trout', area: 'rapids', weightKg: [0.3, 3.5], strength: 0.6, difficulty: 2, xp: 30, baseValue: 8, spawnWeight: 18, baits: ['worm', 'salmon_egg', 'wax_worm'], lures: ['powerbait', 'inline_spinner', 'spinner_small', 'spoon', 'fly_dry', 'fly_wet', 'fly_streamer'], depth: [1, 6], timeOfDay: 'dawn_dusk' },
  { id: 'smallmouth_bass', name: 'Smallmouth Bass', area: 'rapids', weightKg: [0.4, 3.0], strength: 1.0, difficulty: 3, xp: 38, baseValue: 7, spawnWeight: 14, baits: ['minnow', 'nightcrawler', 'leech'], lures: ['tube', 'grub', 'swimbait', 'jerkbait', 'spinnerbait', 'crankbait', 'jig'], depth: [1, 5], timeOfDay: 'dawn_dusk' },
  { id: 'walleye_river', name: 'Walleye', area: 'rapids', weightKg: [0.5, 4.0], strength: 0.6, difficulty: 3, xp: 40, baseValue: 6, spawnWeight: 9, baits: ['minnow', 'nightcrawler', 'leech'], lures: ['jig', 'crankbait', 'jerkbait', 'lipless_crankbait'], depth: [3, 12], timeOfDay: 'night' },
  { id: 'brown_trout', name: 'Brown Trout', area: 'rapids', weightKg: [0.4, 5.0], strength: 0.8, difficulty: 4, xp: 60, baseValue: 9, spawnWeight: 7, baits: ['worm', 'salmon_egg', 'minnow'], lures: ['spoon', 'jerkbait', 'inline_spinner', 'fly_dry', 'fly_wet', 'fly_streamer'], depth: [1, 4], timeOfDay: 'night' },
  { id: 'muskie', name: 'Muskellunge', area: 'rapids', weightKg: [2.5, 16.0], strength: 1.0, difficulty: 5, xp: 120, baseValue: 12, spawnWeight: 2, baits: ['live_sucker'], lures: ['bucktail', 'crankbait', 'jerkbait', 'spoon', 'swimbait', 'topwater'], depth: [1, 6], timeOfDay: 'dawn_dusk' },
]

export function speciesById(id) {
  return SPECIES.find((s) => s.id === id)
}
export function speciesInArea(area) {
  return SPECIES.filter((s) => s.area === area)
}
export function gearMatches(species, token) {
  return token ? species.baits.includes(token) || species.lures.includes(token) : false
}

export function rollFish(area = 'stillwater', level = 1, token = null) {
  let pool = speciesInArea(area)
  if (token) pool = pool.filter((s) => gearMatches(s, token))
  if (!pool.length) return null
  const cap = 2 + Math.floor(level / 3)
  const eligible = pool.filter((s) => s.difficulty <= cap)
  const list = eligible.length ? eligible : [pool.reduce((a, b) => (a.difficulty < b.difficulty ? a : b))]
  const total = list.reduce((n, s) => n + s.spawnWeight, 0)
  let r = Math.random() * total
  let s = list[0]
  for (const c of list) {
    r -= c.spawnWeight
    if (r <= 0) {
      s = c
      break
    }
  }
  const [minW, maxW] = s.weightKg
  const weight = Math.round((minW + Math.random() * (maxW - minW)) * 100) / 100
  const lengthCm = Math.round(18 + weight * 13 + Math.random() * 8)
  const ratio = (weight - minW) / Math.max(0.01, maxW - minW)
  return { id: s.id, name: s.name, weight, lengthCm, strength: s.strength, baseValue: s.baseValue, sizeRatio: ratio, xp: Math.round(s.xp * (0.8 + ratio * 0.6)) }
}

export function sellValue(fish, conditionMult = 1) {
  const q = fish.sizeRatio > 0.85 ? 2.0 : fish.sizeRatio > 0.55 ? 1.4 : 1.0
  return Math.round(fish.baseValue * Math.pow(fish.weight, 1.15) * q * conditionMult) || 1
}

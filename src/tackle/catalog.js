// Tackle catalog. 6 loadout slots; each item has realistic `specs` (tooltips)
// and normalized `derived` stats. computeTackle() flattens the equipped
// line + reel into the {name,lineStrength,drag,lineCapacity} object the fight
// already consumes — so the casting system needs no structural changes.
export const SLOTS = ['rod', 'reel', 'line', 'hook', 'bait', 'holder', 'glasses', 'hat']

export const CATALOG = {
  rods: [
    { id: 'rod_cane', slot: 'rod', name: 'Cane Pole', tier: 'starter', unlockLevel: 1, price: 0, specs: { power: 'ultralight' }, derived: { castDistance: 0.35, landingPower: 0.35 }, blurb: 'Free starter for panfish.' },
    { id: 'rod_ul_spin', slot: 'rod', name: 'Pond Hopper UL Spinning', tier: 'starter', unlockLevel: 2, price: 35, specs: { power: 'ultralight' }, derived: { castDistance: 0.5, landingPower: 0.4 }, blurb: 'Casts farther.' },
    { id: 'rod_light_spin', slot: 'rod', name: 'Brook Light Spinning', tier: 'bronze', unlockLevel: 4, price: 70, specs: { power: 'light' }, derived: { castDistance: 0.58, landingPower: 0.5 }, blurb: 'Trout/crappie backbone.' },
    { id: 'rod_med_spin', slot: 'rod', name: 'All-Round Medium Spinning', tier: 'bronze', unlockLevel: 6, price: 120, specs: { power: 'medium' }, derived: { castDistance: 0.66, landingPower: 0.62 }, blurb: 'Bass and walleye.' },
    { id: 'rod_mh_cast', slot: 'rod', name: 'Timber Medium-Heavy Baitcaster', tier: 'silver', unlockLevel: 9, price: 230, specs: { power: 'medium-heavy' }, derived: { castDistance: 0.74, landingPower: 0.78 }, blurb: 'Pike and big bass.' },
    { id: 'rod_heavy_cast', slot: 'rod', name: 'Lunker Heavy Baitcaster', tier: 'gold', unlockLevel: 13, price: 380, specs: { power: 'heavy' }, derived: { castDistance: 0.8, landingPower: 0.9 }, blurb: 'Catfish and carp.' },
    { id: 'rod_xh_musky', slot: 'rod', name: 'Esox Extra-Heavy Musky Rod', tier: 'platinum', unlockLevel: 17, price: 720, specs: { power: 'extra-heavy' }, derived: { castDistance: 0.85, landingPower: 1.0 }, blurb: 'Fish of 10,000 casts.' },
    { id: 'rod_legend', slot: 'rod', name: 'Grandmaster Signature Blank', tier: 'legendary', unlockLevel: 20, price: 1500, specs: { power: 'heavy' }, derived: { castDistance: 1.0, landingPower: 1.0 }, blurb: 'Does everything.' },
  ],
  reels: [
    { id: 'reel_1000', slot: 'reel', name: 'Creek 1000', tier: 'starter', unlockLevel: 1, price: 0, specs: { size: 1000, maxDragLb: 6 }, derived: { drag: 0.4, lineCapacity: 90 }, blurb: 'Free, smooth.' },
    { id: 'reel_2500', slot: 'reel', name: 'Drift 2500', tier: 'bronze', unlockLevel: 4, price: 75, specs: { size: 2500, maxDragLb: 11 }, derived: { drag: 0.5, lineCapacity: 120 }, blurb: 'More drag/line.' },
    { id: 'reel_3000', slot: 'reel', name: 'Current 3000', tier: 'silver', unlockLevel: 7, price: 140, specs: { size: 3000, maxDragLb: 15 }, derived: { drag: 0.6, lineCapacity: 160 }, blurb: 'Stronger drag.' },
    { id: 'reel_lp_cast', slot: 'reel', name: 'Torque Low-Profile Baitcaster', tier: 'silver', unlockLevel: 9, price: 200, specs: { size: 'LP-100', maxDragLb: 18 }, derived: { drag: 0.68, lineCapacity: 150 }, blurb: 'Baitcaster control.' },
    { id: 'reel_4000', slot: 'reel', name: 'Tide 4000', tier: 'gold', unlockLevel: 13, price: 300, specs: { size: 4000, maxDragLb: 22 }, derived: { drag: 0.78, lineCapacity: 230 }, blurb: 'Smooth drag for runs.' },
    { id: 'reel_6000', slot: 'reel', name: 'Surge 6000', tier: 'platinum', unlockLevel: 16, price: 600, specs: { size: 6000, maxDragLb: 30 }, derived: { drag: 0.88, lineCapacity: 320 }, blurb: 'Pike and cats.' },
    { id: 'reel_8000', slot: 'reel', name: 'Leviathan 8000 Musky', tier: 'legendary', unlockLevel: 19, price: 900, specs: { size: 8000, maxDragLb: 40 }, derived: { drag: 1.0, lineCapacity: 380 }, blurb: 'Apex predators.' },
  ],
  lines: [
    { id: 'line_mono4', slot: 'line', name: 'Clear Mono 4lb', tier: 'starter', unlockLevel: 1, price: 0, specs: { type: 'mono', lbTest: 4 }, derived: { lineStrength: 0.75, lineCapacity: 0 }, blurb: 'Free, forgiving.' },
    { id: 'line_mono8', slot: 'line', name: 'Clear Mono 8lb', tier: 'starter', unlockLevel: 3, price: 14, specs: { type: 'mono', lbTest: 8 }, derived: { lineStrength: 0.92, lineCapacity: 0 }, blurb: 'Stretchy default.' },
    { id: 'line_mono12', slot: 'line', name: 'All-Purpose Mono 12lb', tier: 'bronze', unlockLevel: 6, price: 20, specs: { type: 'mono', lbTest: 12 }, derived: { lineStrength: 1.05, lineCapacity: 0 }, blurb: 'Bass and walleye.' },
    { id: 'line_fluoro8', slot: 'line', name: 'Stealth Fluoro 8lb', tier: 'silver', unlockLevel: 8, price: 45, specs: { type: 'fluoro', lbTest: 8 }, derived: { lineStrength: 0.98, lineCapacity: 0, stealth: 1.1 }, blurb: 'Invisible — wary fish bite.' },
    { id: 'line_fluoro15', slot: 'line', name: 'Stealth Fluoro 15lb', tier: 'gold', unlockLevel: 12, price: 75, specs: { type: 'fluoro', lbTest: 15 }, derived: { lineStrength: 1.18, lineCapacity: 0, stealth: 1.1 }, blurb: 'Strong and invisible.' },
    { id: 'line_braid20', slot: 'line', name: 'PowerWeave Braid 20lb', tier: 'gold', unlockLevel: 13, price: 90, specs: { type: 'braid', lbTest: 20 }, derived: { lineStrength: 1.3, lineCapacity: 10 }, blurb: 'No stretch — for pike.' },
    { id: 'line_braid50', slot: 'line', name: 'PowerWeave Braid 50lb', tier: 'platinum', unlockLevel: 16, price: 130, specs: { type: 'braid', lbTest: 50 }, derived: { lineStrength: 1.55, lineCapacity: 10 }, blurb: 'Musky out of weeds.' },
    { id: 'line_braid80', slot: 'line', name: 'TitanBraid 80lb', tier: 'legendary', unlockLevel: 19, price: 190, specs: { type: 'braid', lbTest: 80 }, derived: { lineStrength: 1.8, lineCapacity: 20 }, blurb: 'Unbreakable.' },
  ],
  hooks: [
    { id: 'hook_aberdeen10', slot: 'hook', name: 'Aberdeen #10', tier: 'starter', unlockLevel: 1, price: 0, consumable: true, qty: 25, specs: { size: '#10' }, derived: { landingPower: 0.2 }, blurb: 'Free, small mouths.' },
    { id: 'hook_baitholder6', slot: 'hook', name: 'Baitholder #6', tier: 'starter', unlockLevel: 3, price: 7, consumable: true, qty: 25, specs: { size: '#6' }, derived: { landingPower: 0.3 }, blurb: 'Panfish to trout.' },
    { id: 'hook_octopus2', slot: 'hook', name: 'Octopus #2', tier: 'bronze', unlockLevel: 5, price: 9, consumable: true, qty: 25, specs: { size: '#2' }, derived: { landingPower: 0.45 }, blurb: 'Walleye and bass.' },
    { id: 'hook_ewg30', slot: 'hook', name: 'EWG Worm Hook 3/0', tier: 'silver', unlockLevel: 9, price: 12, consumable: true, qty: 20, specs: { size: '3/0', weedless: true }, derived: { landingPower: 0.6 }, blurb: 'Weedless plastics.' },
    { id: 'hook_circle40', slot: 'hook', name: 'Circle Hook 4/0', tier: 'gold', unlockLevel: 13, price: 18, consumable: true, qty: 20, specs: { size: '4/0', selfSetting: true }, derived: { landingPower: 0.8 }, blurb: 'Cats and carp.' },
    { id: 'hook_circle80', slot: 'hook', name: 'Heavy Circle 8/0', tier: 'platinum', unlockLevel: 17, price: 26, consumable: true, qty: 15, specs: { size: '8/0' }, derived: { landingPower: 1.0 }, blurb: 'Biggest fish.' },
  ],
  lures: [
    { id: 'lure_spinner_sm', slot: 'bait', kind: 'lure', token: 'spinner_small', name: 'Inline Spinner #1', tier: 'starter', unlockLevel: 2, price: 18, specs: { class: 'spinner' }, derived: { attract: 0.5 }, blurb: 'Trout/panfish flash.' },
    { id: 'lure_inline_lg', slot: 'bait', kind: 'lure', token: 'inline_spinner', name: 'Vibrax Spinner #3', tier: 'bronze', unlockLevel: 5, price: 30, specs: { class: 'spinner' }, derived: { attract: 0.6 }, blurb: 'Bass/pike/walleye.' },
    { id: 'lure_grub', slot: 'bait', kind: 'lure', token: 'grub', name: 'Curly-Tail Grub 2in', tier: 'bronze', unlockLevel: 5, price: 16, specs: { class: 'soft-plastic' }, derived: { attract: 0.5 }, blurb: 'Crappie/perch.' },
    { id: 'lure_jig', slot: 'bait', kind: 'lure', token: 'jig', name: 'Marabou Jig 1/8oz', tier: 'bronze', unlockLevel: 6, price: 14, specs: { class: 'jig' }, derived: { attract: 0.55 }, blurb: 'Walleye/crappie/panfish.' },
    { id: 'lure_crank_shallow', slot: 'bait', kind: 'lure', token: 'crankbait', name: 'Squarebill Crankbait', tier: 'bronze', unlockLevel: 7, price: 35, specs: { class: 'crankbait' }, derived: { attract: 0.62 }, blurb: 'Bass/smallmouth.' },
    { id: 'lure_texas_worm', slot: 'bait', kind: 'lure', token: 'texas_rig', name: 'Soft Plastic Worm (Texas)', tier: 'silver', unlockLevel: 8, price: 22, specs: { class: 'soft-plastic', weedless: true }, derived: { attract: 0.6 }, blurb: 'Weedless bass.' },
    { id: 'lure_spinnerbait', slot: 'bait', kind: 'lure', token: 'spinnerbait', name: 'Double-Willow Spinnerbait', tier: 'silver', unlockLevel: 9, price: 45, specs: { class: 'spinnerbait' }, derived: { attract: 0.68 }, blurb: 'Bass/pike cover.' },
    { id: 'lure_spoon', slot: 'bait', kind: 'lure', token: 'spoon', name: 'Dardevle Spoon', tier: 'silver', unlockLevel: 9, price: 28, specs: { class: 'spoon' }, derived: { attract: 0.66 }, blurb: 'Pike/trout spoon.' },
    { id: 'lure_powerbait', slot: 'bait', kind: 'lure', token: 'powerbait', name: 'PowerBait Dough', tier: 'bronze', unlockLevel: 5, price: 12, consumable: true, qty: 20, specs: { class: 'prepared' }, derived: { attract: 0.6 }, blurb: 'Stocked-trout magnet.' },
    { id: 'lure_topwater', slot: 'bait', kind: 'lure', token: 'topwater', name: 'Walk-the-Dog Spook', tier: 'gold', unlockLevel: 12, price: 55, specs: { class: 'topwater' }, derived: { attract: 0.7 }, blurb: 'Explosive strikes.' },
    { id: 'lure_fly_dry', slot: 'bait', kind: 'lure', token: 'fly_dry', name: 'Dry Fly Assortment', tier: 'silver', unlockLevel: 8, price: 30, consumable: true, qty: 15, specs: { class: 'fly' }, derived: { attract: 0.6 }, blurb: 'Rising trout.' },
    { id: 'lure_fly_streamer', slot: 'bait', kind: 'lure', token: 'fly_streamer', name: 'Streamer Flies', tier: 'gold', unlockLevel: 12, price: 34, consumable: true, qty: 12, specs: { class: 'fly' }, derived: { attract: 0.66 }, blurb: 'Big browns.' },
    { id: 'lure_tube', slot: 'bait', kind: 'lure', token: 'tube', name: 'Green Pumpkin Tube', tier: 'silver', unlockLevel: 9, price: 20, specs: { class: 'soft-plastic' }, derived: { attract: 0.62 }, blurb: 'Smallmouth current.' },
    { id: 'lure_swimbait', slot: 'bait', kind: 'lure', token: 'swimbait', name: 'Paddle-Tail Swimbait 5in', tier: 'platinum', unlockLevel: 15, price: 70, specs: { class: 'soft-plastic' }, derived: { attract: 0.75 }, blurb: 'Big-fish swim.' },
    { id: 'lure_bucktail', slot: 'bait', kind: 'lure', token: 'bucktail', name: 'Bucktail (Musky)', tier: 'platinum', unlockLevel: 17, price: 85, specs: { class: 'spinner' }, derived: { attract: 0.8 }, blurb: 'Musky go-to.' },
  ],
  baits: [
    { id: 'bait_worm', slot: 'bait', kind: 'bait', token: 'worm', name: 'Garden Worms', tier: 'starter', unlockLevel: 1, price: 0, consumable: true, qty: 24, specs: { category: 'worm' }, derived: { attract: 0.4 }, blurb: 'Free universal bait.' },
    { id: 'bait_cricket', slot: 'bait', kind: 'bait', token: 'cricket', name: 'Live Crickets', tier: 'starter', unlockLevel: 2, price: 6, consumable: true, qty: 30, specs: { category: 'insect' }, derived: { attract: 0.42 }, blurb: 'Panfish/trout.' },
    { id: 'bait_waxworm', slot: 'bait', kind: 'bait', token: 'wax_worm', name: 'Wax Worms', tier: 'starter', unlockLevel: 2, price: 5, consumable: true, qty: 30, specs: { category: 'grub' }, derived: { attract: 0.42 }, blurb: 'Deadly on panfish.' },
    { id: 'bait_nightcrawler', slot: 'bait', kind: 'bait', token: 'nightcrawler', name: 'Nightcrawlers', tier: 'bronze', unlockLevel: 3, price: 9, consumable: true, qty: 18, specs: { category: 'worm' }, derived: { attract: 0.5 }, blurb: 'Catches anything.' },
    { id: 'bait_minnow', slot: 'bait', kind: 'bait', token: 'minnow', name: 'Minnows', tier: 'bronze', unlockLevel: 5, price: 12, consumable: true, qty: 12, specs: { category: 'baitfish' }, derived: { attract: 0.55 }, blurb: 'Walleye/crappie/bass.' },
    { id: 'bait_shiner', slot: 'bait', kind: 'bait', token: 'shiner', name: 'Large Shiners', tier: 'silver', unlockLevel: 9, price: 22, consumable: true, qty: 8, specs: { category: 'baitfish' }, derived: { attract: 0.62 }, blurb: 'Big bass/pike.' },
    { id: 'bait_leech', slot: 'bait', kind: 'bait', token: 'leech', name: 'Live Leeches', tier: 'silver', unlockLevel: 8, price: 16, consumable: true, qty: 12, specs: { category: 'leech' }, derived: { attract: 0.58 }, blurb: 'Walleye/smallmouth.' },
    { id: 'bait_salmon_egg', slot: 'bait', kind: 'bait', token: 'salmon_egg', name: 'Salmon Eggs', tier: 'bronze', unlockLevel: 6, price: 10, consumable: true, qty: 20, specs: { category: 'eggs' }, derived: { attract: 0.55 }, blurb: 'Cold-water trout.' },
    { id: 'bait_cutbait', slot: 'bait', kind: 'bait', token: 'cut_bait', name: 'Cut Bait', tier: 'gold', unlockLevel: 11, price: 20, consumable: true, qty: 10, specs: { category: 'cut-bait' }, derived: { attract: 0.7 }, blurb: 'Catfish by scent.' },
    { id: 'bait_stinkbait', slot: 'bait', kind: 'bait', token: 'stinkbait', name: 'Stinkbait', tier: 'gold', unlockLevel: 11, price: 14, consumable: true, qty: 15, specs: { category: 'prepared' }, derived: { attract: 0.7 }, blurb: 'Channel-cat candy.' },
    { id: 'bait_corn', slot: 'bait', kind: 'bait', token: 'corn', name: 'Sweet Corn', tier: 'bronze', unlockLevel: 5, price: 6, consumable: true, qty: 40, specs: { category: 'prepared' }, derived: { attract: 0.5 }, blurb: 'Carp staple.' },
    { id: 'bait_boilie', slot: 'bait', kind: 'bait', token: 'boilie', name: 'Boilies', tier: 'silver', unlockLevel: 8, price: 15, consumable: true, qty: 20, specs: { category: 'prepared' }, derived: { attract: 0.6 }, blurb: 'Durable carp bait.' },
    { id: 'bait_sucker', slot: 'bait', kind: 'bait', token: 'live_sucker', name: 'Live Sucker (Trophy)', tier: 'platinum', unlockLevel: 17, price: 45, consumable: true, qty: 4, specs: { category: 'baitfish' }, derived: { attract: 0.8 }, blurb: 'Pike/musky trophy bait.' },
  ],
  holders: [
    { id: 'holder_forked', slot: 'holder', name: 'Forked Stick', tier: 'starter', unlockLevel: 1, price: 0, specs: { slots: 1 }, derived: {}, blurb: 'Free bank holder.' },
    { id: 'holder_spike', slot: 'holder', name: 'PVC Sand Spike', tier: 'bronze', unlockLevel: 4, price: 25, specs: { slots: 1 }, derived: {}, blurb: 'Sturdier.' },
    { id: 'holder_dual', slot: 'holder', name: 'Freestanding Dual Holder', tier: 'gold', unlockLevel: 13, price: 130, specs: { slots: 2 }, derived: {}, blurb: 'Two rods.' },
    { id: 'holder_station', slot: 'holder', name: '3-Rod Bank Station', tier: 'platinum', unlockLevel: 17, price: 280, specs: { slots: 3 }, derived: {}, blurb: 'Three lines, buzzers.' },
  ],
  // Polarized lenses cut the horizontal glare bouncing off the surface, killing
  // the sun glitter + sky reflection that washes out fish — so a higher
  // `polarized` value makes cruising fish easier to spot (see computeTackle ->
  // App passes it to the water shader).
  glasses: [
    { id: 'glass_amber', slot: 'glasses', name: 'Amber Polarized', tier: 'starter', unlockLevel: 2, price: 40, specs: { lens: 'amber', polarized: true }, derived: { polarized: 0.5 }, blurb: 'Cuts glare, pops contrast in low light.' },
    { id: 'glass_grey', slot: 'glasses', name: 'Grey Polarized', tier: 'bronze', unlockLevel: 6, price: 95, specs: { lens: 'grey', polarized: true }, derived: { polarized: 0.7 }, blurb: 'All-day glare killer for bright sun.' },
    { id: 'glass_copper', slot: 'glasses', name: 'Copper Mirror Polarized', tier: 'silver', unlockLevel: 10, price: 185, specs: { lens: 'copper mirror', polarized: true }, derived: { polarized: 0.85 }, blurb: 'High-contrast — sight-fish the shallows.' },
    { id: 'glass_pro', slot: 'glasses', name: 'Pro Sight-Caster Polarized', tier: 'gold', unlockLevel: 15, price: 340, specs: { lens: 'blue mirror', polarized: true }, derived: { polarized: 1.0 }, blurb: 'See every fish on the flat.' },
  ],
  hats: [
    { id: 'hat_cap', slot: 'hat', name: 'Cotton Ball Cap', tier: 'starter', unlockLevel: 1, price: 15, specs: { brim: 'curved' }, derived: {}, blurb: 'Classic. Keeps the sun off.' },
    { id: 'hat_trucker', slot: 'hat', name: 'Mesh Trucker', tier: 'starter', unlockLevel: 3, price: 22, specs: { brim: 'flat' }, derived: {}, blurb: 'Breathable. Looks the part.' },
    { id: 'hat_straw', slot: 'hat', name: 'Wide-Brim Straw', tier: 'bronze', unlockLevel: 7, price: 38, specs: { brim: 'wide' }, derived: { polarized: 0.12 }, blurb: 'Wide brim shades the water a touch.' },
    { id: 'hat_boonie', slot: 'hat', name: 'Boonie Sun Hat', tier: 'silver', unlockLevel: 11, price: 60, specs: { brim: 'full' }, derived: { polarized: 0.12 }, blurb: 'Full shade — stacks with polarized lenses.' },
  ],
}

export const STARTER_OWNED = ['rod_cane', 'reel_1000', 'line_mono4', 'hook_aberdeen10', 'bait_worm', 'holder_forked']
export const STARTER_LOADOUT = { rod: 'rod_cane', reel: 'reel_1000', line: 'line_mono4', hook: 'hook_aberdeen10', bait: 'bait_worm', holder: 'holder_forked' }

export function itemById(id) {
  for (const c of Object.values(CATALOG)) {
    const m = c.find((i) => i.id === id)
    if (m) return m
  }
  return null
}
export function itemsForSlot(slot) {
  return Object.values(CATALOG).flat().filter((i) => i.slot === slot)
}
export function computeTackle(loadout) {
  const rod = itemById(loadout.rod)
  const reel = itemById(loadout.reel)
  const line = itemById(loadout.line)
  const hook = itemById(loadout.hook)
  const bait = itemById(loadout.bait)
  const glasses = itemById(loadout.glasses)
  const hat = itemById(loadout.hat)
  return {
    name: `${line?.name || '?'} · ${reel?.name || '?'}`,
    lineStrength: line?.derived.lineStrength ?? 0.92,
    drag: reel?.derived.drag ?? 0.5,
    lineCapacity: (reel?.derived.lineCapacity ?? 90) + (line?.derived.lineCapacity ?? 0),
    stealth: line?.derived.stealth ?? 1.0, // invisible line -> more bites from wary fish
    landingPower: (rod?.derived.landingPower ?? 0.35) + (hook?.derived.landingPower ?? 0.2), // reel-in muscle + hookset
    castDistance: rod?.derived.castDistance ?? 0.4, // how far the rod casts
    attract: bait?.derived.attract ?? 0.4, // lure/bait appeal
    // polarized lenses (+ a wide brim) cut surface glare so fish are easier to
    // spot; 0 = none, 1 = full. Drives the water shader's glare/reflection.
    polarized: Math.min(1, (glasses?.derived.polarized ?? 0) + (hat?.derived.polarized ?? 0)),
  }
}
export function equippedToken(loadout) {
  return itemById(loadout.bait)?.token ?? null
}

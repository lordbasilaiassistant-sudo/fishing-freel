// Fishing areas. The starting area (Stillwater Pond) is the home base + the
// mechanics test-bed; later areas unlock by level and are reached via the map
// (fast travel). Map coordinates are 0..1 for placing pins on the map panel.
export const AREAS = [
  {
    id: 'stillwater',
    name: 'Stillwater Pond',
    blurb: 'Calm beginner water. Bluegill, perch, and the odd bass.',
    unlockLevel: 1,
    map: { x: 0.32, y: 0.62 },
  },
  {
    id: 'cedar_lake',
    name: 'Cedar Lake',
    blurb: 'Bigger, deeper — pike cruise the weed lines.',
    unlockLevel: 4,
    map: { x: 0.58, y: 0.4 },
  },
  {
    id: 'rapids',
    name: 'Granite Rapids',
    blurb: 'Fast cold water. Trout country.',
    unlockLevel: 8,
    map: { x: 0.74, y: 0.7 },
  },
]

export const STARTING_AREA = 'stillwater'

export const areaById = (id) => AREAS.find((a) => a.id === id) || AREAS[0]

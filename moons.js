/**
 * Selected major natural satellites; data only, kilometres / days / degrees.
 * Reviewed 2026-11-23 against the public JPL SSD tables linked below.
 *
 * This is an illustrative orbital atlas, NOT an ephemeris. Mean elements describe
 * approximate ellipses; no precession, perturbations, date-accurate orientation,
 * initial phase, mutual events or libration are implied. Renderer chooses a
 * deterministic illustrative phase/node/periapsis, and compresses sizes/distances.
 *
 * ORIENTATION CONTRACT
 * - periodDays is always positive. Advance mean anomaly in the same base sense
 *   for every moon (direction = +1). Full inclinationDeg (0..180) encodes the
 *   orbital normal: Triton's >90-degree inclination reverses its projected motion
 *   ONCE. Never also negate Triton's angular speed or use a negative period.
 * - ecliptic: planet-centred ecliptic frame; do NOT apply host axial tilt (Moon).
 * - host-equator: apply host's axial orientation ONCE (including Uranus/Pluto),
 *   followed by the local orbital orientation. No extra retrograde sign for those
 *   hosts: their large obliquity is already in the frame transformation.
 * - laplace: inclination is relative to the satellite's LOCAL LAPLACE PLANE,
 *   not the host equator. Apply planeTiltDeg to the host-equator frame, then the
 *   local inclination. planeTiltDeg is NOT added arithmetically to inclination.
 *   The direction of that plane tilt and orbital nodes is illustrative here.
 *   JPL's physical pole RA/Dec are retained as provenance, not mixed into this
 *   illustrative host frame. Iapetus especially must retain its 14.8-degree plane
 *   tilt in addition to its 7.6-degree inclination to that plane.
 *
 * The exact 22-moon roster intentionally omits other small/irregular satellites,
 * Hyperion, Nereid, and Pluto's four small outer moons. Mercury and Venus have
 * no natural satellites. Included irregular shapes are represented by mean radii;
 * color fields are illustrative material palettes, not calibrated surface data.
 */
export const MOON_SOURCES = Object.freeze({
  elements: 'https://ssd.jpl.nasa.gov/sats/elem/',
  radii: 'https://ssd.jpl.nasa.gov/sats/phys_par/',
  hostRadii: 'https://ssd.jpl.nasa.gov/planets/phys_par.html',
  galileanSiderealPeriods: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/joviansatfact.html',
});

// Mean host radii, not equatorial radii. For visual scaling.
export const HOST_RADII_KM = Object.freeze({
  mercury: 2439.4,
  venus: 6051.8,
  earth: 6371.0084,
  mars: 3389.5,
  jupiter: 69911,
  saturn: 58232,
  uranus: 25362,
  neptune: 24622,
  pluto: 1188.3,
});

// All source elements are mean elements at J2000 (2000-01-01.5 TDB).
// The source epoch is provenance only, not an animation start date.
// JPL table periods are used except the four explicitly sidereal NASA periods
// for the Galilean satellites. Keep the latter distinction when documenting speed.
export const MOONS = [
  {
    id: 'moon', name: 'Moon', parent: 'earth', radiusKm: 1737.4,
    semiMajorAxisKm: 384400, periodDays: 27.322, eccentricity: .0554,
    inclinationDeg: 5.16, referencePlane: 'ecliptic', direction: 1,
    ephemeris: 'DE405/LE405', color: '#a5a3a0',
  },
  {
    id: 'phobos', name: 'Phobos', parent: 'mars', radiusKm: 11.08,
    semiMajorAxisKm: 9375, periodDays: .3187, eccentricity: .015,
    inclinationDeg: 1.1, referencePlane: 'laplace', direction: 1,
    planeTiltDeg: 0, planeTiltReference: 'host-equator', sourcePlanePoleRaDeg: 317.7, sourcePlanePoleDecDeg: 52.9,
    ephemeris: 'MAR099', color: '#8a8077',
  },
  {
    id: 'deimos', name: 'Deimos', parent: 'mars', radiusKm: 6.2,
    semiMajorAxisKm: 23457, periodDays: 1.2625, eccentricity: 0,
    inclinationDeg: 1.8, referencePlane: 'laplace', direction: 1,
    planeTiltDeg: .9, planeTiltReference: 'host-equator', sourcePlanePoleRaDeg: 316.6, sourcePlanePoleDecDeg: 53.5,
    ephemeris: 'MAR099', color: '#a49784',
  },
  {
    id: 'io', name: 'Io', parent: 'jupiter', radiusKm: 1821.49,
    semiMajorAxisKm: 421800, periodDays: 1.769138, eccentricity: .004,
    inclinationDeg: 0, referencePlane: 'laplace', direction: 1,
    planeTiltDeg: 0, planeTiltReference: 'host-equator', sourcePlanePoleRaDeg: 268.1, sourcePlanePoleDecDeg: 64.5,
    ephemeris: 'JUP365', periodSource: 'galileanSiderealPeriods', color: '#d3ba64',
  },
  {
    id: 'europa', name: 'Europa', parent: 'jupiter', radiusKm: 1560.8,
    semiMajorAxisKm: 671100, periodDays: 3.551181, eccentricity: .009,
    inclinationDeg: .5, referencePlane: 'laplace', direction: 1,
    planeTiltDeg: 0, planeTiltReference: 'host-equator', sourcePlanePoleRaDeg: 268.1, sourcePlanePoleDecDeg: 64.5,
    ephemeris: 'JUP365', periodSource: 'galileanSiderealPeriods', color: '#c8c0aa',
  },
  {
    id: 'ganymede', name: 'Ganymede', parent: 'jupiter', radiusKm: 2631.2,
    semiMajorAxisKm: 1070400, periodDays: 7.154553, eccentricity: .001,
    inclinationDeg: .2, referencePlane: 'laplace', direction: 1,
    planeTiltDeg: .1, planeTiltReference: 'host-equator', sourcePlanePoleRaDeg: 268.2, sourcePlanePoleDecDeg: 64.6,
    ephemeris: 'JUP365', periodSource: 'galileanSiderealPeriods', color: '#a39887',
  },
  {
    id: 'callisto', name: 'Callisto', parent: 'jupiter', radiusKm: 2410.3,
    semiMajorAxisKm: 1882700, periodDays: 16.689017, eccentricity: .007,
    inclinationDeg: .3, referencePlane: 'laplace', direction: 1,
    planeTiltDeg: .4, planeTiltReference: 'host-equator', sourcePlanePoleRaDeg: 268.7, sourcePlanePoleDecDeg: 64.8,
    ephemeris: 'JUP365', periodSource: 'galileanSiderealPeriods', color: '#79756c',
  },
  {
    id: 'mimas', name: 'Mimas', parent: 'saturn', radiusKm: 198.2,
    semiMajorAxisKm: 186000, periodDays: .942422, eccentricity: .020,
    inclinationDeg: 1.6, referencePlane: 'laplace', direction: 1,
    planeTiltDeg: 0, planeTiltReference: 'host-equator', sourcePlanePoleRaDeg: 40.6, sourcePlanePoleDecDeg: 83.5,
    ephemeris: 'SAT441', color: '#b8b6b0',
  },
  {
    id: 'enceladus', name: 'Enceladus', parent: 'saturn', radiusKm: 252.1,
    semiMajorAxisKm: 238400, periodDays: 1.370218, eccentricity: .005,
    inclinationDeg: 0, referencePlane: 'laplace', direction: 1,
    planeTiltDeg: 0, planeTiltReference: 'host-equator', sourcePlanePoleRaDeg: 40.6, sourcePlanePoleDecDeg: 83.5,
    ephemeris: 'SAT441', color: '#e3e7e4',
  },
  {
    id: 'tethys', name: 'Tethys', parent: 'saturn', radiusKm: 531.1,
    semiMajorAxisKm: 295000, periodDays: 1.887802, eccentricity: .001,
    inclinationDeg: 1.1, referencePlane: 'laplace', direction: 1,
    planeTiltDeg: 0, planeTiltReference: 'host-equator', sourcePlanePoleRaDeg: 40.6, sourcePlanePoleDecDeg: 83.5,
    ephemeris: 'SAT441', color: '#c9ceca',
  },
  {
    id: 'dione', name: 'Dione', parent: 'saturn', radiusKm: 561.4,
    semiMajorAxisKm: 377700, periodDays: 2.736916, eccentricity: .002,
    inclinationDeg: 0, referencePlane: 'laplace', direction: 1,
    planeTiltDeg: 0, planeTiltReference: 'host-equator', sourcePlanePoleRaDeg: 40.6, sourcePlanePoleDecDeg: 83.5,
    ephemeris: 'SAT441', color: '#bac0bd',
  },
  {
    id: 'rhea', name: 'Rhea', parent: 'saturn', radiusKm: 763.5,
    semiMajorAxisKm: 527200, periodDays: 4.517503, eccentricity: .001,
    inclinationDeg: .3, referencePlane: 'laplace', direction: 1,
    planeTiltDeg: 0, planeTiltReference: 'host-equator', sourcePlanePoleRaDeg: 40.6, sourcePlanePoleDecDeg: 83.5,
    ephemeris: 'SAT441', color: '#b2b6af',
  },
  {
    id: 'titan', name: 'Titan', parent: 'saturn', radiusKm: 2574.76,
    semiMajorAxisKm: 1221900, periodDays: 15.945448, eccentricity: .029,
    inclinationDeg: .3, referencePlane: 'laplace', direction: 1,
    planeTiltDeg: .6, planeTiltReference: 'host-equator', sourcePlanePoleRaDeg: 36.4, sourcePlanePoleDecDeg: 84,
    ephemeris: 'SAT441', color: '#cba45e',
  },
  {
    id: 'iapetus', name: 'Iapetus', parent: 'saturn', radiusKm: 734.3,
    semiMajorAxisKm: 3561700, periodDays: 79.331002, eccentricity: .028,
    inclinationDeg: 7.6, referencePlane: 'laplace', direction: 1,
    planeTiltDeg: 14.8, planeTiltReference: 'host-equator', sourcePlanePoleRaDeg: 288.7, sourcePlanePoleDecDeg: 78.9,
    ephemeris: 'SAT441', color: '#9b9488',
  },
  {
    id: 'miranda', name: 'Miranda', parent: 'uranus', radiusKm: 235.8,
    semiMajorAxisKm: 129846, periodDays: 1.413479, eccentricity: .001,
    inclinationDeg: 4.4, referencePlane: 'host-equator', direction: 1,
    ephemeris: 'URA182', color: '#a9a8a2',
  },
  {
    id: 'ariel', name: 'Ariel', parent: 'uranus', radiusKm: 578.9,
    semiMajorAxisKm: 190929, periodDays: 2.520379, eccentricity: .001,
    inclinationDeg: 0, referencePlane: 'host-equator', direction: 1,
    ephemeris: 'URA182', color: '#c3c6bf',
  },
  {
    id: 'umbriel', name: 'Umbriel', parent: 'uranus', radiusKm: 584.7,
    semiMajorAxisKm: 265986, periodDays: 4.144177, eccentricity: .004,
    inclinationDeg: .1, referencePlane: 'host-equator', direction: 1,
    ephemeris: 'URA182', color: '#7d817d',
  },
  {
    id: 'titania', name: 'Titania', parent: 'uranus', radiusKm: 788.9,
    semiMajorAxisKm: 436298, periodDays: 8.705869, eccentricity: .002,
    inclinationDeg: .1, referencePlane: 'host-equator', direction: 1,
    ephemeris: 'URA182', color: '#a49c91',
  },
  {
    id: 'oberon', name: 'Oberon', parent: 'uranus', radiusKm: 761.4,
    semiMajorAxisKm: 583511, periodDays: 13.463237, eccentricity: .002,
    inclinationDeg: .1, referencePlane: 'host-equator', direction: 1,
    ephemeris: 'URA182', color: '#948b83',
  },
  {
    id: 'proteus', name: 'Proteus', parent: 'neptune', radiusKm: 208,
    semiMajorAxisKm: 117700, periodDays: 1.1229, eccentricity: .001,
    inclinationDeg: .6, referencePlane: 'host-equator', direction: 1,
    ephemeris: 'NEP098', color: '#828780',
  },
  {
    id: 'triton', name: 'Triton', parent: 'neptune', radiusKm: 1352.6,
    semiMajorAxisKm: 354800, periodDays: 5.8792, eccentricity: 0,
    inclinationDeg: 157.3, referencePlane: 'host-equator', direction: 1,
    ephemeris: 'NEP098', color: '#c0bcb7',
  },
  {
    id: 'charon', name: 'Charon', parent: 'pluto', radiusKm: 606,
    semiMajorAxisKm: 19600, periodDays: 6.387222, eccentricity: 0,
    inclinationDeg: 0, referencePlane: 'host-equator', direction: 1,
    ephemeris: 'PLU060', color: '#9c9995',
    // a is Pluto–Charon separation, not Charon's barycentric semimajor axis.
    // A host-centred renderer omits Pluto's barycentric wobble explicitly.
  },
];

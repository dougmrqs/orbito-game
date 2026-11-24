// Board geometry: 16 spaces on a 4x4 grid, split into two orbits.
//
// Space ids, as seen from above:
//
//   01 02 03 04
//   12 13 14 05
//   11 16 15 06
//   10 09 08 07
//
// The outer orbit is the ring 01..12, the inner orbit is the ring 13..16.
// Both are listed in clockwise order.

export type SpaceId = number;
export type OrbitName = "outer" | "inner";
export type Direction = "clockwise" | "counterclockwise";

export interface Space {
  id: SpaceId;
  row: number;
  col: number;
  orbit: OrbitName;
}

export const GRID_SIZE = 4;

export const GRID: readonly (readonly SpaceId[])[] = [
  [1, 2, 3, 4],
  [12, 13, 14, 5],
  [11, 16, 15, 6],
  [10, 9, 8, 7],
];

export const ORBITS: Readonly<Record<OrbitName, readonly SpaceId[]>> = {
  outer: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  inner: [13, 14, 15, 16],
};

export const SPACES: readonly Space[] = GRID.flatMap((ids, row) =>
  ids.map((id, col) => ({
    id,
    row,
    col,
    orbit: (ORBITS.inner.includes(id) ? "inner" : "outer") as OrbitName,
  })),
).sort((a, b) => a.id - b.id);

export const SPACE_IDS: readonly SpaceId[] = SPACES.map((space) => space.id);

export function getSpace(id: SpaceId): Space {
  const space = SPACES[id - 1];

  if (!space || space.id !== id) {
    throw new Error(`Space with id ${id} not found`);
  }

  return space;
}

/** Two spaces are adjacent when they share an edge (no diagonals). */
export function areAdjacent(a: SpaceId, b: SpaceId): boolean {
  const from = getSpace(a);
  const to = getSpace(b);

  return Math.abs(from.row - to.row) + Math.abs(from.col - to.col) === 1;
}

/** The space a marble lands on after one orbit step. */
export function nextSpace(id: SpaceId, direction: Direction): SpaceId {
  const ring = ORBITS[getSpace(id).orbit];
  const step = direction === "clockwise" ? 1 : -1;
  const index = ring.indexOf(id);

  return ring[(index + step + ring.length) % ring.length];
}

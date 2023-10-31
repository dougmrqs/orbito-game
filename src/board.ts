// Board should have 16 cells, 4x4.
// The board have two orbits, an inner and an outer, that turns anticlockwise:
// ⇐⇐⇐⇐
// ⇓ ⇓⇐ ⇑
// ⇓ ⇒⇑ ⇑
// ⇒⇒⇒⇒

import cloneDeep from "lodash.clonedeep";

import { Orbit, Board, Space } from "./types";

function makeOuterOrbit(): Orbit {
  return [
    { id: 1, position: 0, piece: null },
    { id: 2, position: 1, piece: null },
    { id: 3, position: 2, piece: null },
    { id: 4, position: 3, piece: null },
    { id: 5, position: 4, piece: null },
    { id: 6, position: 5, piece: null },
    { id: 7, position: 6, piece: null },
    { id: 8, position: 7, piece: null },
    { id: 9, position: 8, piece: null },
    { id: 10, position: 9, piece: null },
    { id: 11, position: 10, piece: null },
    { id: 12, position: 11, piece: null },
  ];
}

function makeInnerOrbit(): Orbit {
  return [
    { id: 13, position: 0, piece: null },
    { id: 14, position: 1, piece: null },
    { id: 15, position: 2, piece: null },
    { id: 16, position: 3, piece: null },
  ];
}

function makeBoard(innerOrbit?: Orbit, outerOrbit?: Orbit): Board {
  const _innerOrbit = innerOrbit ? cloneDeep(innerOrbit) : makeInnerOrbit();
  const _outerOrbit = outerOrbit ? cloneDeep(outerOrbit) : makeOuterOrbit();

  const findSpaceById = (id: number): Space => {
    const space =
      _innerOrbit.find((space) => space.id === id) ||
      _outerOrbit.find((space) => space.id === id);

    if (space) {
      return space;
    }

    throw new Error(`Space with id ${id} not found`);
  };

  return {
    innerOrbit: _innerOrbit,
    outerOrbit: _outerOrbit,

    findSpaceById: findSpaceById,
  };
}

export { makeBoard };

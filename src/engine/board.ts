// The engine: what is physically possible on the board. Marbles can be placed
// in a space, moved between spaces, and every marble can be shifted one step
// along its orbit. The engine knows nothing about players, turns or winning;
// that belongs to the rules.
//
// A board is plain immutable data, so it can be compared, stored and restored.

import { Direction, SPACE_IDS, SpaceId, getSpace, nextSpace } from "./layout";

export interface Marble {
  id: number;
  owner: string;
}

export type Board = Readonly<Record<SpaceId, Marble | null>>;

export class EngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EngineError";
  }
}

export function createBoard(): Board {
  return Object.fromEntries(SPACE_IDS.map((id) => [id, null]));
}

export function marbleAt(board: Board, spaceId: SpaceId): Marble | null {
  return board[getSpace(spaceId).id];
}

export function place(board: Board, spaceId: SpaceId, marble: Marble): Board {
  if (marbleAt(board, spaceId)) {
    throw new EngineError("Space is occupied");
  }

  return { ...board, [spaceId]: marble };
}

export function move(board: Board, from: SpaceId, to: SpaceId): Board {
  const marble = marbleAt(board, from);

  if (!marble) {
    throw new EngineError("Space is empty");
  }

  if (marbleAt(board, to)) {
    throw new EngineError("Space is occupied");
  }

  return { ...board, [from]: null, [to]: marble };
}

/** Shifts every marble one step along its orbit. */
export function orbit(board: Board, direction: Direction): Board {
  return Object.fromEntries(
    SPACE_IDS.map((id) => [nextSpace(id, direction), board[id]]),
  );
}

export function isFull(board: Board): boolean {
  return SPACE_IDS.every((id) => board[id] !== null);
}

export function occupiedSpaces(
  board: Board,
): { spaceId: SpaceId; marble: Marble }[] {
  return SPACE_IDS.flatMap((spaceId) => {
    const marble = board[spaceId];

    return marble ? [{ spaceId, marble }] : [];
  });
}

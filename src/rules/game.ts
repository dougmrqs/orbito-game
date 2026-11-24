// The rules: what a player is allowed to do, and when. A turn has three steps:
//
//   1. optionally move one of the opponent's marbles to an adjacent empty space
//   2. place one of your own marbles on any empty space
//   3. press the button, which shifts every marble one step along its orbit
//
// The outcome is checked after every press. Once the board is full, the button
// is pressed up to FINAL_ORBITS more times before the game is called a draw.
//
// The game state is plain immutable data: every action returns a new state, or
// throws a RuleViolation and leaves the game as it was.

import {
  Board,
  Direction,
  SpaceId,
  areAdjacent,
  createBoard,
  isFull,
  marbleAt,
  move,
  orbit,
  place,
} from "../engine";
import { Outcome, PlayerId, resolveOutcome } from "./outcome";

export type Phase = "move-or-place" | "place" | "orbit" | "over";

export interface GameState {
  board: Board;
  currentPlayer: PlayerId;
  phase: Phase;
  placed: Readonly<Record<PlayerId, number>>;
  /** Presses left once the board is full; null while there is still room. */
  finalOrbitsLeft: number | null;
  outcome: Outcome | null;
}

export const PLAYERS: readonly PlayerId[] = ["black", "white"];
export const MARBLES_PER_PLAYER = 8;
export const ORBIT_DIRECTION: Direction = "clockwise";
export const FINAL_ORBITS = 5;

export class RuleViolation extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuleViolation";
  }
}

export function createGame(): GameState {
  return {
    board: createBoard(),
    currentPlayer: "black",
    phase: "move-or-place",
    placed: { black: 0, white: 0 },
    finalOrbitsLeft: null,
    outcome: null,
  };
}

export function opponentOf(player: PlayerId): PlayerId {
  return player === "black" ? "white" : "black";
}

function assertInProgress(state: GameState): void {
  if (state.phase === "over") {
    throw new RuleViolation("The game is over");
  }
}

export function moveOpponentMarble(
  state: GameState,
  from: SpaceId,
  to: SpaceId,
): GameState {
  assertInProgress(state);

  if (state.phase !== "move-or-place") {
    throw new RuleViolation("You can't move a marble now");
  }

  const marble = marbleAt(state.board, from);

  if (!marble) {
    throw new RuleViolation("There is no marble in the space");
  }

  if (marble.owner === state.currentPlayer) {
    throw new RuleViolation("You can't move your own marble");
  }

  if (!areAdjacent(from, to)) {
    throw new RuleViolation("You can only move to an adjacent space");
  }

  if (marbleAt(state.board, to)) {
    throw new RuleViolation("Space is occupied");
  }

  return { ...state, board: move(state.board, from, to), phase: "place" };
}

export function placeMarble(state: GameState, spaceId: SpaceId): GameState {
  assertInProgress(state);

  if (state.phase !== "move-or-place" && state.phase !== "place") {
    throw new RuleViolation("You can't place a marble now");
  }

  if (marbleAt(state.board, spaceId)) {
    throw new RuleViolation("Space is occupied");
  }

  const player = state.currentPlayer;
  const marble = {
    id: state.placed.black + state.placed.white + 1,
    owner: player,
  };

  return {
    ...state,
    board: place(state.board, spaceId, marble),
    placed: { ...state.placed, [player]: state.placed[player] + 1 },
    phase: "orbit",
  };
}

export function pressOrbit(state: GameState): GameState {
  assertInProgress(state);

  if (state.phase !== "orbit") {
    throw new RuleViolation("Place a marble before pressing the button");
  }

  const board = orbit(state.board, ORBIT_DIRECTION);
  const outcome = resolveOutcome(board);

  if (outcome) {
    return { ...state, board, outcome, phase: "over" };
  }

  if (!isFull(board)) {
    return {
      ...state,
      board,
      currentPlayer: opponentOf(state.currentPlayer),
      phase: "move-or-place",
    };
  }

  const finalOrbitsLeft =
    state.finalOrbitsLeft === null ? FINAL_ORBITS : state.finalOrbitsLeft - 1;

  if (finalOrbitsLeft === 0) {
    return {
      ...state,
      board,
      finalOrbitsLeft,
      outcome: { kind: "draw" },
      phase: "over",
    };
  }

  return { ...state, board, finalOrbitsLeft };
}

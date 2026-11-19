// Keeps the game in the browser's localStorage, so a reload or a closed tab
// does not lose it. Anything unreadable is ignored and a new game starts.

import { SPACE_IDS } from "../engine";
import { GameState, PLAYERS } from "../rules";

const KEY = "marble-orbit:game:v1";
const PHASES = ["move-or-place", "place", "orbit", "over"];

function isPlayer(value: unknown): boolean {
  return PLAYERS.includes(value as never);
}

function isGameState(value: any): value is GameState {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.board === "object" &&
    value.board !== null &&
    SPACE_IDS.every((id) => {
      const marble = value.board[id];

      return (
        marble === null ||
        (typeof marble?.id === "number" && isPlayer(marble.owner))
      );
    }) &&
    isPlayer(value.currentPlayer) &&
    PHASES.includes(value.phase) &&
    PLAYERS.every((player) => typeof value.placed?.[player] === "number") &&
    (value.finalOrbitsLeft === null ||
      typeof value.finalOrbitsLeft === "number") &&
    (value.outcome === null ||
      value.outcome?.kind === "draw" ||
      (value.outcome?.kind === "win" && isPlayer(value.outcome.winner)))
  );
}

export function loadGame(): GameState | null {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? "null");

    return isGameState(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function saveGame(game: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(game));
  } catch {
    // storage can be full or blocked; the game still plays without it
  }
}

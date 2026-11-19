// How a game ends: a player wins by lining up four of their marbles in a row,
// horizontally, vertically or diagonally. If both players have a line at the
// same time, the game is a draw.

import { Board, GRID, GRID_SIZE, SpaceId } from "../engine";

export type PlayerId = "black" | "white";

export type Outcome = { kind: "win"; winner: PlayerId } | { kind: "draw" };

const indexes = [...Array(GRID_SIZE).keys()];

export const WINNING_LINES: readonly (readonly SpaceId[])[] = [
  ...indexes.map((row) => indexes.map((col) => GRID[row][col])),
  ...indexes.map((col) => indexes.map((row) => GRID[row][col])),
  indexes.map((i) => GRID[i][i]),
  indexes.map((i) => GRID[i][GRID_SIZE - 1 - i]),
];

function hasLine(board: Board, player: PlayerId): boolean {
  return WINNING_LINES.some((line) =>
    line.every((spaceId) => board[spaceId]?.owner === player),
  );
}

export function resolveOutcome(board: Board): Outcome | null {
  const black = hasLine(board, "black");
  const white = hasLine(board, "white");

  if (black && white) return { kind: "draw" };
  if (black) return { kind: "win", winner: "black" };
  if (white) return { kind: "win", winner: "white" };

  return null;
}

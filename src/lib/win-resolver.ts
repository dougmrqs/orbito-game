import { Board, Player, Space } from "../types";

// player must make a row of four, horizontally, vertically or diagonally:
// 01 02 03 04
// 12 13 14 05
// 11 16 15 06
// 10 09 08 07
const POSSIBLE_WINS = [
  [1, 2, 3, 4],
  [12, 13, 14, 5],
  [11, 16, 15, 6],
  [10, 9, 8, 7],
  [1, 12, 11, 10],
  [2, 13, 16, 9],
  [3, 14, 15, 8],
  [4, 5, 6, 7],
  [1, 13, 15, 7],
  [4, 14, 16, 10],
];

function resolveWinner(board: Board): Player | undefined {
  // grabs all occupied spaces separated by player
  const allSpaces = [...board.outerOrbit, ...board.innerOrbit];

  const occupiedSpacesByPlayer = allSpaces.reduce(
    (acc: Record<string, Space[]>, space) => {
      if (space.piece) {
        acc[space.piece.player.color]
          ? acc[space.piece.player.color].push(space)
          : (acc[space.piece.player.color] = [space]);
      }

      return acc;
    },
    {},
  );

  // checks if one of both players have a winning row
  const winner = Object.values(occupiedSpacesByPlayer).filter((spaces) => {
    const ids = spaces.map((space) => space.id);
    return POSSIBLE_WINS.some((win) =>
      win.every((position) => ids.includes(position)),
    );
  });

  if (winner.length > 1) {
    return { color: "draw" };
  }

  return winner[0]?.[0]?.piece?.player;
}

export { resolveWinner, POSSIBLE_WINS };

import { Board, GRID, createBoard, place } from "../../src/engine";

/**
 * Builds a board from a picture of it, one string per row:
 * "b" is a black marble, "w" a white one, anything else an empty space.
 */
export function boardFrom(rows: [string, string, string, string]): Board {
  let board = createBoard();
  let id = 100;

  rows.forEach((row, rowIndex) => {
    [...row].forEach((char, colIndex) => {
      const owner = { b: "black", w: "white" }[char];

      if (owner) {
        board = place(board, GRID[rowIndex][colIndex], { id: id++, owner });
      }
    });
  });

  return board;
}

export function picture(board: Board): string[] {
  return GRID.map((row) =>
    row.map((id) => board[id]?.owner[0] ?? ".").join(""),
  );
}

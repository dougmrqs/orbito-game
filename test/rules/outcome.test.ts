import { createBoard, place } from "../../src/engine";
import { WINNING_LINES, completedLines, resolveOutcome } from "../../src/rules";
import { boardFrom } from "../support/boards";

describe("Outcome", () => {
  it("has 10 winning lines: 4 rows, 4 columns and 2 diagonals", () => {
    // 01 02 03 04
    // 12 13 14 05
    // 11 16 15 06
    // 10 09 08 07
    expect(WINNING_LINES).toEqual([
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
    ]);
  });

  WINNING_LINES.forEach((line) => {
    it(`player wins when positioned at ${line}`, () => {
      const board = line.reduce(
        (board, spaceId) =>
          place(board, spaceId, { id: spaceId, owner: "white" }),
        createBoard(),
      );

      expect(resolveOutcome(board)).toEqual({ kind: "win", winner: "white" });
    });
  });

  it("has no outcome while nobody has a line", () => {
    expect(resolveOutcome(createBoard())).toBeNull();
    expect(
      resolveOutcome(boardFrom(["bbbw", "....", "....", "...."])),
    ).toBeNull();
  });

  it("tells which lines are complete", () => {
    expect(completedLines(boardFrom(["bbbw", "....", "....", "...."]))).toEqual(
      [],
    );
    expect(completedLines(boardFrom(["b..w", "b..w", "b..w", "bbbw"]))).toEqual(
      [
        [1, 12, 11, 10],
        [4, 5, 6, 7],
      ],
    );
  });

  it("is a draw when both players have a line", () => {
    const board = boardFrom(["bbbb", "....", "....", "wwww"]);

    expect(resolveOutcome(board)).toEqual({ kind: "draw" });
  });
});

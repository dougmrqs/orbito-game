import { makeBoard } from "../src/board";
import { makeRunOrbit } from "../src/game";

describe("Board", () => {
  const board = makeBoard();

  describe("Inner Orbit", () => {
    it("should have 4 spaces", () => {
      expect(board.innerOrbit.length).toEqual(4);
    });

    it("initially should be ordered from 0 to 3", () => {
      const positions = board.innerOrbit.map((cell) => cell.position);

      expect(positions).toEqual([0, 1, 2, 3]);
    });
  });

  describe("Outer Orbit", () => {
    it("should have 10 spaces", () => {
      expect(board.outerOrbit.length).toEqual(10);
    });

    it("initially should be ordered from 0 to 9", () => {
      const positions = board.outerOrbit.map((cell) => cell.position);

      expect(positions).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe("#findSpace", () => {
    it("finds a space by id", () => {
      const space = board.findSpace(1);

      expect(space.id).toEqual(1);
      expect(space.position).toEqual(0);
    });

    it("finds the space by the same id after orbiting", () => {
      const newBoard = makeRunOrbit(board)();

      const beforeSpace = board.findSpace(1);
      const afterSpace = newBoard.findSpace(1);

      expect(beforeSpace.id).toEqual(1);
      expect(beforeSpace.position).toEqual(0);
      expect(afterSpace.id).toEqual(1);
      expect(afterSpace.position).toEqual(1);
    });

    it("throws an error if space is not found", () => {
      expect(() => board.findSpace(100)).toThrowError(
        "Space with id 100 not found"
      );
    });
  });
});

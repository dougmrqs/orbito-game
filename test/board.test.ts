import { makeBoard } from "../src/board";
import { makeRunOrbit } from "../src/game";

describe("Board", () => {
  const board = makeBoard();

  it("should have 16 spaces total", () => {
    expect(board.innerOrbit.length + board.outerOrbit.length).toEqual(16);
  });

  describe("Inner Orbit", () => {
    it("should have 4 spaces", () => {
      expect(board.innerOrbit.length).toEqual(4);
    });

    it("initially should be ordered from 0 to 3", () => {
      const positions = board.innerOrbit.map((cell) => cell.position);

      expect(positions).toEqual([0, 1, 2, 3]);
    });

    it("is identified with incremental ids from 13 to 16", () => {
      const ids = board.innerOrbit.map((cell) => cell.id);

      expect(ids).toEqual([13, 14, 15, 16]);
    });
  });

  describe("Outer Orbit", () => {
    it("should have 12 Spaces", () => {
      expect(board.outerOrbit.length).toEqual(12);
    });

    it("initially should be positioned from 0 to 11", () => {
      const positions = board.outerOrbit.map((cell) => cell.position);

      expect(positions).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it("is identified with incremental ids from 1 to 12", () => {
      const ids = board.outerOrbit.map((cell) => cell.id);

      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });
  });

  describe("#findSpaceById", () => {
    it("finds a space by id", () => {
      const space = board.findSpaceById(1);

      expect(space.id).toEqual(1);
      expect(space.position).toEqual(0);
    });

    it("id stays at the same position after orbiting", () => {
      const newBoard = makeRunOrbit(board)();

      const beforeSpace = board.findSpaceById(1);
      const afterSpace = newBoard.findSpaceById(1);

      expect(beforeSpace.id).toEqual(1);
      expect(beforeSpace.position).toEqual(0);
      expect(afterSpace.id).toEqual(1);
      expect(afterSpace.position).toEqual(0);
    });

    it("throws an error if space is not found", () => {
      expect(() => board.findSpaceById(100)).toThrowError(
        "Space with id 100 not found",
      );
    });
  });
});

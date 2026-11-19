import {
  createBoard,
  isFull,
  marbleAt,
  move,
  occupiedSpaces,
  orbit,
  place,
  SPACE_IDS,
} from "../../src/engine";

const black = { id: 1, owner: "black" };
const white = { id: 2, owner: "white" };

describe("Board", () => {
  it("starts with 16 empty spaces", () => {
    const board = createBoard();

    expect(Object.keys(board)).toHaveLength(16);
    expect(occupiedSpaces(board)).toEqual([]);
  });

  describe("place", () => {
    it("places a marble on the board", () => {
      const board = place(createBoard(), 1, black);

      expect(marbleAt(board, 1)).toEqual(black);
    });

    it("cannot place a marble on an occupied space", () => {
      const board = place(createBoard(), 1, black);

      expect(() => place(board, 1, white)).toThrow("Space is occupied");
    });

    it("does not mutate the original board", () => {
      const board = createBoard();

      place(board, 1, black);

      expect(marbleAt(board, 1)).toBeNull();
    });
  });

  describe("move", () => {
    it("moves a marble from a space to another", () => {
      const board = move(place(createBoard(), 1, black), 1, 2);

      expect(marbleAt(board, 1)).toBeNull();
      expect(marbleAt(board, 2)).toEqual(black);
    });

    it("cannot move a marble from an empty space", () => {
      expect(() => move(createBoard(), 1, 2)).toThrow("Space is empty");
    });

    it("cannot move a marble to an occupied space", () => {
      const board = place(place(createBoard(), 1, black), 2, white);

      expect(() => move(board, 1, 2)).toThrow("Space is occupied");
    });
  });

  describe("orbit", () => {
    it("carries every marble one step along its orbit", () => {
      const board = place(place(createBoard(), 12, black), 13, white);

      const clockwise = orbit(board, "clockwise");

      expect(marbleAt(clockwise, 1)).toEqual(black);
      expect(marbleAt(clockwise, 14)).toEqual(white);
      expect(occupiedSpaces(clockwise)).toHaveLength(2);
    });

    it("can turn the other way", () => {
      const board = place(place(createBoard(), 1, black), 13, white);

      const counterclockwise = orbit(board, "counterclockwise");

      expect(marbleAt(counterclockwise, 12)).toEqual(black);
      expect(marbleAt(counterclockwise, 16)).toEqual(white);
    });

    it("brings a marble back after a full lap", () => {
      const start = place(place(createBoard(), 1, black), 13, white);

      const lap = [...Array(12)].reduce(
        (board) => orbit(board, "clockwise"),
        start,
      );

      expect(lap).toEqual(start);
    });

    it("is undone by orbiting the other way", () => {
      const start = place(createBoard(), 5, black);

      expect(orbit(orbit(start, "clockwise"), "counterclockwise")).toEqual(
        start,
      );
    });

    it("does not mutate the original board", () => {
      const board = place(createBoard(), 1, black);

      orbit(board, "clockwise");

      expect(marbleAt(board, 1)).toEqual(black);
    });
  });

  describe("isFull", () => {
    it("is full only when every space holds a marble", () => {
      const almost = SPACE_IDS.slice(1).reduce(
        (board, id) => place(board, id, { id, owner: "black" }),
        createBoard(),
      );

      expect(isFull(almost)).toBe(false);
      expect(isFull(place(almost, 1, white))).toBe(true);
    });
  });
});

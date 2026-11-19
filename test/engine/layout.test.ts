import {
  ORBITS,
  SPACES,
  SPACE_IDS,
  areAdjacent,
  getSpace,
  nextSpace,
} from "../../src/engine";

describe("Layout", () => {
  it("has 16 spaces, identified from 1 to 16", () => {
    expect(SPACE_IDS).toEqual([...Array(16)].map((_, index) => index + 1));
  });

  it("has an outer orbit of 12 spaces and an inner orbit of 4", () => {
    expect(ORBITS.outer).toHaveLength(12);
    expect(ORBITS.inner).toHaveLength(4);
    expect(SPACES.filter((space) => space.orbit === "inner")).toHaveLength(4);
  });

  it("knows where each space sits on the grid", () => {
    expect(getSpace(1)).toMatchObject({ row: 0, col: 0, orbit: "outer" });
    expect(getSpace(7)).toMatchObject({ row: 3, col: 3, orbit: "outer" });
    expect(getSpace(16)).toMatchObject({ row: 2, col: 1, orbit: "inner" });
  });

  it("throws an error if a space is not found", () => {
    expect(() => getSpace(17)).toThrow("Space with id 17 not found");
    expect(() => getSpace(0)).toThrow("Space with id 0 not found");
  });

  describe("adjacency", () => {
    // 01 02 03 04
    // 12 13 14 05
    // 11 16 15 06
    // 10 09 08 07
    const ADJACENCIES: Record<number, number[]> = {
      1: [2, 12],
      2: [1, 3, 13],
      3: [2, 4, 14],
      4: [3, 5],
      5: [4, 6, 14],
      6: [5, 7, 15],
      7: [6, 8],
      8: [7, 9, 15],
      9: [8, 10, 16],
      10: [9, 11],
      11: [10, 12, 16],
      12: [1, 11, 13],
      13: [2, 12, 14, 16],
      14: [3, 5, 13, 15],
      15: [6, 8, 14, 16],
      16: [9, 11, 13, 15],
    };

    SPACE_IDS.forEach((a) => {
      SPACE_IDS.forEach((b) => {
        const expected = ADJACENCIES[a].includes(b);

        it(`${a} is ${expected ? "" : "not "}adjacent to ${b}`, () => {
          expect(areAdjacent(a, b)).toBe(expected);
        });
      });
    });
  });

  describe("orbit steps", () => {
    it("walks the outer orbit clockwise", () => {
      expect(nextSpace(1, "clockwise")).toBe(2);
      expect(nextSpace(4, "clockwise")).toBe(5);
      expect(nextSpace(12, "clockwise")).toBe(1);
    });

    it("walks the outer orbit counterclockwise", () => {
      expect(nextSpace(2, "counterclockwise")).toBe(1);
      expect(nextSpace(1, "counterclockwise")).toBe(12);
    });

    it("walks the inner orbit without leaving it", () => {
      expect(nextSpace(16, "clockwise")).toBe(13);
      expect(nextSpace(13, "counterclockwise")).toBe(16);
    });

    it("always steps to an adjacent space", () => {
      SPACE_IDS.forEach((id) => {
        expect(areAdjacent(id, nextSpace(id, "clockwise"))).toBe(true);
        expect(areAdjacent(id, nextSpace(id, "counterclockwise"))).toBe(true);
      });
    });
  });
});

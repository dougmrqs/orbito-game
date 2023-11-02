import { resolveAdjacency } from "../src/adjacency-resolver";

describe("Adjacency Resolver", () => {
  // 01 02 03 04
  // 12 13 14 05
  // 11 16 15 06
  // 10 09 08 07

  const adjacencies: [number, number[]][] = [
    [1, [2, 12]],
    [2, [1, 3, 13]],
    [3, [2, 4, 14]],
    [4, [3, 5]],
    [5, [4, 6, 14]],
    [6, [5, 7, 15]],
    [7, [6, 8]],
    [8, [7, 9, 15]],
    [9, [8, 10, 16]],
    [10, [9, 11]],
    [11, [10, 12, 16]],
    [12, [1, 11, 13]],
    [13, [2, 12, 14, 16]],
    [14, [3, 5, 13, 15]],
    [15, [6, 8, 14, 16]],
    [16, [9, 11, 13, 15]],
  ];

  describe("says that", () => {
    adjacencies.forEach(([a, bs]) => {
      const nonAdjacencies = [...Array(16).keys()]
        .map((n) => n + 1)
        .filter((b) => !bs.includes(b));

      bs.forEach((b) => {
        it(`${a} is adjacent to ${b}`, () => {
          expect(resolveAdjacency(a, b)).toEqual(true);
        });

        it(`${b} is adjacent to ${a}`, () => {
          expect(resolveAdjacency(b, a)).toEqual(true);
        });
      });

      nonAdjacencies.forEach((b) => {
        it(`${a} is not adjacent to ${b}`, () => {
          expect(resolveAdjacency(a, b)).toEqual(false);
        });

        it(`${b} is not adjacent to ${a}`, () => {
          expect(resolveAdjacency(b, a)).toEqual(false);
        });
      });
    });
  });
});

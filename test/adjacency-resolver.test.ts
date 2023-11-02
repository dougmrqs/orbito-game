import { resolveAdjacency } from "../src/adjacency-resolver";

describe("Adjacency Resolver", () => {
  // 00 01 02 03
  // 11 12 13 04
  // 10 15 14 05
  // 09 08 07 06

  const adjacencies: [number, number[]][] = [
    [0, [1, 11]],
    [1, [0, 2, 12]],
    [2, [1, 3, 13]],
    [3, [2, 4]],
    [4, [3, 5, 13]],
    [5, [4, 6, 14]],
    [6, [5, 7]],
    [7, [6, 8, 14]],
    [8, [7, 9, 15]],
    [9, [8, 10]],
    [10, [9, 11, 15]],
    [11, [0, 10, 12]],
    [12, [1, 11, 13, 15]],
    [13, [2, 4, 12, 14]],
    [14, [5, 7, 13, 15]],
    [15, [8, 10, 12, 14]],
  ];

  describe("says that", () => {
    adjacencies.forEach(([a, bs]) => {
      const nonAdjacencies = [...Array(16).keys()].filter(
        (b) => !bs.includes(b),
      );

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

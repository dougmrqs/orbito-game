import { makeGame, reverseOrbit } from "../src/game";
import { Player } from "../src/types";

describe("Game actions", () => {
  describe("#place", () => {
    it("places a piece to the board", () => {
      const game = makeGame();

      const board = game.board;

      const player = { color: "red" };
      const toSpace = game.board.innerOrbit[0];

      const newBoard = game.place(player, toSpace);

      expect(newBoard.innerOrbit[0].piece).toEqual({ player });
      expect(board.innerOrbit[0].piece).toEqual(null);
    });

    it("cannot place a piece to an occupied space", () => {
      const game = makeGame();

      const player = { color: "red" };

      const toSpace = game.board.innerOrbit[0];
      game.board.innerOrbit[0].piece = { player };

      expect(() => game.place(player, toSpace)).toThrowError(
        "Space is occupied",
      );
    });
  });

  describe("#move", () => {
    const player: Player = { color: "red" };

    it("moves a piece from a space to another", () => {
      const game = makeGame();
      game.board.innerOrbit[0] = {
        ...game.board.innerOrbit[0],
        piece: { player },
      };

      const fromSpace = game.board.innerOrbit[0];
      const toSpace = game.board.innerOrbit[1];

      game.move(fromSpace, toSpace);

      expect(game.board.innerOrbit[0].piece).toEqual(null);
      expect(game.board.innerOrbit[1].piece).toEqual({ player });
    });

    it("cannot move a piece from an empty space", () => {
      const game = makeGame();
      const fromSpace = game.board.innerOrbit[0];
      const toSpace = game.board.innerOrbit[1];

      expect(() => game.move(fromSpace, toSpace)).toThrowError(
        "Space is empty",
      );
    });

    it("cannot move a piece to an occupied space", () => {
      const game = makeGame();
      game.board.innerOrbit[0] = {
        ...game.board.innerOrbit[0],
        piece: { player },
      };
      game.board.innerOrbit[1] = {
        ...game.board.innerOrbit[1],
        piece: { player },
      };

      const fromSpace = game.board.innerOrbit[0];
      const toSpace = game.board.innerOrbit[1];

      expect(() => game.move(fromSpace, toSpace)).toThrowError(
        "Space is occupied",
      );
    });
  });

  // Being the initial inner orbit:
  // 0, 3, or linearly: 0, 1, 2, 3
  // 1, 2,
  // Should become:
  // 3, 2, or linearly: 3, 0, 1, 2
  // 0, 1,
  describe("#orbit", () => {
    it("moves positions one step in the orbit", () => {
      const game = makeGame();

      const newBoard = game.orbit();

      expect(newBoard.innerOrbit.map((space) => space.position)).toEqual([
        0, 1, 2, 3,
      ]);
      expect(newBoard.outerOrbit.map((space) => space.position)).toEqual([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
      ]);
    });

    it("does not mutate the original board", () => {
      const game = makeGame();

      const board = game.board;
      const newBoard = game.orbit();

      expect(newBoard.outerOrbit).not.toBe(board.outerOrbit);
    });

    it('does not lose the "piece" property', () => {
      const game = makeGame();
      const player = { color: "red" };

      const board = game.board;
      board.innerOrbit[0].piece = { player };

      game.orbit();

      expect(game.board.innerOrbit[1].piece).toEqual({ player });
    });

    it("carries the piece for many positions", () => {
      const game = makeGame();
      const player = { color: "red" };

      game.board.innerOrbit[0].piece = { player };

      game.orbit();
      game.orbit();
      game.orbit();

      expect(game.board.innerOrbit[3].piece).toEqual({ player });
    });
  });

  describe(".history", () => {
    it("keeps track of the moves", () => {
      const game = makeGame();
      const player = { color: "red" };

      const board0 = game.board;
      const board1 = game.place(player, board0.innerOrbit[0]);
      const board2 = game.orbit();

      expect(game.history).toEqual([board0, board1, board2]);
      expect(game.history[0].innerOrbit[0].piece).toEqual(null);
      expect(game.history[1].innerOrbit[0].piece).toEqual({ player });
      expect(game.history[2].innerOrbit[1].piece).toEqual({ player });
    });
  });

  describe("reverseOrbit", () => {
    it("carries the piece one step back in the orbit", () => {
      const game = makeGame();
      const player = { color: "red" };

      game.board.innerOrbit[0].piece = { player };

      const newBoard = reverseOrbit(game.board);

      expect(newBoard.innerOrbit.map((space) => space.piece)).toEqual([
        null,
        null,
        null,
        { player },
      ]);
    });
  });
});

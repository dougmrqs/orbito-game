import { Orbito } from "../src/orbito";

describe("Orbito Game", () => {
  describe("Game Turn", () => {
    describe("phase 1", () => {
      it("allows to move other player's piece to an adjacent space", () => {
        const orbito = new Orbito();

        // player 1 places a piece
        orbito.play({ toSpace: orbito.findSpaceById(13) });

        expect(orbito.findSpaceById(14).piece).toEqual({
          player: orbito.players[0],
        });

        // player 2 moves the piece
        orbito.play({
          fromSpace: orbito.findSpaceById(14),
          toSpace: orbito.findSpaceById(15),
        });

        expect(orbito.findSpaceById(14).piece).toEqual(null);
        expect(orbito.findSpaceById(15).piece).toEqual({
          player: orbito.players[0],
        });
      });

      it("allows player to place a piece after moving other player's piece", () => {
        const orbito = new Orbito();

        // player 1 places a piece
        orbito.play({ toSpace: orbito.findSpaceById(13) });

        // player 2 moves the piece
        orbito.play({
          fromSpace: orbito.findSpaceById(14),
          toSpace: orbito.findSpaceById(15),
        });

        // player 2 places a piece
        orbito.play({ toSpace: orbito.findSpaceById(13) });

        expect(orbito.game.board.findSpaceById(14).piece).toEqual({
          player: orbito.players[1],
        });
      });

      it("does not allow to move other player's piece to a non-adjacent space", () => {
        const orbito = new Orbito();

        // player 1 places a piece
        orbito.play({ toSpace: orbito.findSpaceById(13) });

        // player 2 moves the piece
        // 13 14
        // 16 15
        // 14 should not be able to move to 16
        const response = orbito.play({
          fromSpace: orbito.findSpaceById(14),
          toSpace: orbito.findSpaceById(16),
        });

        expect(response).toEqual({
          fault: "You can only move to an adjacent space",
          nextToPlay: orbito.players[1],
        });
        expect(orbito.findSpaceById(14).piece).toEqual({
          player: orbito.players[0],
        });
        expect(orbito.findSpaceById(16).piece).toEqual(null);
      });

      it("waits on players turn until it makes a valid move", () => {
        const orbito = new Orbito();

        // player 1 tries to move a piece
        const fromSpace = orbito.findSpaceById(13);
        const toSpace = orbito.findSpaceById(14);

        const response = orbito.play({
          fromSpace: fromSpace,
          toSpace: toSpace,
        });

        expect(response).toEqual({
          nextToPlay: orbito.players[0],
          fault: "There is no piece in the space",
        });
        expect(orbito.currentPlayer).toEqual(orbito.players[0]);
      });

      it("does not let player move twice, keeping the turn on the same player", () => {
        const orbito = new Orbito();

        // player 1 places a piece
        orbito.play({ toSpace: orbito.findSpaceById(13) });

        // player 2 moves the piece
        orbito.play({
          fromSpace: orbito.findSpaceById(14),
          toSpace: orbito.findSpaceById(15),
        });

        // player 2 tries to move the piece again
        const response = orbito.play({
          fromSpace: orbito.findSpaceById(15),
          toSpace: orbito.findSpaceById(16),
        });

        expect(response).toEqual({
          fault: "You can't move a piece now",
          nextToPlay: orbito.players[1],
        });
        expect(orbito.currentPlayer).toEqual(orbito.players[1]);
        expect(orbito.findSpaceById(16).piece).toEqual(null);
      });

      it("finishes players turn and orbits by placing a piece to anywhere disoccupied in the board", () => {
        const orbito = new Orbito();

        expect(orbito.currentPlayer).toEqual(orbito.players[0]);
        expect(orbito.game.board.innerOrbit).toEqual([
          { id: 13, position: 0, piece: null },
          { id: 14, position: 1, piece: null },
          { id: 15, position: 2, piece: null },
          { id: 16, position: 3, piece: null },
        ]);

        // player 1 places a piece
        const firstPlaySpace = orbito.findSpaceById(13);
        orbito.play({ toSpace: firstPlaySpace });

        expect(orbito.currentPlayer).toEqual(orbito.players[1]);
        expect(orbito.game.board.innerOrbit).toEqual([
          { id: 13, position: 0, piece: null },
          { id: 14, position: 1, piece: { player: orbito.players[0] } },
          { id: 15, position: 2, piece: null },
          { id: 16, position: 3, piece: null },
        ]);
      });
    });

    describe("phase 2", () => {
      it("allows to place a piece to anywhere disoccupied in the board", () => {
        const orbito = new Orbito();

        // player 1 places a piece
        orbito.play({ toSpace: orbito.findSpaceById(13) });

        // player 2 places a piece
        orbito.play({ toSpace: orbito.findSpaceById(15) });

        expect(orbito.game.board.findSpaceById(15).piece).toEqual({
          player: orbito.players[0],
        });
        expect(orbito.game.board.findSpaceById(16).piece).toEqual({
          player: orbito.players[1],
        });
      });

      it("does not allow to place a piece to an occupied space", () => {
        const orbito = new Orbito();

        // player 1 places a piece
        orbito.play({ toSpace: orbito.findSpaceById(13) });

        // player 2 tries to place a piece
        const response = orbito.play({ toSpace: orbito.findSpaceById(14) });

        expect(response).toEqual({
          fault: "Space is occupied",
          nextToPlay: orbito.players[1],
        });
        expect(orbito.game.board.findSpaceById(14).piece).toEqual({
          player: orbito.players[0],
        });
      });
    });
  });

  describe("Game End", () => {
    describe("checks for 4 aligned pieces of the same color", () => {
      it("checks horizontally", () => {
        const orbito = new Orbito();

        // sets pieces to be aligned horizontally after orbit
        // o o o x     o o o o
        // o x x x ==\ x x x x
        // x x x x ==/ x x x x
        // x x x x     x x x x

        orbito.findSpaceById(1).piece = { player: orbito.players[0] };
        orbito.findSpaceById(2).piece = { player: orbito.players[0] };
        orbito.findSpaceById(3).piece = { player: orbito.players[0] };

        // player 1 places a piece
        const response = orbito.play({ toSpace: orbito.findSpaceById(12) });

        expect(response.winner).toEqual(orbito.players[0]);
      });

      it("checks vertically", () => {
        const orbito = new Orbito();

        // sets pieces to be aligned horizontally after orbit
        // x x o o     x x x o
        // x x x o ==\ x x x o
        // x x x o ==/ x x x o
        // x x x x     x x x o

        orbito.findSpaceById(3).piece = { player: orbito.players[0] };
        orbito.findSpaceById(4).piece = { player: orbito.players[0] };
        orbito.findSpaceById(5).piece = { player: orbito.players[0] };

        // player 1 places a piece
        const response = orbito.play({ toSpace: orbito.findSpaceById(6) });

        expect(response.winner).toEqual(orbito.players[0]);
      });

      it("checks diagonally", () => {
        const orbito = new Orbito();

        // sets pieces to be aligned horizontally after orbit
        // x x o x     x x x o
        // x o x x ==\ x x o x
        // x x o x ==/ x o x x
        // x o x x     o x x x

        orbito.findSpaceById(3).piece = { player: orbito.players[0] };
        orbito.findSpaceById(13).piece = { player: orbito.players[0] };
        orbito.findSpaceById(15).piece = { player: orbito.players[0] };

        // player 1 places a piece
        const response = orbito.play({ toSpace: orbito.findSpaceById(9) });

        expect(response.winner).toEqual(orbito.players[0]);
      });
    });

    describe("when there is a draw", () => {
      it("draws if the two players have 4 aligned pieces of the same color", () => {
        const orbito = new Orbito();

        // sets pieces to be aligned horizontally after orbit
        // x x b b     a x x b
        // a x x b ==\ a x x b
        // a x x b ==/ a x x b
        // a a x x     a x x b

        [12, 11, 10].forEach((id) => {
          orbito.findSpaceById(id).piece = { player: orbito.players[0] };
        });
        [3, 4, 5, 6].forEach((id) => {
          orbito.findSpaceById(id).piece = { player: orbito.players[1] };
        });

        // player 1 places a piece
        const response = orbito.play({ toSpace: orbito.findSpaceById(9) });

        expect(response.winner).toEqual({ color: "draw" });
      });

      describe.skip("after all spaces are occupied", () => {
        it("shifts all the pieces 5 times", () => {
          const orbito = new Orbito();

          [3, 5, 7, 9, 11, 13, 15].forEach((id) => {
            orbito.findSpaceById(id).piece = { player: orbito.players[0] };
          });

          [2, 4, 6, 8, 10, 12, 14, 16].forEach((id) => {
            orbito.findSpaceById(id).piece = { player: orbito.players[1] };
          });

          // player 1 places a piece
          const response = orbito.play({ toSpace: orbito.findSpaceById(1) });

          const spy = jest.spyOn(orbito.game, "orbit");

          expect(spy).toHaveBeenCalledTimes(5);
          expect(response.winner).toEqual({ color: "draw" });
        });
      });

      // need to arrange piece distribution to achieve the desired result
      describe.skip("after shifting 5 times", () => {
        it("can have a winner", () => {
          const orbito = new Orbito();

          [3, 5, 7, 9, 11, 13, 15].forEach((id) => {
            orbito.findSpaceById(id).piece = { player: orbito.players[0] };
          });
          [2, 4, 6, 8, 10, 12, 14, 16].forEach((id) => {
            orbito.findSpaceById(id).piece = { player: orbito.players[1] };
          });

          // player 1 places a piece
          const response = orbito.play({ toSpace: orbito.findSpaceById(1) });

          const spy = jest.spyOn(orbito.game, "orbit");

          expect(spy).toHaveBeenCalledTimes(5);
          expect(response.winner).toEqual({ color: "draw" });
        });

        it("can have a draw", () => {
          const orbito = new Orbito();

          [3, 5, 7, 9, 11, 13, 15].forEach((id) => {
            orbito.findSpaceById(id).piece = { player: orbito.players[0] };
          });

          [2, 4, 6, 8, 10, 12, 14, 16].forEach((id) => {
            orbito.findSpaceById(id).piece = { player: orbito.players[1] };
          });

          // player 1 places a piece
          const response = orbito.play({ toSpace: orbito.findSpaceById(1) });

          const spy = jest.spyOn(orbito.game, "orbit");

          expect(spy).toHaveBeenCalledTimes(5);
          expect(response.winner).toEqual({ color: "draw" });
        });
      });
    });
  });
});

import { Orbito } from "../src/orbito";

describe("Orbito Game", () => {
  describe("Game Turn", () => {
    describe("phase 1", () => {
      it("allows to move other player's piece to an adjacent space", () => {
        const orbito = new Orbito();

        // player 1 places a piece
        const firstPlaySpace = orbito.findSpaceById(13);
        orbito.play({ toSpace: firstPlaySpace });

        expect(orbito.findSpaceById(firstPlaySpace.id).piece).toEqual({
          player: orbito.players[0],
        });

        // player 2 moves the piece
        const movePlaySpace = orbito.findSpaceById(14);
        orbito.play({ fromSpace: firstPlaySpace, toSpace: movePlaySpace });

        expect(orbito.findSpaceById(firstPlaySpace.id).piece).toEqual(null);
        expect(orbito.findSpaceById(movePlaySpace.id).piece).toEqual({
          player: orbito.players[0],
        });
      });

      it("allows player to place a piece after moving other player's piece", () => {
        const orbito = new Orbito();

        // player 1 places a piece
        const firstPlaySpace = orbito.findSpaceById(13);
        orbito.play({ toSpace: firstPlaySpace });

        // player 2 moves the piece
        const movePlaySpace = orbito.findSpaceById(14);
        orbito.play({ fromSpace: firstPlaySpace, toSpace: movePlaySpace });

        // player 2 places a piece
        const secondPlaySpace = orbito.findSpaceById(13);
        orbito.play({ toSpace: secondPlaySpace });

        expect(
          orbito.game.board.findSpaceById(secondPlaySpace.id).piece
        ).toEqual({
          player: orbito.players[1],
        });
      });

      it.skip("does not allow to move other player's piece to a non-adjacent space", () => {
        const orbito = new Orbito();

        // player 1 places a piece
        const firstPlaySpace = orbito.findSpaceById(13);
        orbito.play({ toSpace: firstPlaySpace });

        // player 2 moves the piece
        // 13 16 -> 16 15
        // 14 15 -> 13 14
        // 13 should not be able to move to 15
        const movePlaySpace = orbito.findSpaceById(15);
        orbito.play({ fromSpace: firstPlaySpace, toSpace: movePlaySpace });

        expect(orbito.findSpaceById(firstPlaySpace.id).piece).toEqual({
          player: orbito.players[0],
        });
        expect(orbito.findSpaceById(movePlaySpace.id).piece).toEqual(null);
      });

      it.skip("waits on players turn until it makes a valid move", () => {
        const orbito = new Orbito();

        // player 1 tries to move a piece
        const fromSpace = orbito.findSpaceById(13);
        const toSpace = orbito.findSpaceById(14);
        orbito.play({ fromSpace: fromSpace, toSpace: toSpace });

        expect(orbito.currentPlayer).toEqual(orbito.players[0]);
      });

      it("does not let player move twice, keeping the turn on the same player", () => {
        const orbito = new Orbito();

        // player 1 places a piece
        const firstPlaySpace = orbito.findSpaceById(13);
        orbito.play({ toSpace: firstPlaySpace });

        // player 2 moves the piece
        const movePlaySpace = orbito.findSpaceById(14);
        orbito.play({ fromSpace: firstPlaySpace, toSpace: movePlaySpace });

        // player 2 tries to move the piece again
        const secondMovePlaySpace = orbito.findSpaceById(15);
        orbito.play({ fromSpace: movePlaySpace, toSpace: secondMovePlaySpace });

        expect(orbito.currentPlayer).toEqual(orbito.players[1]);
        expect(orbito.findSpaceById(secondMovePlaySpace.id).piece).toEqual(
          null
        );
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
          { id: 13, position: 3, piece: { player: orbito.players[0] } },
          { id: 14, position: 0, piece: null },
          { id: 15, position: 1, piece: null },
          { id: 16, position: 2, piece: null },
        ]);
      });
    });

    describe("phase 2", () => {
      it("allows to place a piece to anywhere disoccupied in the board", () => {
        const orbito = new Orbito();

        // player 1 places a piece
        const firstPlaySpace = orbito.findSpaceById(13);
        orbito.play({ toSpace: firstPlaySpace });

        // player 2 places a piece
        const secondPlaySpace = orbito.findSpaceById(14);
        orbito.play({ toSpace: secondPlaySpace });

        expect(
          orbito.game.board.findSpaceById(secondPlaySpace.id).piece
        ).toEqual({
          player: orbito.players[1],
        });
      });
      it("does not allow to place a piece to an occupied space", () => {});
      it("does not allow a move play", () => {});
    });
  });

  describe.skip("Game End", () => {
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
      it("draws if the two players have 4 aligned pieces of the same color", () => {});

      it("shifts all the pieces 5 times", () => {});

      describe("after shifting 5 times", () => {
        it("can have a winner", () => {});

        it("can have a draw", () => {});
      });
    });
  });
});

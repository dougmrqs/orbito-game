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
        // // player 1 places a piece
        // const orbito = new Orbito();
        // const space = orbito.game.board.innerOrbit[0];
        // orbito.play({ toSpace: space });
        // expect(orbito.game.board.findSpace(space.id).piece).toEqual({
        //   player: orbito.players[0],
        // });
        // // player 2 moves the piece
        // const space2 = orbito.game.board.innerOrbit[1];
        // orbito.play({ fromSpace: space, toSpace: space2 });
        // expect(orbito.game.board.findSpace(space.id).piece).toEqual(null);
        // expect(orbito.game.board.findSpace(space2.id).piece).toEqual({
        //   player: orbito.players[0],
        // });
        // // player 2 places a piece
        // const space3 = orbito.game.board.innerOrbit[3];
        // orbito.play({ toSpace: space3 });
        // orbito.presentBoard();
        // expect(orbito.game.board.findSpace(space3.id).piece).toEqual({
        //   player: orbito.players[1],
        // });
      });

      it("does not allow to move other player's piece to a non-adjacent space", () => {});

      it("finishes players turn and orbits by placing a piece to anywhere disoccupied in the board", () => {
        const orbito = new Orbito();
      });
    });

    describe("phase 2", () => {
      it("allows to place a piece to anywhere disoccupied in the board", () => {});
    });

    describe("phase 3", () => {
      it("shifts all the pieces one space forward at the end of the turn", () => {});
    });
  });

  describe("Game End", () => {
    describe("checks for 4 aligned pieces of the same color", () => {
      it("checks horizontally", () => {});

      it("checks vertically", () => {});

      it("checks diagonally", () => {});
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

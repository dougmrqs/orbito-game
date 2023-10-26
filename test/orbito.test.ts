describe("Orbito Game", () => {
  describe("Game Turn", () => {
    describe("phase 1", () => {
      it("allows to move other player's piece to an adjacent space", () => {});

      it("allows to skip to phase 3 by placing a piece to anywhere disoccupied in the board", () => {});
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

import { Orbito } from "../../src/orbito";
import { Board, Space } from "../../src/types";
import { resolveWinner, POSSIBLE_WINS } from "../../src/lib/win-resolver";

describe("Win Resolver", () => {
  describe("player wins when", () => {
    function findSpaces(board: Board, positionIds: number[]): Space[] {
      return positionIds.map((positionId) => board.findSpaceById(positionId));
    }

    // [[12, 13, 14, 5]].forEach((win) => {
    POSSIBLE_WINS.forEach((win) => {
      it(`player wins when positioned at ${win}`, () => {
        const orbito = new Orbito();
        const player = orbito.currentPlayer;

        const spaces = findSpaces(orbito.game.board, win);
        spaces.forEach((space) => {
          space.piece = { player };
        });

        expect(resolveWinner(orbito.game.board)).toBe(player);
      });
    });
  });
});

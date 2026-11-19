import { marbleAt } from "../../src/engine";
import {
  GameState,
  createGame,
  moveOpponentMarble,
  placeMarble,
  pressOrbit,
} from "../../src/rules";
import { boardFrom, picture } from "../support/boards";

// 01 02 03 04
// 12 13 14 05
// 11 16 15 06
// 10 09 08 07

function takeTurn(state: GameState, spaceId: number): GameState {
  return pressOrbit(placeMarble(state, spaceId));
}

describe("Game", () => {
  it("starts with an empty board and black to play", () => {
    const game = createGame();

    expect(picture(game.board)).toEqual(["....", "....", "....", "...."]);
    expect(game.currentPlayer).toBe("black");
    expect(game.phase).toBe("move-or-place");
  });

  describe("moving the opponent's marble", () => {
    // black has placed on 13, which the orbit carried to 14
    const whiteToPlay = takeTurn(createGame(), 13);

    it("allows to move the other player's marble to an adjacent space", () => {
      const game = moveOpponentMarble(whiteToPlay, 14, 15);

      expect(marbleAt(game.board, 14)).toBeNull();
      expect(marbleAt(game.board, 15)).toMatchObject({ owner: "black" });
    });

    it("keeps the turn on the same player, who must now place", () => {
      const game = moveOpponentMarble(whiteToPlay, 14, 15);

      expect(game.currentPlayer).toBe("white");
      expect(game.phase).toBe("place");
    });

    it("does not let the player move twice", () => {
      const game = moveOpponentMarble(whiteToPlay, 14, 15);

      expect(() => moveOpponentMarble(game, 15, 16)).toThrow(
        "You can't move a marble now",
      );
    });

    it("does not allow to move to a non-adjacent space", () => {
      expect(() => moveOpponentMarble(whiteToPlay, 14, 16)).toThrow(
        "You can only move to an adjacent space",
      );
    });

    it("does not allow to move from an empty space", () => {
      expect(() => moveOpponentMarble(whiteToPlay, 1, 2)).toThrow(
        "There is no marble in the space",
      );
    });

    it("does not allow to move your own marble", () => {
      const blackToPlay = takeTurn(whiteToPlay, 1);

      expect(() => moveOpponentMarble(blackToPlay, 15, 16)).toThrow(
        "You can't move your own marble",
      );
    });

    it("does not allow to move to an occupied space", () => {
      const blackToPlay = takeTurn(whiteToPlay, 1);
      const whiteAgain = takeTurn(blackToPlay, 1);

      // black sits on 2 and 16, white on 3
      expect(picture(whiteAgain.board)).toEqual([
        ".bw.",
        "....",
        ".b..",
        "....",
      ]);
      expect(() => moveOpponentMarble(whiteAgain, 2, 3)).toThrow(
        "Space is occupied",
      );
    });
  });

  describe("placing a marble", () => {
    it("allows to place a marble on any empty space", () => {
      const game = placeMarble(createGame(), 7);

      expect(marbleAt(game.board, 7)).toMatchObject({ owner: "black" });
      expect(game.placed).toEqual({ black: 1, white: 0 });
    });

    it("allows to place after moving the other player's marble", () => {
      const whiteToPlay = takeTurn(createGame(), 13);

      const game = placeMarble(moveOpponentMarble(whiteToPlay, 14, 15), 14);

      expect(marbleAt(game.board, 14)).toMatchObject({ owner: "white" });
    });

    it("does not allow to place on an occupied space", () => {
      const whiteToPlay = takeTurn(createGame(), 13);

      expect(() => placeMarble(whiteToPlay, 14)).toThrow("Space is occupied");
    });

    it("gives every marble its own id", () => {
      const game = placeMarble(takeTurn(createGame(), 1), 1);

      expect(marbleAt(game.board, 2)).toEqual({ id: 1, owner: "black" });
      expect(marbleAt(game.board, 1)).toEqual({ id: 2, owner: "white" });
    });

    it("waits for the button before the turn ends", () => {
      const game = placeMarble(createGame(), 7);

      expect(game.currentPlayer).toBe("black");
      expect(game.phase).toBe("orbit");
      expect(() => placeMarble(game, 8)).toThrow(
        "You can't place a marble now",
      );
      expect(() => moveOpponentMarble(game, 7, 8)).toThrow(
        "You can't move a marble now",
      );
    });
  });

  describe("pressing the button", () => {
    it("cannot be pressed before placing a marble", () => {
      expect(() => pressOrbit(createGame())).toThrow(
        "Place a marble before pressing the button",
      );
    });

    it("shifts every marble one space along its orbit", () => {
      const game: GameState = {
        ...createGame(),
        board: boardFrom(["b..w", ".b..", "..w.", "...."]),
        phase: "orbit",
      };

      expect(picture(pressOrbit(game).board)).toEqual([
        ".b..",
        "..bw",
        ".w..",
        "....",
      ]);
    });

    it("passes the turn to the other player", () => {
      const game = takeTurn(createGame(), 1);

      expect(game.currentPlayer).toBe("white");
      expect(game.phase).toBe("move-or-place");
    });
  });

  describe("game end", () => {
    function aboutToOrbit(rows: [string, string, string, string]): GameState {
      return { ...createGame(), board: boardFrom(rows), phase: "orbit" };
    }

    it("checks horizontally", () => {
      const game = pressOrbit(aboutToOrbit(["bbb.", "b...", "....", "...."]));

      expect(picture(game.board)[0]).toBe("bbbb");
      expect(game.outcome).toEqual({ kind: "win", winner: "black" });
      expect(game.phase).toBe("over");
    });

    it("checks vertically", () => {
      const game = pressOrbit(aboutToOrbit(["..ww", "...w", "...w", "...."]));

      expect(game.outcome).toEqual({ kind: "win", winner: "white" });
    });

    it("checks diagonally", () => {
      const game = pressOrbit(aboutToOrbit(["....", "b.b.", ".b.b", "...."]));

      expect(picture(game.board)).toEqual(["b...", ".b..", "..b.", "...b"]);
      expect(game.outcome).toEqual({ kind: "win", winner: "black" });
    });

    it("only counts the line after the orbit", () => {
      const game = pressOrbit(aboutToOrbit(["bbbb", "....", "....", "...."]));

      expect(game.outcome).toBeNull();
    });

    it("draws if the two players have a line at the same time", () => {
      // b . w w      b b . w
      // b . . w  =>  b . . w
      // b . . w  =>  b . . w
      // b . . .      b . . w
      const game = pressOrbit(aboutToOrbit(["..ww", "b..w", "b..w", "bb.."]));

      expect(game.outcome).toEqual({ kind: "draw" });
      expect(game.phase).toBe("over");
    });

    it("allows nothing once the game is over", () => {
      const game = pressOrbit(aboutToOrbit(["bbb.", "b...", "....", "...."]));

      expect(() => placeMarble(game, 16)).toThrow(
        "You can't place a marble now",
      );
      expect(() => pressOrbit(game)).toThrow();
    });

    describe("after all spaces are occupied", () => {
      // no line shows up in any rotation of this board
      const full = aboutToOrbit(["wbwb", "bbww", "bwwb", "bwbw"]);

      it("keeps the button with the same player", () => {
        const game = pressOrbit(full);

        expect(game.phase).toBe("orbit");
        expect(game.currentPlayer).toBe("black");
        expect(game.finalOrbitsLeft).toBe(5);
      });

      it("draws after 5 more shifts without a line", () => {
        let game = pressOrbit(full);

        for (let press = 1; press < 5; press++) {
          game = pressOrbit(game);
          expect(game.outcome).toBeNull();
        }

        game = pressOrbit(game);

        expect(game.outcome).toEqual({ kind: "draw" });
        expect(game.phase).toBe("over");
      });

      it("can have a winner while shifting", () => {
        // white lines up on the second press
        const game = pressOrbit(
          pressOrbit(aboutToOrbit(["bbwb", "wbbw", "bwwb", "wwbw"])),
        );

        expect(game.outcome).toEqual({ kind: "win", winner: "white" });
      });
    });
  });
});

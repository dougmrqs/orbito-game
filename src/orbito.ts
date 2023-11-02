import { resolveAdjacency } from "./adjacency-resolver";
import { resolveWinner } from "./win-resolver";
import { Game, Player, Space } from "./types";
import { makeGame } from "./game";

type Play =
  | {
      fromSpace: Space;
      toSpace: Space;
    }
  | {
      toSpace: Space;
    };

type PlayResponse =
  | {
      nextToPlay: Player;
      fault?: string;
      winner?: never;
    }
  | {
      nextToPlay?: never;
      fault?: never;
      winner: Player;
    };

class Orbito {
  game: Game;
  players: [Player, Player];
  playerToggle: 0 | 1;
  gamePhase: 1 | 2;

  constructor() {
    this.game = makeGame();
    this.players = [{ color: "black" }, { color: "white" }];
    this.playerToggle = 0;
    this.gamePhase = 1;
  }

  get currentPlayer() {
    return this.players[this.playerToggle];
  }

  findSpaceById(id: number): Space {
    return this.game.board.findSpaceById(id);
  }

  play(play: Play): PlayResponse {
    if (this.gamePhase === 1) {
      const response = this.handlePhaseOne(play);
      if (response) {
        return response;
      }
    } else if (this.gamePhase === 2) {
      const response = this.handlePhaseTwo(play);
      if (response) {
        return response;
      }
    }

    const winnerPlayer = resolveWinner(this.game.board);

    if (winnerPlayer) {
      return { winner: winnerPlayer };
    }

    return { nextToPlay: this.currentPlayer };
  }

  presentBoard() {
    console.log(this.game.board.innerOrbit, this.game.board.outerOrbit);
  }

  private handlePhaseOne(play: Play): PlayResponse | undefined {
    if ("fromSpace" in play) {
      const response = this.move(play);

      if ("fault" in response) {
        return response;
      } else {
        this.gamePhase = 2;
      }
    } else {
      const response = this.place(play);
      if ("fault" in response) {
        return response;
      }
    }
  }

  private handlePhaseTwo(play: Play): PlayResponse {
    if ("fromSpace" in play) {
      return {
        nextToPlay: this.currentPlayer,
        fault: "You can't move a piece now",
      };
    }

    const response = this.place(play);
    if ("fault" in response) {
      return response;
    }

    this.gamePhase = 1;
    return { nextToPlay: this.currentPlayer };
  }

  private move(play: Play): PlayResponse {
    try {
      this.moveOpponentsPiece(play);

      return { nextToPlay: this.currentPlayer };
    } catch (err: any) {
      return { nextToPlay: this.currentPlayer, fault: err.message };
    }
  }

  private place(play: Play): PlayResponse {
    try {
      this.placeCurrentPlayersPiece(play);
      this.nextPlayer();
      this.orbit();

      return { nextToPlay: this.currentPlayer };
    } catch (err: any) {
      return { nextToPlay: this.currentPlayer, fault: err.message };
    }
  }

  private orbit() {
    this.game.orbit();
  }

  private nextPlayer() {
    this.playerToggle = this.playerToggle === 0 ? 1 : 0;
    this.gamePhase = 1;
  }

  private moveOpponentsPiece(play: Play) {
    if (!("fromSpace" in play)) {
      throw new Error("You must specify a from space");
    }

    const currentPlayer = this.currentPlayer;

    const currentSpace = this.game.board.findSpaceById(play.fromSpace.id);

    if (!currentSpace.piece) {
      throw new Error("There is no piece in the space");
    }

    if (currentSpace.piece.player === currentPlayer) {
      throw new Error("You can't move your own piece");
    }

    if (!resolveAdjacency(play.fromSpace.id, play.toSpace.id)) {
      throw new Error("You can only move to an adjacent space");
    }

    return this.game.move(play.fromSpace, play.toSpace);
  }

  private placeCurrentPlayersPiece(play: Play) {
    const currentPlayer = this.currentPlayer;

    return this.game.place(currentPlayer, play.toSpace);
  }
}

export { Orbito };

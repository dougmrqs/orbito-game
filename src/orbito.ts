import { Game, Player, Space, Play, PlayResponse } from "./types";
import { resolveAdjacency } from "./lib/adjacency-resolver";
import { resolveWinner } from "./lib/win-resolver";
import { makeGame } from "./game";

import { listenToEvents } from "./events/event-listener";
import { presentBoard } from "./lib/board-presenter";
import { makeEventEmitter } from "./events/event-emitter";

class Orbito {
  game: Game;
  players: [Player, Player];
  playerToggle: 0 | 1;
  gamePhase: 1 | 2;
  eventEmitter: ReturnType<typeof makeEventEmitter>;

  constructor() {
    this.game = makeGame();
    this.players = [{ color: "black" }, { color: "white" }];
    this.playerToggle = 0;
    this.gamePhase = 1;
    this.eventEmitter = makeEventEmitter();

    // listenToEvents();

    this.eventEmitter.start();
  }

  get currentPlayer() {
    return this.players[this.playerToggle];
  }

  findSpaceById(id: number): Space {
    return this.game.board.findSpaceById(id);
  }

  play(play: Play): PlayResponse {
    this.eventEmitter.play({ player: this.currentPlayer });

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

    const isBoardFull = this.checkBoardFull();

    if (isBoardFull) {
      for (let i = 0; i < 5; i++) {
        this.orbit();
      }
    }

    const winner = this.resolveWinner();

    if (winner) {
      return { winner: winner };
    }

    return { nextToPlay: this.currentPlayer };
  }

  presentBoard() {
    return presentBoard.call(this);
  }

  orbit() {
    this.eventEmitter.orbit();
    this.game.orbit();
  }

  private checkBoardFull() {
    const isFull =
      this.game.board.innerOrbit.every((space) => space.piece) &&
      this.game.board.outerOrbit.every((space) => space.piece);

    if (isFull) this.eventEmitter.full();

    return isFull;
  }

  private resolveWinner() {
    const winner = resolveWinner(this.game.board);

    if (winner) {
      winner.color === "draw"
        ? this.eventEmitter.draw({ player: winner })
        : this.eventEmitter.win({ player: winner });
    }

    return winner;
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
    this.eventEmitter.move({ player: this.currentPlayer, play: play });

    try {
      this.moveOpponentsPiece(play);

      return { nextToPlay: this.currentPlayer };
    } catch (err: any) {
      return { nextToPlay: this.currentPlayer, fault: err.message };
    }
  }

  private place(play: Play): PlayResponse {
    this.eventEmitter.place({ player: this.currentPlayer, play: play });

    try {
      this.placeCurrentPlayersPiece(play);
      this.nextPlayer();
      this.orbit();

      return { nextToPlay: this.currentPlayer };
    } catch (err: any) {
      return { nextToPlay: this.currentPlayer, fault: err.message };
    }
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

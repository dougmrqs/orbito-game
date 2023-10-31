import { Game, Player, Space } from "./types";
import { makeGame } from "./game";

type MovePlay = {
  fromSpace: Space;
  toSpace: Space;
};

type PlacePlay = {
  toSpace: Space;
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

  play(play: MovePlay | PlacePlay) {
    if (this.gamePhase === 1) {
      if ("fromSpace" in play) {
        this.move(play);
        this.gamePhase = 2;
      } else {
        this.place(play);
      }
    } else if (this.gamePhase === 2) {
      this.place(play);
      this.gamePhase = 1;
    }

    return;
  }

  presentBoard() {
    console.log(this.game.board.innerOrbit, this.game.board.outerOrbit);
  }

  private move(play: MovePlay) {
    try {
      this.moveOpponentsPiece(play);
    } catch (err) {
      console.error(err);
    }

    return;
  }

  private place(play: PlacePlay) {
    try {
      this.placeCurrentPlayersPiece(play);
      this.nextPlayer();
      this.orbit();
    } catch (err) {
      console.error(err);
    }

    return;
  }

  private orbit() {
    this.game.orbit();
  }

  private nextPlayer() {
    this.playerToggle = this.playerToggle === 0 ? 1 : 0;
    this.gamePhase = 1;
  }

  private moveOpponentsPiece(play: MovePlay) {
    const currentPlayer = this.currentPlayer;

    const currentSpace = this.game.board.findSpaceById(play.fromSpace.id);

    if (!currentSpace.piece) {
      throw new Error("There is no piece in the space");
    }

    if (currentSpace.piece.player === currentPlayer) {
      throw new Error("You can't move your own piece");
    }

    return this.game.move(play.fromSpace, play.toSpace);
  }

  private placeCurrentPlayersPiece(play: PlacePlay) {
    const currentPlayer = this.currentPlayer;

    return this.game.place(currentPlayer, play.toSpace);
  }
}

export { Orbito };

import { Game, Player, Space } from "./types";
import { makeGame } from "./game";

type MovePlay = {
  fromSpace: Space;
  toSpace: Space;
};

type PlacePlay = {
  toSpace: Space;
};

type PlayResponse = {
  nextToPlay?: Player;
  winner?: Player;
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

  play(play: MovePlay | PlacePlay): PlayResponse {
    if (this.gamePhase === 1) {
      if ("fromSpace" in play) {
        this.move(play);
        this.gamePhase = 2;
      } else {
        this.place(play);
      }
    } else if (this.gamePhase === 2) {
      if ("fromSpace" in play) {
        return { nextToPlay: this.currentPlayer };
      }

      this.place(play);
      this.gamePhase = 1;
    }

    // check if game is over
    if (this.checkWinner()) {
      return { winner: this.currentPlayer };
    }

    return { nextToPlay: this.currentPlayer };
  }

  presentBoard() {
    console.log(this.game.board.innerOrbit, this.game.board.outerOrbit);
  }

  private checkWinner(): Player | null {
    return null;
  }

  private move(play: MovePlay): boolean {
    try {
      this.moveOpponentsPiece(play);

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  private place(play: PlacePlay): boolean {
    try {
      this.placeCurrentPlayersPiece(play);
      this.nextPlayer();
      this.orbit();

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
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

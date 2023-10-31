import { Game, Space } from "./types";

type MovePlay = {
  fromSpace: Space;
  toSpace: Space;
};

type PlacePlay = {
  toSpace: Space;
};

function moveOpponentsPiece(game: Game, play: MovePlay) {
  const currentPlayer = game.currentPlayer;

  const currentSpace = game.board.findSpaceById(play.fromSpace.id);

  if (!currentSpace.piece) {
    throw new Error("There is no piece in the space");
  }

  if (currentSpace.piece.player === currentPlayer) {
    throw new Error("You can't move your own piece");
  }

  return game.move(play.fromSpace, play.toSpace);
}

function placeCurrentPlayersPiece(game: Game, play: PlacePlay) {
  const currentPlayer = game.currentPlayer;

  return game.place(currentPlayer, play.toSpace);
}

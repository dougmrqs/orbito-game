import { makeBoard } from "./board";
import { Board, Game, Orbit, Player, Space } from "./types";

function makePlacePiece(board: Board) {
  return (player: Player, toSpace: Space): Board => {
    const currentSpace = board.findSpace(toSpace.id);

    if (currentSpace.piece) {
      throw new Error("Space is occupied");
    }

    const boardCopy = makeBoard(board.innerOrbit, board.outerOrbit);

    const space = boardCopy.findSpace(toSpace.id);

    space.piece = { player };

    return boardCopy;
  };
}

function makeMovePiece(board: Board) {
  return (fromSpace: Space, toSpace: Space): Board => {
    const currentFromSpace = board.findSpace(fromSpace.id);
    const currentToSpace = board.findSpace(toSpace.id);

    if (!currentFromSpace.piece) {
      throw new Error("Space is empty");
    }

    if (currentToSpace.piece) {
      throw new Error("Space is occupied");
    }

    const boardCopy = makeBoard(board.innerOrbit, board.outerOrbit);

    const newFromSpace = boardCopy.findSpace(fromSpace.id);
    const newToSpace = boardCopy.findSpace(toSpace.id);

    newFromSpace.piece = null;
    newToSpace.piece = currentFromSpace.piece;

    return boardCopy;
  };
}

function orbit(orbit: Orbit): Orbit {
  return orbit.map((space, index) => {
    const nextSpace = orbit[index + 1] || orbit[0];

    return {
      ...space,
      position: nextSpace.position,
    };
  });
}

function makeRunOrbit(board: Board) {
  return function (): Board {
    const { innerOrbit, outerOrbit } = board;

    const newInnerOrbit = orbit(innerOrbit);
    const newOuterOrbit = orbit(outerOrbit);

    console.log("run orbit");
    console.log(innerOrbit);

    return makeBoard(newInnerOrbit, newOuterOrbit);
  };
}

function changeGameStateDecorator(wrapped: Function) {
  return function (this: Game) {
    const board: Board = wrapped.call(this, ...arguments);

    this.board = board;
    this.history.push(board);

    this.move = changeGameStateDecorator(makeMovePiece(board));
    this.place = changeGameStateDecorator(makePlacePiece(board));
    this.orbit = changeGameStateDecorator(makeRunOrbit(board));

    return board;
  };
}

function makeGame(): Game {
  const board = makeBoard();

  return {
    currentPlayer: { color: "red" },
    history: [board],
    board: board,

    move: changeGameStateDecorator(makeMovePiece(board)),
    place: changeGameStateDecorator(makePlacePiece(board)),
    orbit: changeGameStateDecorator(makeRunOrbit(board)),
  };
}

export { makeGame, makeRunOrbit };

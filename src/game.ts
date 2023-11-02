import { makeBoard } from "./board";
import { Board, Game, Orbit, Player, Space } from "./types";

function makePlacePiece(board: Board) {
  return (player: Player, toSpace: Space): Board => {
    const currentSpace = board.findSpaceById(toSpace.id);

    if (currentSpace.piece) {
      throw new Error("Space is occupied");
    }

    const boardCopy = makeBoard(board.innerOrbit, board.outerOrbit);

    const space = boardCopy.findSpaceById(toSpace.id);

    space.piece = { player };

    return boardCopy;
  };
}

function makeMovePiece(board: Board) {
  return (fromSpace: Space, toSpace: Space): Board => {
    const currentFromSpace = board.findSpaceById(fromSpace.id);
    const currentToSpace = board.findSpaceById(toSpace.id);

    if (!currentFromSpace.piece) {
      throw new Error("Space is empty");
    }

    if (currentToSpace.piece) {
      throw new Error("Space is occupied");
    }

    const boardCopy = makeBoard(board.innerOrbit, board.outerOrbit);

    const newFromSpace = boardCopy.findSpaceById(fromSpace.id);
    const newToSpace = boardCopy.findSpaceById(toSpace.id);

    newFromSpace.piece = null;
    newToSpace.piece = currentFromSpace.piece;

    return boardCopy;
  };
}

function makeRunOrbit(board: Board) {
  function orbit(orbit: Orbit): Orbit {
    const newOrbit = new Array(orbit.length);

    orbit
      .map((space, index) => {
        const nextIndex = index + 1;

        const nextSpace = orbit[nextIndex];

        if (nextSpace) {
          return {
            ...nextSpace,
            piece: space.piece,
          };
        }

        return {
          ...orbit[0],
          piece: space.piece,
        };
      })
      .forEach((space) => {
        newOrbit[space.position] = space;
      });

    return newOrbit;
  }

  return function (): Board {
    const { innerOrbit, outerOrbit } = board;

    const newInnerOrbit = orbit(innerOrbit);
    const newOuterOrbit = orbit(outerOrbit);

    return makeBoard(newInnerOrbit, newOuterOrbit);
  };
}

function changeGameStateDecorator(wrapped: Function) {
  return function (this: Game) {
    const board: Board = wrapped.call(this, ...arguments);

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
    history: [board],

    get board() {
      return this.history[this.history.length - 1];
    },

    move: changeGameStateDecorator(makeMovePiece(board)),
    place: changeGameStateDecorator(makePlacePiece(board)),
    orbit: changeGameStateDecorator(makeRunOrbit(board)),
  };
}

export { makeGame, makeRunOrbit };

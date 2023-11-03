type Game = {
  history: Board[];
  board: Board;

  move: (fromSpace: Space, toSpace: Space) => Board;
  place: (player: Player, toSpace: Space) => Board;
  orbit: () => Board;
};

type Board = {
  innerOrbit: Orbit;
  outerOrbit: Orbit;

  findSpaceById: (id: number) => Space;
};

type Player = {
  color: string;
};

type Piece = {
  player: Player;
};

type Space = {
  id: number;
  position: number;
  piece: Piece | null;
};

type Orbit = Space[];

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

enum EventTypes {
  START = "START",
  PLAY = "PLAY",
  MOVE = "MOVE",
  PLACE = "PLACE",
  WIN = "WIN",
  DRAW = "DRAW",
  ORBIT = "ORBIT",
  FULL = "FULL",
}

type GameEvent =
  | {
      player: Player;
    }
  | {
      player: Player;
      play: Play;
    }
  | {
      response: PlayResponse;
    };

export {
  Game,
  Board,
  Player,
  Piece,
  Space,
  Orbit,
  Play,
  PlayResponse,
  EventTypes,
  GameEvent,
};

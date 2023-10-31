type Game = {
  currentPlayer: Player;
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

export { Game, Board, Player, Piece, Space, Orbit };

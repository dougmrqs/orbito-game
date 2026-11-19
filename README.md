# Marble Orbit

A two-player marble game on a 4x4 board whose spaces sit on two orbits. It runs
in the browser as a static page, drawn with three.js, and keeps the current game
in `localStorage`.

## How a turn goes

1. Optionally move one of your opponent's marbles to an empty space next to it.
2. Place one of your own marbles on any empty space.
3. Press the centre button: every marble shifts one space along its orbit.

Four of your marbles in a row (horizontal, vertical or diagonal) after a press
wins. If both players line up on the same press, it is a draw. When the board
is full, the button is pressed up to five more times before the game is called
a draw.

On the page: click an empty space to place, click an opponent's marble to pick
it up and then a highlighted space to move it, and click the centre button to
turn the board. Drag to look around.

## Running it

Needs Node 22.12 or newer (see `.nvmrc`).

```sh
npm install
npm run dev      # dev server with reload
npm test         # engine and rules tests
npm run build    # static page in dist/
npm run preview  # serve dist/ locally
```

## How the code is split

```
src/engine/   what is physically possible on the board
src/rules/    what a player is allowed to do, and how the game ends
src/web/      the page: three.js view, text around it, local save
```

- **Engine** (`src/engine`): the board layout (space ids, the two orbits,
  adjacency) and three operations on a board: `place`, `move` and `orbit`. It
  knows nothing about players, turns or winning. Boards are immutable data.
- **Rules** (`src/rules`): the turn phases, whose marble may be moved where,
  which way the board turns (`ORBIT_DIRECTION`), and the outcome. Each action
  takes a game state and returns a new one, or throws a `RuleViolation`.
- **Web** (`src/web`): `scene.ts` draws any board it is given and reports what
  was clicked; `main.ts` turns clicks into rules actions; `storage.ts` saves and
  restores the game.

Space ids, as seen from above:

```
01 02 03 04
12 13 14 05
11 16 15 06
10 09 08 07
```

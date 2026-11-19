// Wires the page together: the rules decide what a click means, the view shows
// the result.

import "./style.css";

import {
  EngineError,
  SPACE_IDS,
  SpaceId,
  areAdjacent,
  marbleAt,
} from "../engine";
import {
  GameState,
  ORBIT_DIRECTION,
  PlayerId,
  RuleViolation,
  createGame,
  moveOpponentMarble,
  placeMarble,
  pressOrbit,
} from "../rules";
import { createHud } from "./hud";
import { Pick, createBoardView } from "./scene";

const MARBLE_COLORS: Record<PlayerId, number> = {
  black: 0x17171c,
  white: 0xe9e4d8,
};

const stage = document.getElementById("stage")!;
const view = createBoardView(stage, {
  direction: ORBIT_DIRECTION,
  marbleColors: MARBLE_COLORS,
});
const hud = createHud({
  black: `#${MARBLE_COLORS.black.toString(16)}`,
  white: `#${MARBLE_COLORS.white.toString(16)}`,
});

let game = createGame();
/** The opponent's marble picked up to be moved, if any. */
let selected: SpaceId | null = null;
let message = "";

function render({ animate = true } = {}) {
  const targets =
    selected === null
      ? []
      : SPACE_IDS.filter(
          (id) => areAdjacent(selected!, id) && !marbleAt(game.board, id),
        );

  view.sync(game.board, { animate });
  view.setHighlights({
    selected,
    targets,
    buttonArmed: game.phase === "orbit",
  });
  hud.render(game, message);
}

/** Applies a rules action; a refused action only leaves a message. */
function attempt(action: (game: GameState) => GameState): boolean {
  try {
    game = action(game);
    message = "";

    return true;
  } catch (error) {
    if (!(error instanceof RuleViolation || error instanceof EngineError)) {
      throw error;
    }

    message = error.message;

    return false;
  }
}

function clickSpace(spaceId: SpaceId) {
  const marble = marbleAt(game.board, spaceId);
  const canPickUp =
    game.phase === "move-or-place" &&
    marble !== null &&
    marble.owner !== game.currentPlayer;

  if (spaceId === selected) {
    selected = null;
  } else if (canPickUp) {
    selected = spaceId;
    message = "";
  } else if (selected !== null) {
    const from = selected;

    if (attempt((game) => moveOpponentMarble(game, from, spaceId))) {
      selected = null;
    }
  } else if (marble && game.phase === "move-or-place") {
    message = "You can't move your own marble";
  } else {
    attempt((game) => placeMarble(game, spaceId));
  }
}

function click(pick: Pick) {
  if (!pick) {
    selected = null;
  } else if (pick.kind === "button") {
    selected = null;
    view.pressButton();
    attempt(pressOrbit);
  } else {
    clickSpace(pick.spaceId);
  }

  render();
}

// a click is a press and release in the same spot; a drag turns the camera
let pressedAt: { x: number; y: number } | null = null;

stage.addEventListener("pointerdown", (event) => {
  pressedAt = { x: event.clientX, y: event.clientY };
});

stage.addEventListener("pointerup", (event) => {
  const moved = pressedAt
    ? Math.hypot(event.clientX - pressedAt.x, event.clientY - pressedAt.y)
    : Infinity;

  pressedAt = null;

  if (moved < 6) click(view.pick(event.clientX, event.clientY));
});

stage.addEventListener("pointermove", (event) => {
  stage.style.cursor = view.pick(event.clientX, event.clientY)
    ? "pointer"
    : "grab";
});

document.getElementById("new-game")!.addEventListener("click", () => {
  game = createGame();
  selected = null;
  message = "";
  render();
});

render({ animate: false });

if (import.meta.env.DEV) {
  Object.assign(window, { view, getGame: () => game });
}

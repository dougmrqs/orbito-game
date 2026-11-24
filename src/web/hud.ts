// The text around the board: whose turn it is and what they can do next.

import { GameState, MARBLES_PER_PLAYER, PlayerId, opponentOf } from "../rules";

const NAMES: Record<PlayerId, string> = { black: "Black", white: "White" };

function hint(game: GameState): string {
  switch (game.phase) {
    case "move-or-place":
      return `Place a marble, or first move one of ${
        NAMES[opponentOf(game.currentPlayer)]
      }'s to a space next to it`;
    case "place":
      return "Now place your marble";
    case "orbit":
      return game.finalOrbitsLeft === null
        ? "Press the centre button to turn the board"
        : `The board is full: press the button (${game.finalOrbitsLeft} left)`;
    case "over":
      return "Start a new game to play again";
  }
}

function headline(game: GameState): string {
  if (game.outcome?.kind === "win") return `${NAMES[game.outcome.winner]} wins`;
  if (game.outcome?.kind === "draw") return "Draw";

  return `${NAMES[game.currentPlayer]} to play`;
}

export interface Announcement {
  text: string;
  /** A win is the big moment; a turn passing is only a brief note. */
  tone: "info" | "win" | "turn";
}

/** What is worth flashing on screen when the game goes from one state to another. */
export function announcement(
  before: GameState,
  after: GameState,
): Announcement | null {
  const placed = (game: GameState) => game.placed.black + game.placed.white;

  if (placed(after) === 0 && placed(before) > 0) {
    return { text: "New game", tone: "info" };
  }

  if (after.outcome && !before.outcome) {
    return after.outcome.kind === "win"
      ? { text: `${NAMES[after.outcome.winner]} wins!`, tone: "win" }
      : { text: "Draw", tone: "info" };
  }

  if (after.finalOrbitsLeft !== before.finalOrbitsLeft) {
    return before.finalOrbitsLeft === null
      ? { text: "Board full", tone: "info" }
      : { text: `${after.finalOrbitsLeft} left`, tone: "info" };
  }

  if (after.currentPlayer !== before.currentPlayer) {
    return { text: `${NAMES[after.currentPlayer]}'s turn`, tone: "turn" };
  }

  return null;
}

export function createHud(colors: Readonly<Record<PlayerId, string>>) {
  const turn = document.getElementById("turn")!;
  const turnText = document.getElementById("turn-text")!;
  const hintText = document.getElementById("hint")!;
  const messageText = document.getElementById("message")!;
  const reserves = document.getElementById("reserves")!;
  const flashText = document.getElementById("flash")!;

  return {
    /** Flashes a text in the middle of the screen, which then fades away. */
    flash({ text, tone }: Announcement) {
      flashText.textContent = text;
      flashText.dataset.tone = tone;
      // restart the animation, even when one is still playing
      flashText.classList.remove("flashing");
      void flashText.offsetWidth;
      flashText.classList.add("flashing");
    },

    render(game: GameState, message: string) {
      const player =
        game.outcome?.kind === "win" ? game.outcome.winner : game.currentPlayer;

      turn.style.setProperty(
        "--dot",
        game.outcome?.kind === "draw" ? "transparent" : colors[player],
      );
      turnText.textContent = headline(game);
      hintText.textContent = hint(game);
      messageText.textContent = message;
      reserves.textContent = (["black", "white"] as const)
        .map(
          (id) => `${NAMES[id]} ${MARBLES_PER_PLAYER - game.placed[id]} left`,
        )
        .join(" · ");
    },
  };
}

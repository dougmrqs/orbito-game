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

export function createHud(colors: Readonly<Record<PlayerId, string>>) {
  const turn = document.getElementById("turn")!;
  const turnText = document.getElementById("turn-text")!;
  const hintText = document.getElementById("hint")!;
  const messageText = document.getElementById("message")!;
  const reserves = document.getElementById("reserves")!;

  return {
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

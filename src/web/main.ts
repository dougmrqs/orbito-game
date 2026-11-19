import "./style.css";

import { ORBIT_DIRECTION, PlayerId, createGame } from "../rules";
import { createBoardView } from "./scene";

const MARBLE_COLORS: Record<PlayerId, number> = {
  black: 0x17171c,
  white: 0xf3efe6,
};

const view = createBoardView(document.getElementById("stage")!, {
  direction: ORBIT_DIRECTION,
  marbleColors: MARBLE_COLORS,
});

view.sync(createGame().board, { animate: false });

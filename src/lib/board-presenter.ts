import { Orbito } from "../orbito";

function presentBoard(this: Orbito) {
  const innerOrbit = this.game.board.innerOrbit;
  const outerOrbit = this.game.board.outerOrbit;

  function presentColor(color: string | undefined) {
    if (!color) return "O";
    if (color === "black") return "B";
    if (color === "white") return "W";
  }

  const row1 = [
    outerOrbit[0].piece?.player.color,
    outerOrbit[1].piece?.player.color,
    outerOrbit[2].piece?.player.color,
    outerOrbit[3].piece?.player.color,
  ];
  const row2 = [
    outerOrbit[11].piece?.player.color,
    innerOrbit[0].piece?.player.color,
    innerOrbit[1].piece?.player.color,
    outerOrbit[4].piece?.player.color,
  ];
  const row3 = [
    outerOrbit[10].piece?.player.color,
    innerOrbit[3].piece?.player.color,
    innerOrbit[2].piece?.player.color,
    outerOrbit[5].piece?.player.color,
  ];
  const row4 = [
    outerOrbit[9].piece?.player.color,
    outerOrbit[8].piece?.player.color,
    outerOrbit[7].piece?.player.color,
    outerOrbit[6].piece?.player.color,
  ];

  console.log(
    `${row1.map(presentColor)}\n${row2.map(presentColor)}\n${row3.map(
      presentColor,
    )}\n${row4.map(presentColor)}`,
  );
}

export { presentBoard };

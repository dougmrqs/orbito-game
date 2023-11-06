import { EventTypes } from "../types";
import { eventEmitter } from "./event-emitter";

function listenToEvents() {
  eventEmitter.on(EventTypes.START, () => {
    console.log("Game started");
  });

  eventEmitter.on(EventTypes.PLAY, (gameEvent) => {
    console.log(`${gameEvent.player.color} played`);
  });

  eventEmitter.on(EventTypes.MOVE, (gameEvent) => {
    console.log(
      `${gameEvent.player.color} moved from ${gameEvent.play.fromSpace.id} to ${gameEvent.play.toSpace.id}`,
    );
  });

  eventEmitter.on(EventTypes.PLACE, (gameEvent) => {
    console.log(
      `${gameEvent.player.color} placed on ${gameEvent.play.toSpace.id}`,
    );
  });

  eventEmitter.on(EventTypes.WIN, (gameEvent) => {
    console.log(`${gameEvent.player.color} won`);
  });

  eventEmitter.on(EventTypes.DRAW, (gameEvent) => {
    console.log("Draw");
  });

  eventEmitter.on(EventTypes.ORBIT, () => {
    console.log("Orbit");
  });

  eventEmitter.on(EventTypes.FULL, () => {
    console.log("Board is full");
  });
}

export { listenToEvents };

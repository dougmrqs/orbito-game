import { EventEmitter } from "events";

import { EventTypes, GameEvent } from "../types";

const eventEmitter = new EventEmitter();

function makeEventEmitter() {
  return {
    start: () => eventEmitter.emit(EventTypes.START),
    orbit: () => eventEmitter.emit(EventTypes.ORBIT),
    play: (gameEvent: GameEvent) =>
      eventEmitter.emit(EventTypes.PLAY, gameEvent),
    move: (gameEvent: GameEvent) =>
      eventEmitter.emit(EventTypes.MOVE, gameEvent),
    place: (gameEvent: GameEvent) =>
      eventEmitter.emit(EventTypes.PLACE, gameEvent),
    win: (gameEvent: GameEvent) => eventEmitter.emit(EventTypes.WIN, gameEvent),
    draw: (gameEvent: GameEvent) =>
      eventEmitter.emit(EventTypes.DRAW, gameEvent),
    full: () => eventEmitter.emit(EventTypes.FULL),
  };
}

export { makeEventEmitter, eventEmitter };

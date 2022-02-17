import { Elevator } from './Elevator';
import { Logger } from './Logger';

export interface IElevatorSystem {
  callElevator(toFloor: number, direction: TravelDirection): void;
  goToFloor(elevatorId: number, toFloor: number): void;
  tick(ticks: number): void;
  get currentTime(): number;
  get currentState(): ElevatorSystemState;
  get requests(): ElevatorRequest[];
}

export type TravelDirection = 'Up' | 'Down';

export type ElevatorSystemState = {
  floorCount: number;
  elevatorsCurrentFloors: { id: number; floor: number }[];
  time: number;
  requests: ElevatorRequest[];
};

export type ElevatorRequest = {
  floor: number;
  direction: TravelDirection;
};

/**
 * Models an elevator system with multiple cars in a single building.
 */
export class ElevatorSystem implements IElevatorSystem {
  public static VERBOSE = true;
  public logger = new Logger();
  private _elevators: Elevator[];
  private _requests: ElevatorRequest[] = [];
  private readonly _floorCount: number;
  private _time = 0;
  /**
   * @param floorCount The total number of floors in the served building.
   * @param elevatorCount The number of elevator cars in the system.
   */
  constructor(floorCount: number, elevatorCount = 1) {
    if (elevatorCount < 1) {
      throw new Error(`elevatorCount must be 1 or greater, provided value is ${elevatorCount}`);
    }
    if (floorCount < 1) {
      throw new Error(`floorCount must be 1 or greater, provided value is ${floorCount}`);
    }
    this._floorCount = floorCount;
    this._elevators = [];
    for (let i = 0; i < elevatorCount; i++) {
      this._elevators.push(new Elevator(i + 1, floorCount, this._log));
    }
  }

  /**
   *
   * @param state
   * @returns
   */
  public static fromSavedState(state: ElevatorSystemState): ElevatorSystem {
    const result = new ElevatorSystem(state.floorCount, state.elevatorsCurrentFloors.length);
    result._time = state.time;
    for (let i = 0; i < state.elevatorsCurrentFloors.length; i++) {
      const e = state.elevatorsCurrentFloors[i];
      result._elevators[i] = new Elevator(e.id, state.floorCount, result._log, e.floor);
    }
    result._requests = [...state.requests];
    return result;
  }

  /**
   * Simulates a passenger requesting an elevator from a specific floor.
   * @param toFloor The floor from which the passenger is requesting the elevator.
   * @param direction The expressed travel direction: Up or Down.
   */
  callElevator(toFloor: number, direction: TravelDirection): void {
    this._log(`System: calling elevator to floor ${toFloor}`);
    this._requests.push({ floor: toFloor, direction });
  }

  goToFloor(elevatorId: number, toFloor: number): void {
    const elevator = this._elevators.find((e) => e.id === elevatorId);
    if (!elevator) {
      throw new Error(`No elevator was found with elevatorId ${elevatorId}`);
    }
    elevator.goToFloor(toFloor);
  }

  get currentTime(): number {
    return this._time;
  }

  get currentElevatorFloors(): string[] {
    return this._elevators.map((e) => `${e.id}:${e.currentFloor}${Logger.directionSymbol(e.travelDirection)}`);
  }

  get currentState(): ElevatorSystemState {
    return {
      elevatorsCurrentFloors: this._elevators.map((e) => ({ id: e.id, floor: e.currentFloor })),
      floorCount: this._floorCount,
      time: this._time,
      requests: [...this._requests],
    };
  }

  get requests(): ElevatorRequest[] {
    return [...this._requests];
  }

  private readonly _log = (s: string) => {
    if (ElevatorSystem.VERBOSE) {
      this.logger.log(`T${this._time.toString().padStart(4, '0')} ${s}`, this._time);
    }
  };

  /**
   * Takes a single step or a specified number of steps for each elevator car in the system. See {@link Elevator.tick}.
   * @param ticks The number os steps to make, defaults to 1.
   */
  tick(ticks = 1): void {
    for (let i = 0; i < ticks; i++) {
      this._time++;
      const moved: number[] = [];

      for (let i = 0; i < this._elevators.length; i++) {
        const didMove = this._elevators[i].tick();
        if (didMove) moved.push(this._elevators[i].id);
      }

      // try to fulfill requests
      for (let i = 0; i < this._requests.length; i++) {
        const request = this._requests[i];
        const costs = this._elevators.map((elevator) => ({
          elevator,
          cost: elevator.getTimeToFulfillRequest(request.floor, request.direction),
        }));
        costs.sort((a, b) => a.cost - b.cost);
        if (costs[0].cost === 0) {
          // the request was fulfilled
          this._requests.splice(i, 1);
          i--;
          // ensure that if an elevator is there it stops for the passenger to board
          costs[0].elevator.hold();
        }
        if (costs[0].elevator.travelDirection === 'None' && moved.every((m) => m !== costs[0].elevator.id)) {
          /* When the best option (lowest waiting time) is a stationary elevator, move it 1 floor closer to the
           * requested floor. This move is necessary in many cases like the initial request, but can end up being
           * unneeded if a better option presents after a few ticks. The system only uses currently known information
           * but this is a good extension point to add a heuristic based on statistics or ML to try and minimize
           * unneeded movement. This design opted for better passenger experience at the expense of potential power
           * savings.
           */
          costs[0].elevator.moveCloserToFloor(request.floor);
          moved.push(costs[0].elevator.id);
        }
      }
      this._log(
        `System: current status ${this.currentElevatorFloors.join(' ')}, requests: [${this._requests
          .map((r) => `${r.floor}:${Logger.directionSymbol(r.direction)}`)
          .join(' ')}]`,
      );
    }
  }
}

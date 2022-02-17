import { Elevator } from './Elevator';
import { Logger } from './Logger';

export type TravelDirection = 'Up' | 'Down';

export type ElevatorSystemState = {
  floorCount: number;
  elevatorsCurrentFloors: { id: number; floor: number }[];
  time: number;
};

/**
 * Models an elevator system with multiple cars in a single building.
 */
export class ElevatorSystem {
  public static VERBOSE = true;
  public logger = new Logger();
  private _elevators: Elevator[];
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
    return result;
  }

  /**
   * Simulates a passenger requesting an elevator from a specific floor.
   * @param toFloor The floor from which the passenger is requesting the elevator.
   * @param direction The expressed travel direction: Up or Down.
   * @returns A reference to the elevator car that'll fulfill the request.
   */
  callElevator(toFloor: number, direction: TravelDirection): Elevator {
    this._log(`System: calling elevator to floor ${toFloor}`);
    const costs = this._elevators.map((elevator) => ({
      elevator,
      cost: elevator.getCostToCall(toFloor, direction),
    }));
    costs.sort((a, b) => a.cost - b.cost);
    this._log(`System: best option is elevator ${costs[0].elevator.id}`);
    costs[0].elevator.goToFloor(toFloor);
    return costs[0].elevator;
  }

  get currentTime(): number {
    return this._time;
  }

  get currentElevatorFloors(): string[] {
    return this._elevators.map((e) => `${e.id}:${e.currentFloor}`);
  }

  get currentState(): ElevatorSystemState {
    return {
      elevatorsCurrentFloors: this._elevators.map((e) => ({ id: e.id, floor: e.currentFloor })),
      floorCount: this._floorCount,
      time: this._time,
    };
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

      for (let i = 0; i < this._elevators.length; i++) {
        this._elevators[i].tick();
      }
      this._log(`System: current status ${this.currentElevatorFloors.join(' ')}`);
    }
  }
}

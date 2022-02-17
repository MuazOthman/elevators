import { TravelDirection } from './ElevatorSystem';

/**
 * A suggestion for a new trip, containing the cost (the number of floors to be traveled before this elevator can go to
 *  the specified floor), and the index that can be used to add a new job for the specified floor.
 */
export type TripSuggestion = {
  /**
   * The number of floors to be traveled before this elevator can go to the specified floor.
   */
  cost: number;
  /**
   * The index that can be used to add a new job for the specified floor.
   */
  insertJobIndex: number;
};

/**
 * Models a single elevator car in an {@link ElevatorSystem}
 */
export class Elevator {
  private readonly _floorCount: number;
  private readonly _id: number;
  private _currentFloor: number;
  private readonly _jobs: number[] = [];
  private readonly _log: (s: string) => void;
  constructor(id: number, floorCount: number, log: (s: string) => void, currentFloor = 1) {
    this._id = id;
    this._floorCount = floorCount;
    this._currentFloor = currentFloor;
    this._log = log;
  }

  /**
   * Calculates the number of floors to be traveled before this elevator can go to the specified floor.
   * Assumption: the system will honor the order of requests, but will make an effort to optimize by adding stops on
   *  the way.
   * @param toFloor Target floor.
   * @param direction Currently not used.
   * @returns The number of floors to be traveled before this elevator can go to the specified floor.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCostToCall(toFloor: number, direction: TravelDirection): number {
    return this._findBestTrip(toFloor).cost;
  }

  /**
   * Assumption: the system will honor the order of requests, but will make an effort to optimize by adding stops on
   *  the way.
   * @param toFloor Target floor.
   * @returns A suggestion containing the cost (the number of floors to be traveled before this elevator can go to the
   *  specified floor), and the index that can be used to add a new job for the specified floor.
   */
  private _findBestTrip(toFloor: number): TripSuggestion {
    let cost = 0;
    /*
    The following loops runs a "simulation" to:
      a) calculate the cost (the number of floors) to step through already registered jobs
      b) identify if we can "hitch a ride" by adding a stop on the way of an already queued-up job
    */
    const stops = [this._currentFloor, ...this._jobs];
    for (let i = 0; i < stops.length - 1; i++) {
      if (Elevator._canAddStop(stops[i], stops[i + 1], toFloor)) {
        cost += Math.abs(stops[i] - toFloor);
        return { cost, insertJobIndex: i };
      } else {
        cost += Math.abs(stops[i] - stops[i + 1]);
      }
    }
    // if we reach this point, it means we cannot "hitch a ride" and will need to append a new job at the end
    cost += Math.abs(stops[stops.length - 1] - toFloor);
    return { cost, insertJobIndex: stops.length - 1 };
  }
  private static _canAddStop(goingFromFloor: number, goingToFloor: number, stopAt: number): boolean {
    return (goingFromFloor >= stopAt && goingToFloor <= stopAt) || (goingFromFloor <= stopAt && goingToFloor >= stopAt);
  }

  /**
   * Registers a new job to move elevator to the specified floor. It uses {@link Elevator._findBestTrip}
   * @param toFloor Target floor, must be between 1 and {@link Elevator._floorCount}.
   */
  goToFloor(toFloor: number): void {
    if (toFloor < 1 || toFloor > this._floorCount) {
      throw new Error(`toFloor must be between 1 and ${this._floorCount}, provided value is ${toFloor}`);
    }
    const bestTrip = this._findBestTrip(toFloor);
    // inject new job
    this._jobs.splice(bestTrip.insertJobIndex, 0, toFloor);
    this._log(`Elevator ${this._id}: new job registered. Current jobs: [${this._jobs.join(', ')}]`);
  }

  get currentFloor(): number {
    return this._currentFloor;
  }
  get id(): number {
    return this._id;
  }

  /**
   * Take a single step (if needed), a step is the elevator moving one floor up or down.
   */
  tick(): void {
    while (this._jobs.length > 0 && this._currentFloor === this._jobs[0]) {
      // if the elevator reached the current target floor, pop the first job
      this._jobs.splice(0, 1);
      this._log(
        `Elevator ${this._id}: last job is fulfilled at floor ${this._currentFloor}, remaining jobs: [${this._jobs.join(
          ', ',
        )}]`,
      );
    }
    if (this._jobs.length > 0) {
      if (this._currentFloor < this._jobs[0]) {
        this._currentFloor++;
        this._log(`Elevator ${this._id}: moved up to floor ${this._currentFloor}`);
      } else if (this._currentFloor > this._jobs[0]) {
        this._currentFloor--;
        this._log(`Elevator ${this._id}: moved down to floor ${this._currentFloor}`);
      }
    }
  }
}

import { TravelDirection } from './ElevatorSystem';

export interface IElevator {
  getTimeToFulfillRequest(toFloor: number, direction: TravelDirection): number;
  goToFloor(toFloor: number): void;
  get currentFloor(): number;
  get travelDirection(): ElevatorTravelDirection;
  get id(): number;
  tick(): void;
  moveCloserToFloor(floor: number): void;
  hold(): void;
}

export type ElevatorTravelDirection = TravelDirection | 'None';

/**
 * Models a single elevator car in an {@link ElevatorSystem}
 */
export class Elevator implements IElevator {
  public static BOARDING_TIME = 2;
  private readonly _floorCount: number;
  private readonly _id: number;
  private _currentFloor: number;
  private readonly _jobs: Record<TravelDirection, number[]> = { Down: [], Up: [] };
  private _travelDirection: ElevatorTravelDirection = 'None';
  private _boardingCountdown = 0;
  private readonly _log: (s: string) => void;
  constructor(
    id: number,
    floorCount: number,
    log: (s: string) => void,
    currentFloor = 1,
    jobs?: Record<TravelDirection, number[]>,
    travelDirection?: ElevatorTravelDirection,
  ) {
    this._id = id;
    this._floorCount = floorCount;
    this._currentFloor = currentFloor;
    if (jobs) {
      this._jobs = jobs;
    }
    if (travelDirection) {
      this._travelDirection = travelDirection;
    }
    this._log = (s) => log(`Elevator ${this._id}: ${s}`);
  }

  /**
   * Calculates the time needed before this elevator can arrive to the specified floor.
   * The elevator will honor the current direction but will make an attempt to add a stop if possible.
   * @param toFloor Target floor.
   * @param direction Intended direction of travel after boarding.
   * @returns The number of ticks to be spent traveling or boarding before this elevator can go to the specified floor.
   *  Every floor traveled is one tick, and every stop adds {@link Elevator.BOARDING_TIME} ticks.
   */
  getTimeToFulfillRequest(toFloor: number, direction: TravelDirection): number {
    if (this._travelDirection === 'None') return Math.abs(toFloor - this.currentFloor);
    let result = this._boardingCountdown;

    // the elevator will honor the current direction but will make an attempt to add a stop if possible
    let simulatedFloor = this.currentFloor;
    const tryCurrentDirection = this._travelTimeInDirection(
      simulatedFloor,
      toFloor,
      this._travelDirection,
      this._travelDirection === direction,
    );
    result += tryCurrentDirection.time;
    if (tryCurrentDirection.stopOnTheWay) {
      return result;
    }

    // the elevator will check the other direction but will make an attempt to add a stop if possible
    const otherDirection = this._travelDirection === 'Up' ? 'Down' : 'Up';
    simulatedFloor = this._lastStopForDirection(this._travelDirection) ?? this.currentFloor;
    const tryOtherDirection = this._travelTimeInDirection(
      simulatedFloor,
      toFloor,
      otherDirection,
      otherDirection === direction,
    );
    result += tryOtherDirection.time;
    if (tryOtherDirection.stopOnTheWay) {
      return result;
    }
    // at this point, the elevator will need to finish all jobs and then make its way to the specified floor
    simulatedFloor = this._lastStopForDirection(otherDirection) ?? this.currentFloor;
    result += Math.abs(toFloor - this.currentFloor);
    return result;
  }

  private _lastStopForDirection(direction: TravelDirection): number | undefined {
    const jobs = this._jobs[direction];
    return jobs.length > 0 ? jobs[jobs.length - 1] : undefined;
  }

  private _travelTimeInDirection(
    fromFloor: number,
    toFloor: number,
    direction: TravelDirection,
    shouldAttemptToStop: boolean,
  ): { time: number; stopOnTheWay: boolean } {
    let time = 0;
    const stops = [fromFloor, ...this._jobs[direction]];
    for (let i = 0; i < stops.length - 1; i++) {
      const lower = Math.min(stops[i], stops[i + 1]);
      const higher = Math.max(stops[i], stops[i + 1]);
      if (shouldAttemptToStop && lower >= toFloor && higher <= toFloor) {
        // can stop along the way
        time += Math.abs(stops[i] - toFloor);
        return { time: time, stopOnTheWay: true };
      }
      time += Math.abs(stops[i] - toFloor);
      time += Elevator.BOARDING_TIME;
    }
    return { time: time, stopOnTheWay: false };
  }

  /**
   * Registers a new job to move elevator to the specified floor. It uses {@link Elevator._findBestTrip}
   * @param toFloor Target floor, must be between 1 and {@link Elevator._floorCount}.
   */
  goToFloor(toFloor: number): void {
    if (toFloor < 1 || toFloor > this._floorCount) {
      throw new Error(`toFloor must be between 1 and ${this._floorCount}, provided value is ${toFloor}`);
    }
    const direction: ElevatorTravelDirection =
      toFloor === this.currentFloor ? this._travelDirection : toFloor > this.currentFloor ? 'Up' : 'Down';
    if (direction !== 'None') {
      this._jobs[direction].push(toFloor);
      if (direction === 'Up') {
        this._jobs[direction].sort();
      } else {
        // sort descending when going down
        this._jobs[direction].sort((a, b) => b - a);
      }
      this._log(
        `new job registered for direction ${direction}. Current jobs for that direction: [${this._jobs[direction].join(
          ', ',
        )}]`,
      );
      if (this._travelDirection === 'None') {
        this._travelDirection = direction;
      }
    }
  }

  get currentFloor(): number {
    return this._currentFloor;
  }

  get travelDirection(): ElevatorTravelDirection {
    return this._travelDirection;
  }
  get id(): number {
    return this._id;
  }

  /**
   * Take a single step (if needed), a step is the elevator moving one floor up or down.
   */
  tick(): void {
    if (this._boardingCountdown > 0) {
      this._boardingCountdown--;
      this._log(`waiting for boarding/disembarking, wait time remaining: ${this._boardingCountdown}`);
      if (this._boardingCountdown === 0 && this._travelDirection !== 'None') {
        // update direction
        const otherDirection = this._travelDirection === 'Up' ? 'Down' : 'Up';
        if (this._jobs[otherDirection].length === 0) {
          this._log(`out of jobs`);
          this._travelDirection = 'None';
        } else {
          this._log(`new direction: ${otherDirection}`);
          this._travelDirection = otherDirection;
        }
      }
      return;
    }
    if (this._travelDirection === 'None') return;
    const jobs = this._jobs[this._travelDirection];
    if (jobs.length > 0) {
      if (this._currentFloor < jobs[0]) {
        this._currentFloor++;
        this._log(`moved up to floor ${this._currentFloor}`);
      } else if (this._currentFloor > jobs[0]) {
        this._currentFloor--;
        this._log(`moved down to floor ${this._currentFloor}`);
      }
      if (this._currentFloor === jobs[0]) {
        // if the elevator reached the current target floor, pop the first job
        while (jobs.length > 0 && this._currentFloor === jobs[0]) {
          jobs.splice(0, 1);
        }
        this._boardingCountdown = Elevator.BOARDING_TIME;
        const nextStops =
          jobs.length === 0
            ? `no more stops in the current direction (${this._travelDirection})`
            : `next stops in the current direction (${this._travelDirection}): [${jobs.join(', ')}]`;
        this._log(`arrived at floor ${this._currentFloor}, ${nextStops}`);
      }
    }
  }

  /**
   * Moves the elevator a single floor to get closer to specified floor. This is typically used to respond to elevator
   *  calls.
   * @param floor Floor number to move towards.
   */
  moveCloserToFloor(floor: number): void {
    if (this._travelDirection !== 'None') return;
    if (floor === this._currentFloor) return;
    const diff = floor > this._currentFloor ? 1 : -1;
    this._currentFloor += diff;
    this._log(`moved ${diff > 0 ? 'up' : 'down'} a single floor closer to ${floor} to pick up a passenger`);
  }

  /**
   * Resets boarding counter to allow for passenger boarding/disembarking.
   */
  hold(): void {
    this._boardingCountdown = Elevator.BOARDING_TIME;
    this._log(`hold requested`);
  }
}

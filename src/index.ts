import * as readline from 'readline-sync';
import colors from 'colors/safe';
import { ElevatorSystem, TravelDirection } from './ElevatorSystem';
import { Logger } from './Logger';

const NUMBER_OF_FLOORS = 10;
const NUMBER_OF_CARS = 4;

let sys = new ElevatorSystem(NUMBER_OF_FLOORS, NUMBER_OF_CARS);
// sys.callElevator(10, 'Up');
// sys.tick(8);
// sys.callElevator(3, 'Up');
// sys.tick(2);
// sys.goToFloor(1, 1);
// sys.callElevator(8, 'Up');
// sys.tick(20);

function useCase1() {
  sys = new ElevatorSystem(10, 1);

  // T0
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  menu('i', false);
  sys.callElevator(3, 'Down');
  sys.tick(1);

  // T1
  sys.callElevator(10, 'Down');
  sys.tick(2);

  // T3
  sys.goToFloor(1, 2);
  sys.tick(10);

  // T13
  sys.goToFloor(1, 1);
  sys.tick(18);
}

function menu(preselectedOption?: string, recurse = true) {
  const option =
    preselectedOption ??
    readline.question(
      'Choose an action: [T]ick, [c]all elevator to floor, [p]ress a button inside elevator, [i]nfo, [r]eset, use case [1], [q]uit > ',
    );
  try {
    switch (option?.toLowerCase()) {
      case 't':
      case '': {
        const ticksInput = readline.question('Tick: How many ticks? (press Enter to cancel) > ');
        if (!ticksInput) {
          break;
        }
        const ticks = Number.parseInt(ticksInput);
        if (Number.isNaN(ticks)) {
          throw new Error(`Invalid number: '${ticksInput}'`);
        }
        sys.tick(ticks);
        break;
      }
      case 'c':
        {
          const floorNumberInput = readline.question('Call elevator: Which floor number? (press Enter to cancel) > ');
          if (!floorNumberInput) {
            break;
          }
          const floorNumber = Number.parseInt(floorNumberInput);
          if (Number.isNaN(floorNumber)) {
            throw new Error(`Invalid number: '${floorNumber}'`);
          }
          const directionInput = readline.question(
            'Request elevator: Which direction? ([u]p/[d]own) (press Enter to cancel) > ',
          );
          if (!directionInput) {
            break;
          }
          const direction: TravelDirection | undefined =
            directionInput.toLowerCase() === 'u' ? 'Up' : directionInput.toLowerCase() === 'd' ? 'Down' : undefined;
          if (!direction) {
            throw new Error(`Invalid direction selector: '${directionInput}'`);
          }
          sys.callElevator(floorNumber, direction);
        }
        break;
      case 'p':
        {
          const elevatorIdInput = readline.question('Go to floor: Which elevator id? (press Enter to cancel) > ');
          if (!elevatorIdInput) {
            break;
          }
          const elevatorId = Number.parseInt(elevatorIdInput);
          if (Number.isNaN(elevatorId)) {
            throw new Error(`Invalid number: '${elevatorId}'`);
          }
          const floorNumberInput = readline.question('Go to floor: Which floor number? (press Enter to cancel) > ');
          if (!floorNumberInput) {
            break;
          }
          const floorNumber = Number.parseInt(floorNumberInput);
          if (Number.isNaN(floorNumber)) {
            throw new Error(`Invalid number: '${floorNumber}'`);
          }
          sys.goToFloor(elevatorId, floorNumber);
        }
        break;
      case 'q':
        {
          const verification = readline.question(
            'Are you sure you want to quit? ([y]es/[N]o) (press Enter to cancel) > ',
          );
          if (!verification) {
            break;
          }
          if (verification?.toLowerCase() === 'y') {
            return;
          }
        }
        break;
      case '1':
        useCase1();
        break;
      case 'r':
        {
          const verification = readline.question(
            'Are you sure you want to reset? ([y]es/[N]o) (press Enter to cancel) > ',
          );
          if (!verification) {
            break;
          }
          if (verification?.toLowerCase() === 'y') {
            sys = new ElevatorSystem(NUMBER_OF_FLOORS, NUMBER_OF_CARS);
            return menu('i');
          }
        }
        break;
      case 'i':
        console.log(`Number of floors: ${NUMBER_OF_FLOORS}
Number of cars: ${NUMBER_OF_CARS}
Current status: ${sys.currentElevatorFloors.join(' ')}
Pending requests: [${sys.requests.map((r) => `${r.floor}:${Logger.directionSymbol(r.direction)}`).join(' ')}]`);
        break;
      default:
        throw new Error(`Invalid option: '${option}'`);
    }
  } catch (err) {
    console.log(colors.red(err.message));
  }
  if (recurse) menu();
}

menu('i');

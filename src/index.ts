//floorCount: 10
//elevatorCount: 1

import { ElevatorSystem } from './ElevatorSystem';

const sys = new ElevatorSystem(10, 4);
// const elevator = sys.callElevator(5, 'Up');
// for (let i = 0; i < 20; i++) {
//   sys.tick();
//   if (elevator.currentFloor === 5) {
//     elevator.goToFloor(2);
//   }
//   console.log(sys.currentStatus);
// }
const e1 = sys.callElevator(10, 'Up');
sys.callElevator(10, 'Up');
sys.tick(8);
const e2 = sys.callElevator(3, 'Up');
sys.tick(2);
e1.goToFloor(1);
const e3 = sys.callElevator(8, 'Up');
sys.tick(20);

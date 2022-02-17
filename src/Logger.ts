import { ElevatorTravelDirection } from './Elevator';
import colors from 'colors/safe';

const defaultColor = (s: string) => s;

export class Logger {
  logColors = [colors.blue, colors.cyan, colors.magenta, colors.yellow];
  log = (s: string, groupNumber = 0) => {
    const color = this.logColors.length > 0 ? this.logColors[groupNumber % this.logColors.length] : defaultColor;
    console.log(color(s));
  };
  static directionSymbol(direction: ElevatorTravelDirection): string {
    return direction === 'None' ? '=' : direction === 'Up' ? '↑' : '↓';
  }
}

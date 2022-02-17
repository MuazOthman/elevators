import colors from 'colors/safe';

const defaultColor = (s: string) => s;

export class Logger {
  logColors = [defaultColor, colors.blue, colors.cyan];
  log = (s: string, groupNumber = 0) => {
    const color = this.logColors.length > 0 ? this.logColors[groupNumber % this.logColors.length] : defaultColor;
    console.log(color(s));
  };
}

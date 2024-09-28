import { injectable } from "inversify-sugar";
import { makeAutoObservable } from "mobx";

@injectable()
export class GetSettings {
  theme: string = 'light';
  logsSince: number = 60000;
  logsInterval: number = 1000;
  logsMaxLines: number = 50;

  constructor(
  ) {   
    makeAutoObservable(this); 
  }
  
  toggleTheme = () => {
    if(this.theme === 'light'){
      this.theme = 'dark'
    } else {
      this.theme = 'light'
    }
  }

  setTheme = (theme: string) => {
    this.theme = theme
  }

  setLogsSince = (logsSince: number) => {
    this.logsSince = logsSince
  }

  setLogsInterval = (logsInterval: number) => {
    this.logsInterval = logsInterval
  }

  setLogsMaxLines = (logsMaxLines: number) => {
    this.logsMaxLines = logsMaxLines
  }

  get isDarkMode() {
    return this.theme === 'dark'
  }

  get isLightMode() {
    return this.theme === 'light'
  }

  get getTheme() {
    return this.theme
  }

  get getLogsSince() {
    return this.logsSince
  }

  get getLogsInterval() {
    return this.logsInterval
  }

  get getLogsMaxLines() {
    return this.logsMaxLines
  }
}

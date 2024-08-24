import { injectable } from "inversify-sugar";
import { makeAutoObservable } from "mobx";

@injectable()
export class GetTheme {
  theme: string = 'light';

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


  get isDarkMode() {
    return this.theme === 'dark'
  }

  get isLightMode() {
    return this.theme === 'light'
  }

  get getTheme() {
    return this.theme
  }
}

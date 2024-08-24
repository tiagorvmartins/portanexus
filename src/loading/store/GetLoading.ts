import { injectable } from "inversify-sugar";
import { makeAutoObservable } from "mobx";

@injectable()
export class GetLoading {
  loadingComponents: number = 0;

  constructor(
  ) {   
    makeAutoObservable(this); 
  }
  
  addLoadingComponent = (): Promise<void> => {
    this.loadingComponents++
    return Promise.resolve()

  }

  removeLoadingComponent = (): Promise<void> => {
    if(this.loadingComponents > 0)
      this.loadingComponents--
    return Promise.resolve()
  }


  get isLoading() {
    return this.loadingComponents !== 0
  }
}

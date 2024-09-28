import { injectable, provided } from "inversify-sugar";
import { makeAutoObservable } from "mobx";
import GetStacksStoreState from "../../types/GetStacksStoreState";
import GetStacksUseCase from "src/stacks/application/useCases/GetStacksUseCase";
import GetStacksPayload from "src/stacks/application/types/GetStacksPayload";
import StopStackUseCase from "src/stacks/application/useCases/StopStackUseCase";
import StartStackUseCase from "src/stacks/application/useCases/StartStackUseCase";


@injectable()
export class GetStacksStore implements GetStacksStoreState {
  isLoading = false;
  results = [] as GetStacksStoreState["results"];
  count = 0;
  filters = {};
  pagination = {
    page: 1,
    pageSize: 25,
  };

  constructor(
    @provided(GetStacksUseCase)
    private readonly getStacksUseCase: GetStacksUseCase,
    @provided(StopStackUseCase)
    private readonly stopStackUseCase: StopStackUseCase,
    @provided(StartStackUseCase)
    private readonly startStackUseCase: StartStackUseCase,
  ) {
    makeAutoObservable(this);
  }

  get isEmpty(): boolean {
    return this.results.length === 0;
  }

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  setResults = (results: GetStacksStoreState["results"]) => {
    this.results = results;
  };

  setCount = (count: GetStacksStoreState["count"]) => {
    this.count = count;
  };

  mergeFilters = (payload: Partial<GetStacksStoreState["filters"]>) => {
    Object.assign(this.filters, payload);
  };

  async getStacks() {
    const payload: GetStacksPayload = {
      filters: this.filters,
    };

    
    this.setIsLoading(true);
    return this.getStacksUseCase
      .execute(payload)
      .then((response) => {
        this.setResults(response!.results || []);
        this.setCount(response!.count || 0);
      })
      .finally(() => {
        this.setIsLoading(false);
      });
  }

  async stopStack(id: number) {
    this.setIsLoading(true);
    return await this.stopStackUseCase
      .execute(id)
      .finally(() => {
        this.setIsLoading(false);
      });
  }

  async startStack(id: number) {
    this.setIsLoading(true);

    return await this.startStackUseCase
      .execute(id)
      .finally(() => {
        this.setIsLoading(false);
      });
  }
}

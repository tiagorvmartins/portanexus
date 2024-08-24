import { injectable, provided } from "inversify-sugar";
import { makeAutoObservable } from "mobx";
import GetContainersStoreState from "../../types/GetContainersStoreState";
import GetContainersUseCase from "src/containers/application/useCases/GetContainersUseCase";
import GetContainersPayload from "src/containers/application/types/GetContainersPayload";


@injectable()
export class GetContainersStore implements GetContainersStoreState {
  isLoading = false;
  results = [] as GetContainersStoreState["results"];
  count = 0;
  filters = {};
  pagination = {
    page: 1,
    pageSize: 25,
  };

  constructor(
    @provided(GetContainersUseCase)
    private readonly getContainersUseCase: GetContainersUseCase,

  ) {
    makeAutoObservable(this);
  }

  get isEmpty(): boolean {
    return this.results.length === 0;
  }

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  setResults = (results: GetContainersStoreState["results"]) => {
    this.results = results;
  };

  setCount = (count: GetContainersStoreState["count"]) => {
    this.count = count;
  };

  mergeFilters = (payload: Partial<GetContainersStoreState["filters"]>) => {
    Object.assign(this.filters, payload);
  };

  async getContainers(endpointId: number) {
    const payload: GetContainersPayload = {
      filters: this.filters,
      endpointId: endpointId
    };
    
    this.setIsLoading(true);
    return this.getContainersUseCase
      .execute(payload)
      .then((response: any) => {
        this.setResults(response.results);
        this.setCount(response.count);
      })
      .finally(() => {
        this.setIsLoading(false);
      });
  }
}

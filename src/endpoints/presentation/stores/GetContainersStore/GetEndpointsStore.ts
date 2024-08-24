import { injectable, provided } from "inversify-sugar";
import { makeAutoObservable } from "mobx";

import GetEndpointsUseCase from "src/endpoints/application/useCases/GetEndpointsUseCase";
import GetEndpointsPayload from "src/endpoints/application/types/GetEndpointsPayload";
import GetEndpointsStoreState from "../../types/GetEndpointsStoreState";


@injectable()
export class GetEndpointsStore implements GetEndpointsStoreState {
  isLoading = false;
  results = [] as GetEndpointsStoreState["results"];
  selectedEndpoint: number = -1;
  count = 0;
  filters = {};
  pagination = {
    page: 1,
    pageSize: 25,
  };

  constructor(
    @provided(GetEndpointsUseCase)
    private readonly getEndpointsUseCase: GetEndpointsUseCase,

  ) {
    makeAutoObservable(this);
  }

  get isEmpty(): boolean {
    return this.results.length === 0;
  }

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  setResults = (results: GetEndpointsStoreState["results"]) => {
    this.results = results;
  };

  setCount = (count: GetEndpointsStoreState["count"]) => {
    this.count = count;
  };

  mergeFilters = (payload: Partial<GetEndpointsStoreState["filters"]>) => {
    Object.assign(this.filters, payload);
  };

  setSelectedEndpoint(id: number) {
    this.selectedEndpoint = id;
  }

  async getEndpoints() {
    const payload: GetEndpointsPayload = {
      filters: this.filters,
    };
    
    this.setIsLoading(true);
    return this.getEndpointsUseCase
      .execute(payload)
      .then((response: any) => {
        this.setResults(response.results);
        this.setCount(response.count);
        this.setSelectedEndpoint(response.results[0].Id);
      })
      .finally(() => {
        this.setIsLoading(false);
      });
  }
}

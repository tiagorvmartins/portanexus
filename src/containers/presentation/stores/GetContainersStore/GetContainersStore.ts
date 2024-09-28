import { injectable, provided } from "inversify-sugar";
import { makeAutoObservable } from "mobx";
import GetContainersStoreState from "../../types/GetContainersStoreState";
import GetContainersUseCase from "src/containers/application/useCases/GetContainersUseCase";
import GetContainersPayload from "src/containers/application/types/GetContainersPayload";
import StartContainersUseCase from "src/containers/application/useCases/StartContainerUseCase";
import StopContainersUseCase from "src/containers/application/useCases/StopContainerUseCase";
import ControlContainerPayload from "src/containers/application/types/ControlContainerPayload";
import GetContainerLogsPayload from "src/containers/application/types/GetLogsPayload";
import GetContainerLogsResponse from "src/containers/application/types/GetContainerLogsResponse";
import GetContainerLogsUseCase from "src/containers/application/useCases/GetContainerLogsUseCase";


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
    @provided(StartContainersUseCase)
    private readonly startContainerUseCase: StartContainersUseCase,
    @provided(StopContainersUseCase)
    private readonly stopContainerUseCase: StopContainersUseCase,
    @provided(GetContainerLogsUseCase)
    private readonly getContainerLogsUseCase: GetContainerLogsUseCase,

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

  resetFilters = (payload: Partial<GetContainersStoreState["filters"]>) => {
    this.filters = payload;
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

  async stopContainer(endpointId: number, containerId: string) {
    this.setIsLoading(true);
    const data: ControlContainerPayload = {
      endpointId,
      containerId
    };
    return await this.stopContainerUseCase
      .execute(data)
      .finally(() => {
        this.setIsLoading(false);
      });
  }

  async startContainer(endpointId: number, containerId: string) {
    this.setIsLoading(true);
    const data: ControlContainerPayload = {
      endpointId,
      containerId
    };
    return await this.startContainerUseCase
      .execute(data)
      .finally(() => {
        this.setIsLoading(false);
      });
  }

  async getContainerLogs(endpointId: number, containerId: string, since: number, until: number): Promise<GetContainerLogsResponse> {
    this.setIsLoading(true);
    const data: GetContainerLogsPayload = {
      endpointId,
      containerId,
      since,
      until
    };
    const logs = await this.getContainerLogsUseCase.execute(data)
    this.setIsLoading(false);
    return logs;
  }
}

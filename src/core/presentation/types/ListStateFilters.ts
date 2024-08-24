import PaginationState from "./PaginationState";

export default interface ListState<
  ResultItemType,
  FiltersType = Record<string, never>
> {
  isLoading: boolean;
  results: Record<string, ResultItemType[]>;
  count: Record<string, number>;
  filters: FiltersType;
  pagination: PaginationState;
}

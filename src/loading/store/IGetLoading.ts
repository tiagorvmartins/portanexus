export default interface IGetLoading {
    loadingComponents: number
    addLoadingComponent: () => Promise<void>
    removeLoadingComponent: () => Promise<void>
}
export default interface ITheme {
    theme: "light" | "dark" | null | undefined
    toggleTheme: () => void
}
export default interface ISettings {
    theme: "light" | "dark" | null | undefined
    toggleTheme: () => void
}
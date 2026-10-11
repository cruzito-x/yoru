import { useColorScheme } from "react-native";
import { useBudget } from "../context/BudgetContext";
import { themes } from "./theme";

// Cada componente pide sus colores al mismo punto central.
export function useTheme() {
  const { state } = useBudget();
  const systemTheme = useColorScheme();
  const mode =
    state.themeMode === "system"
      ? systemTheme === "dark"
        ? "dark"
        : "light"
      : state.themeMode;
  return { colors: themes[mode], isDark: mode === "dark", mode };
}

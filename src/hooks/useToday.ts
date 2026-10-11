import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { today } from "../utils/dates";

// Actualiza el mes al volver a la app y si permanece abierta durante medianoche.
export function useToday(): string {
  const [currentDay, setCurrentDay] = useState(today);
  useEffect(() => {
    const refresh = () => setCurrentDay(today());
    const timer = setInterval(refresh, 60000);
    const listener = AppState.addEventListener("change", (status) => {
      if (status === "active") refresh();
    });
    return () => {
      clearInterval(timer);
      listener.remove();
    };
  }, []);
  return currentDay;
}

import { useContext } from "react";
import { LayoutDisclosure } from "../contexts/LayoutDisclosure";

/**
 * It's a hook that returns the context of the LayoutDisclosure
 * @returns The context is being returned.
 */
export const useLayout = () => {
  const context = useContext(LayoutDisclosure);
  /* Checking if the context is undefined. If it is, it will throw an error. */
  if (Object.values(context).length === 0) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

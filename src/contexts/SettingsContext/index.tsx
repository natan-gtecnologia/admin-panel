import { parseCookies } from "nookies";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { IConfig } from "./config";
interface SettingsContextProps {
  config: IConfig[number] | null;
}
const SettingsContext = createContext({} as SettingsContextProps);

export const SettingsProvider = ({ children }: Required<PropsWithChildren>) => {
  const [config, setConfig] = useState<IConfig[number] | null>(null);

  useEffect(() => {
    const cookie = parseCookies()["@Admin:AdminPanel"];
    const parsedConfig = JSON.parse(cookie ?? "{}");
    setConfig(parsedConfig);
  }, []);

  return (
    <SettingsContext.Provider value={{ config }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

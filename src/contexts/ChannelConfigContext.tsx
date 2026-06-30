import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface ChannelConfig {
  channelName: string;
  logoUrl: string;
  photoUrl: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  youtubeUrl: string;
}

const DEFAULT_CONFIG: ChannelConfig = {
  channelName: "Luana Queiroz e Família",
  logoUrl: "",
  photoUrl: "",
  tagline: "Monte seu chaveamento da Copa com a família!",
  primaryColor: "#f59e0b",
  secondaryColor: "#10b981",
  youtubeUrl: "https://www.youtube.com/@Luanaqueirozefamilia",
};

const STORAGE_KEY = "lqf-channel-config-v1";

interface ChannelConfigContextValue {
  config: ChannelConfig;
  updateConfig: (partial: Partial<ChannelConfig>) => void;
  resetConfig: () => void;
}

const ChannelConfigContext = createContext<ChannelConfigContextValue | null>(null);

export function ChannelConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ChannelConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {}
  }, [config]);

  const updateConfig = (partial: Partial<ChannelConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const resetConfig = () => setConfig(DEFAULT_CONFIG);

  return (
    <ChannelConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </ChannelConfigContext.Provider>
  );
}

export function useChannelConfig(): ChannelConfigContextValue {
  const ctx = useContext(ChannelConfigContext);
  if (!ctx) throw new Error("useChannelConfig must be used inside ChannelConfigProvider");
  return ctx;
}

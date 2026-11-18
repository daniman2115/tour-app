import React, { useState } from "react";
import type { Channel, LocalMessage } from "stream-chat";

type AppContextType = {
  channel: null | Channel;
  setChannel: (channel: Channel | null) => void;
  thread: null | LocalMessage;
  setThread: (thread: LocalMessage | null) => void;
};

export const AppContext = React.createContext<AppContextType>({
  channel: null,
  setChannel: () => {},
  thread: null,
  setThread: () => {},
});

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [thread, setThread] = useState<LocalMessage | null>(null);

  return (
    <AppContext.Provider value={{ channel, setChannel, thread, setThread }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => React.useContext(AppContext);

export default AppProvider;
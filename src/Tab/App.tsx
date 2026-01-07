import { useEffect, useState } from "react";

import { app, LiveShareHost } from "@microsoft/teams-js";
import { LiveShareProvider } from "@microsoft/live-share-react";
import {
  FluentProvider,
  Spinner,
  teamsLightTheme,
} from "@fluentui/react-components";

import { LiveCanvasPage } from "../LiveCanvas/LiveCanvasPage";
import "./App.css";


export default function App() {
  const [host, setHost] = useState<LiveShareHost | undefined>();

  useEffect(() => {
    app.initialize().then(async () => {
      setHost(LiveShareHost.create());
      app.notifySuccess();
    });
  }, []);

  return (
    <FluentProvider theme={teamsLightTheme}>
      {host ? (
        <LiveShareProvider host={host} joinOnLoad>
          <div className="App">
            <LiveCanvasPage />
          </div>
        </LiveShareProvider>
      ) : (
        <Spinner />
      )}
    </FluentProvider>
  );
}



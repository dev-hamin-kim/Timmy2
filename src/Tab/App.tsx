import { useEffect, useState } from "react";

import * as teamJS from "@microsoft/teams-js";
import { LiveShareProvider, useLiveCanvas } from "@microsoft/live-share-react";

import { LiveCanvasPage } from "./LiveCanvasPage";
import "./App.css";

export default function App() {
  const [host, setHost] = useState<teamJS.LiveShareHost | undefined>();

  useEffect(() => {
    teamJS.app.initialize().then(async () => {
      setHost(teamJS.LiveShareHost.create());
    });
  }, []);

  if (host) {
    return (
      <LiveShareProvider host={host} joinOnLoad>
        <div className="App">
          <LiveCanvasPage />
        </div>
      </LiveShareProvider>
    );
  } else {
    return (
      <div className="App">
        <h1>Loading...</h1>;
      </div>
    );
  }
}
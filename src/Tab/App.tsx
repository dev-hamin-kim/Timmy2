import { useEffect, useState } from "react";

import { app, LiveShareHost } from "@microsoft/teams-js";
import { LiveShareProvider } from "@microsoft/live-share-react";
import {
  FluentProvider,
  Spinner,
  teamsLightTheme,
  teamsDarkTheme,
} from "@fluentui/react-components";

import { LiveCanvasPage } from "../LiveCanvas/LiveCanvasPage";
import "./App.css";


export default function App() {
  const [host, setHost] = useState<LiveShareHost | undefined>();
  const [theme, setTheme] = useState(teamsLightTheme);

  useEffect(() => {
    app.initialize().then(async () => {
      setHost(LiveShareHost.create());

      const context = await app.getContext();
      setTheme(
        context.app.theme === "dark"
          ? teamsDarkTheme
          : teamsLightTheme
      );

      app.registerOnThemeChangeHandler((theme) => {
        setTheme(theme === "dark" ? teamsDarkTheme : teamsLightTheme);
      });

      app.notifySuccess();
    });
  }, []);

  return (
    <FluentProvider theme={theme}>
      {host ? (
        <LiveShareProvider host={host} joinOnLoad>
          <div className="App">
            <div style={{ flex: 1, width: "100%", height: "100%" }}>
              <LiveCanvasPage />
            </div>
          </div>
        </LiveShareProvider>
      ) : (
        <Spinner />
      )}
    </FluentProvider>
  );
}

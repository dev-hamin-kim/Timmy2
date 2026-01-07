import { useEffect, useState } from "react";

import * as teamJS from "@microsoft/teams-js";
import { LiveShareProvider } from "@microsoft/live-share-react";
import {
  FluentProvider,
  Spinner,
  teamsLightTheme,
} from "@fluentui/react-components";

import { LiveCanvasPage } from "../LiveCanvas/LiveCanvasPage";
import "./App.css";

enum TeamsTheme {
  HighContrast = "teamsHighContrastTheme",
  Dark = "teamsDarkTheme",
  Default = "teamsTheme",
}

export default function App() {
  const [host, setHost] = useState<teamJS.LiveShareHost | undefined>();
  const [appAppearance, setAppAppearance] = useState<TeamsTheme>(
    TeamsTheme.Default
  );

  useEffect(() => {
    teamJS.app.initialize().then(async () => {
      setHost(teamJS.LiveShareHost.create());
    });

    teamJS.app.getContext().then((context: teamJS.app.Context) => {
      setAppAppearance(initTeamsTheme(context.app.theme));
      teamJS.app.notifySuccess();
    });

    teamJS.app.registerOnThemeChangeHandler((theme) => {
      setAppAppearance(initTeamsTheme(theme));
    });
  }, []);

  if (host) {
    return (
      <FluentProvider theme={teamsLightTheme}>
        <LiveShareProvider host={host} joinOnLoad>
          <div className="App">
            <LiveCanvasPage />
          </div>
        </LiveShareProvider>
      </FluentProvider>
    );
  } else {
    return (
      <FluentProvider theme={teamsLightTheme}>
        <Spinner />
      </FluentProvider>
    );
  }
}

function initTeamsTheme(theme: string | undefined): TeamsTheme {
  switch (theme) {
    case "dark":
      return TeamsTheme.Dark;
    case "contrast":
      return TeamsTheme.HighContrast;
    default:
      return TeamsTheme.Default;
  }
}

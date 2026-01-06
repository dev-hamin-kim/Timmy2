import { useEffect, useRef, useState } from "react";

import { LiveState } from "@microsoft/live-share";
import { useLiveShareContext } from "@microsoft/live-share-react";
import {
  app,
  dialog,
  DialogDimension,
  DialogSize,
  meeting,
} from "@microsoft/teams-js";

import { useLivePoll } from "./useLivePoll";
import { CreatePollResult, PollState } from "./types";
import { createPollCard } from "./AdaptiveCards";
import { PollList } from "./PollList";

export const PollPage = () => {
  const { pollState, isInitialized } = useLivePoll();
  const userID = useRef<string | undefined>(undefined);
  const [polls, setPolls] = useState<PollState[]>([]);

  useEffect(() => {
    if (!pollState) return;

    const syncFromState = () => {
      setPolls(pollState.state);
    };

    syncFromState();
    pollState.on("stateChanged", syncFromState);

    return () => {
      pollState.off("stateChanged", syncFromState);
    };
  }, [pollState]);

  useEffect(() => {
    app.getContext().then((context: app.Context) => {
      userID.current = context.user?.id;
    });
  }, []);

  useEffect(() => {
    if (!pollState || !isInitialized) return;

    // Late joiner hydration: read existing shared state
    const existingPolls = pollState.state;
    console.log("hydrating polls for late joiner:", existingPolls);
    setPolls(existingPolls);
  }, [pollState, isInitialized]);

  const handleCreatePoll = async (result: CreatePollResult, userID: string) => {
    if (!pollState) return;

    const options = [
      result.option1,
      result.option2,
      result.option3 ?? "",
      result.option4 ?? "",
    ]
      .filter(Boolean)
      .map((text: string, index: number) => ({
        id: String(index),
        text,
      }));

    const poll: PollState = {
      id: crypto.randomUUID(),
      question: result.question,
      options,
      allowMultiple: result.allowMultiple === "true",
      votes: {},
      createdBy: userID,
      createdAt: Date.now(),
      isOpen: true,
    };

    const updatedPolls = [...pollState.state, poll];

    await pollState.set(updatedPolls);

    pollState.emit("newPollCreated", updatedPolls);
  };

  const cardSize = {
    height: DialogDimension.Medium,
    width: DialogDimension.Medium,
  };

  const onClickingCreatePoll = () => {
    dialog.adaptiveCard.open(
      { card: JSON.stringify(createPollCard), size: cardSize },
      async (response) => {
        if (response.err) {
          console.log(response.err);
          return;
        }

        if (response.result === undefined) return;
        console.log("response1: ", response.result);
        // Ensure result is an object and matches expected shape at runtime,
        // then cast to CreatePollResult for TypeScript and pass the actual user id string.
        if (typeof response.result !== "string") {
          console.log("response2: ", response.result);
          const result = response.result as CreatePollResult;

          // Basic runtime validation to avoid calling handler with an invalid shape
          if (
            typeof result.action === "undefined" ||
            typeof result.question !== "string" ||
            typeof result.option1 !== "string" ||
            typeof result.option2 !== "string" ||
            typeof result.allowMultiple === "undefined"
          ) {
            console.warn(
              "Adaptive card returned unexpected result shape:",
              result
            );
            return;
          }

          if (!userID.current) {
            console.warn("userID not available");
            return;
          }
          console.log("response3: ", response.result);

          await handleCreatePoll(result, userID.current);
        } else {
          const parsedResult = JSON.parse(response.result) as CreatePollResult;
          console.log("parsed Result", parsedResult);

          if (!userID.current) {
            console.warn("userID not available");
            return;
          }

          await handleCreatePoll(parsedResult, userID.current);
        }
      }
    );
  };

  return (
    <>
      <div>
        <button onClick={onClickingCreatePoll}>Create Poll</button>
        <PollList polls={polls} userID={userID.current} pollState={pollState} />
      </div>
    </>
  );
};


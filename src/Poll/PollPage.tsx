import { useEffect, useRef, useState } from "react";

import { app } from "@microsoft/teams-js";

import { useLivePoll } from "./useLivePoll";
import { CreatePollResult, PollState } from "./types";
import { PollList } from "./PollList";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Input,
  Field,
  Checkbox,
} from "@fluentui/react-components";
import { Add20Regular } from "@fluentui/react-icons";

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

  // removed Adaptive Card usage; using local dialog instead

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(false);

  const onClickingCreatePoll = () => setIsDialogOpen(true);

  const handleSubmitCreate = async () => {
    if (!userID.current) {
      console.warn("userID not available");
      return;
    }

    const result: CreatePollResult = {
      action: "createPoll",
      question,
      option1,
      option2,
      option3,
      option4,
      allowMultiple: allowMultiple ? "true" : "false",
    };

    await handleCreatePoll(result, userID.current);

    // reset
    setQuestion("");
    setOption1("");
    setOption2("");
    setOption3("");
    setOption4("");
    setAllowMultiple(false);
    setIsDialogOpen(false);
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--colorNeutralStroke2)",
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              color: "var(--colorNeutralForeground1)",
              fontWeight: 600,
            }}
          >
            Polls
          </span>
        </div>

        <Button
          appearance="primary"
          icon={<Add20Regular />}
          onClick={onClickingCreatePoll}
          size="small"
        >
          New Poll
        </Button>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
        }}
      >
        <PollList polls={polls} userID={userID.current} pollState={pollState} />
      </div>
      {/* Create button moved to header */}

      {/* Create Poll Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(_, data) => setIsDialogOpen(data.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Create Poll</DialogTitle>
            <DialogContent>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <Field label="Question" required>
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </Field>

                <Field label="Option 1" required>
                  <Input
                    value={option1}
                    onChange={(e) => setOption1(e.target.value)}
                  />
                </Field>

                <Field label="Option 2" required>
                  <Input
                    value={option2}
                    onChange={(e) => setOption2(e.target.value)}
                  />
                </Field>

                <Field label="Option 3">
                  <Input
                    value={option3}
                    onChange={(e) => setOption3(e.target.value)}
                  />
                </Field>

                <Field label="Option 4">
                  <Input
                    value={option4}
                    onChange={(e) => setOption4(e.target.value)}
                  />
                </Field>

                <Checkbox
                  label="Allow multiple selections"
                  checked={allowMultiple}
                  onChange={(_, data) => setAllowMultiple(!!data.checked)}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button
                appearance="primary"
                onClick={handleSubmitCreate}
                disabled={!question || !option1 || !option2}
              >
                Create
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

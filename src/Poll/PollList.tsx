import { LiveState } from "@microsoft/live-share";

import { PollState } from "./types";

import {
  Checkbox,
  Radio,
  RadioGroup,
  Text,
  makeStyles,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  pollCard: {
    border: "1px solid var(--colorNeutralStroke2)",
    borderRadius: "8px",
    padding: "12px",
    backgroundColor: "var(--colorNeutralBackground1)",
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  metaText: {
    fontSize: "12px",
    color: "var(--colorNeutralForeground3)",
  },
  emptyText: {
    color: "var(--colorNeutralForeground3)",
    fontSize: "14px",
  },
  questionText: {
    color: "var(--colorNeutralForeground1)",
    fontWeight: 600,
  },
});

interface pollListProps {
  polls: PollState[];
  userID?: string;
  pollState?: LiveState<PollState[]>;
}

export function PollList({ polls, userID, pollState }: pollListProps) {
  const styles = useStyles();

  const submitVote = async (
    pollId: string,
    selectedOptionIDs: string[],
    userID: string
  ) => {
    if (!pollState) return;

    const updatedPolls = pollState.state.map((poll) => {
      if (poll.id !== pollId) return poll;

      return {
        ...poll,
        votes: {
          ...poll.votes,
          [userID]: selectedOptionIDs,
        },
      };
    });

    // Persist for late joiners
    await pollState.set(updatedPolls);

    // Notify active listeners
    pollState.emit("pollVoted", updatedPolls);
  };

  const getVoteCount = (poll: PollState, optionId: string) => {
    return Object.values(poll.votes).filter((votes) => votes.includes(optionId))
      .length;
  };

  const getTotalVoters = (poll: PollState) => {
    return Object.keys(poll.votes).length;
  };

  const getVotePercentage = (poll: PollState, optionId: string): number => {
    const totalVoters = getTotalVoters(poll);
    if (totalVoters === 0) return 0;

    return Math.round((getVoteCount(poll, optionId) / totalVoters) * 100);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {polls.length === 0 && (
        <Text className={styles.emptyText}>No polls yet</Text>
      )}

      {polls.map((poll) => (
        <div key={poll.id} className={styles.pollCard}>
          <Text className={styles.questionText}>{poll.question}</Text>
          <RadioGroup value={poll.allowMultiple ? undefined : (poll.votes[userID ?? ""] ?? [])[0]}>
            {poll.options.map((opt) => {
              const userVotes = poll.votes[userID ?? ""] ?? [];
              const isSelected = userVotes.includes(opt.id);

              return (
                <div key={opt.id} className={styles.optionRow}>
                  {poll.allowMultiple ? (
                    <Checkbox
                      checked={isSelected}
                      label={opt.text}
                      onChange={async (_, data) => {
                        if (!userID) return;

                        const nextSelection = data.checked
                          ? [...userVotes, opt.id]
                          : userVotes.filter((id) => id !== opt.id);

                        await submitVote(poll.id, nextSelection, userID);
                      }}
                    />
                  ) : (
                    <Radio
                      value={opt.id}
                      checked={isSelected}
                      label={opt.text}
                      onClick={async () => {
                        if (!userID) return;
                        await submitVote(poll.id, [opt.id], userID);
                      }}
                    />
                  )}

                  <Text className={styles.metaText}>
                    {getVoteCount(poll, opt.id)} votes · {getVotePercentage(poll, opt.id)}%
                  </Text>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      ))}
    </div>
  );
}

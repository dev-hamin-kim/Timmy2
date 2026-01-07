import { LiveState } from "@microsoft/live-share";

import { PollState } from "./types";

interface pollListProps {
  polls: PollState[];
  userID?: string;
  pollState?: LiveState<PollState[]>;
}

export function PollList({ polls, userID, pollState }: pollListProps) {
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
      {polls.length === 0 && <p>No polls yet</p>}

      {polls.map((poll) => (
        <div
          key={poll.id}
          style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}
        >
          <h3>{poll.question}</h3>
          <ul>
            {poll.options.map((opt) => {
              const userVotes = poll.votes[userID ?? ""] ?? [];
              const isSelected = userVotes.includes(opt.id);

              return (
                <li key={opt.id}>
                  <label>
                    <input
                      type={poll.allowMultiple ? "checkbox" : "radio"}
                      name={poll.id}
                      checked={isSelected}
                      onChange={async () => {
                        if (!userID) return;

                        let nextSelection: string[];

                        if (poll.allowMultiple) {
                          nextSelection = isSelected
                            ? userVotes.filter((id) => id !== opt.id)
                            : [...userVotes, opt.id];
                        } else {
                          nextSelection = [opt.id];
                        }

                        await submitVote(poll.id, nextSelection, userID);
                      }}
                    />
                    <span style={{ marginRight: 8 }}>{opt.text}</span>
                    <span style={{ fontSize: 12, color: "#666" }}>
                      {getVoteCount(poll, opt.id)} votes
                      {" · "}
                      {getVotePercentage(poll, opt.id)}%
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

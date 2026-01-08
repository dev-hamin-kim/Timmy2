import { LiveState } from "@microsoft/live-share";

import { PollState } from "./types";

import {
  Checkbox,
  Radio,
  RadioGroup,
  Text,
  makeStyles,
  Button,
} from "@fluentui/react-components";
import { useState, ComponentType, memo } from "react";
import {
  DonutChart,
  VerticalBarChart,
  type DonutChartProps,
  type VerticalBarChartProps,
  type ChartProps,
  type ChartDataPoint,
  type VerticalBarChartDataPoint,
} from "@fluentui/react-charts";

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

export const PollList = memo(function PollList({ polls, userID, pollState }: pollListProps) {
  const styles = useStyles();
  const [chartTypeByPoll, setChartTypeByPoll] = useState<
    Record<string, "donut" | "bar">
  >({});

  // toggle handled inline by buttons; helper removed to avoid unused lint

  const PollChart = ({
    poll,
    type,
  }: {
    poll: PollState;
    type: "donut" | "bar";
  }) => {
    const counts = poll.options.map((opt) => getVoteCount(poll, opt.id));
    const total = counts.reduce((s, v) => s + v, 0);

    if (total === 0) {
      return (
        <div style={{ padding: 12, color: "var(--colorNeutralForeground3)" }}>
          No votes yet
        </div>
      );
    }

    if (type === "donut") {
      // Build a ChartProps.chartData array matching the fluent types: ChartDataPoint[]
      const chartData: ChartDataPoint[] = poll.options.map((opt, i) => ({
        legend: opt.text,
        data: getVoteCount(poll, opt.id),
        color: colorForIndex(i),
        xAxisCalloutData: opt.text,
      }));

      const chartProps: ChartProps = { chartData };

      const DonutTyped: ComponentType<DonutChartProps> =
        DonutChart as ComponentType<DonutChartProps>;

      return (
        <div style={{ padding: 8 }}>
          <DonutTyped data={chartProps} width={120} height={120} />
        </div>
      );
    }

    // bar — give the vertical bar more horizontal room so bars don't look squashed
    const barData: VerticalBarChartDataPoint[] = poll.options.map((opt, i) => ({
      x: opt.text,
      y: getVoteCount(poll, opt.id),
      legend: opt.text,
      color: colorForIndex(i),
      xAxisCalloutData: opt.text,
    }));

    const VBarTyped: ComponentType<VerticalBarChartProps> =
      VerticalBarChart as ComponentType<VerticalBarChartProps>;

    const barWidth = 220;
    const barHeight = 120;

    return (
      <div style={{ padding: 8, width: barWidth }}>
        <VBarTyped data={barData} width={barWidth} height={barHeight} />
      </div>
    );
  };

  // helpers for chart

  const colorForIndex = (i: number) => {
    const palette = [
      "#0078D4",
      "#107C10",
      "#E81123",
      "#FF8C00",
      "#5C2D91",
      "#008272",
    ];
    return palette[i % palette.length];
  };

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
        <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 8,
            }}>
          <Text className={styles.emptyText}>No polls yet</Text>
        </div>
      )}

      {polls.map((poll) => (
        <div key={poll.id} className={styles.pollCard}>
          <div>
            <Text className={styles.questionText}>{poll.question}</Text>
            <div style={{ marginTop: 8 }}>
              <RadioGroup
                value={
                  poll.allowMultiple
                    ? undefined
                    : (poll.votes[userID ?? ""] ?? [])[0]
                }
              >
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
                        {getVoteCount(poll, opt.id)} votes · {" "}
                        {getVotePercentage(poll, opt.id)}%
                      </Text>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <Button
                appearance={
                  chartTypeByPoll[poll.id] === "donut" ? "primary" : "transparent"
                }
                onClick={() => setChartTypeByPoll((p) => ({ ...p, [poll.id]: "donut" }))}
              >
                Donut
              </Button>
              <Button
                appearance={
                  chartTypeByPoll[poll.id] === "bar" ? "primary" : "transparent"
                }
                onClick={() => setChartTypeByPoll((p) => ({ ...p, [poll.id]: "bar" }))}
              >
                Bar
              </Button>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <PollChart poll={poll} type={chartTypeByPoll[poll.id] ?? "donut"} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

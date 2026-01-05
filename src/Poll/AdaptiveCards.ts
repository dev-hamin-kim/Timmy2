import { PollState } from "./types";

export const createPollCard = {
  type: "AdaptiveCard",
  $schema: "https://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
  body: [
    {
      type: "TextBlock",
      text: "🗳️ Create a Poll",
      weight: "Bolder",
      size: "Medium"
    },
    {
      type: "Input.Text",
      id: "question",
      label: "Poll question",
      placeholder: "What should we vote on?",
      isRequired: true
    },
    {
      type: "TextBlock",
      text: "Options",
      weight: "Bolder",
      spacing: "Medium"
    },
    {
      type: "Input.Text",
      id: "option1",
      label: "Option 1",
      isRequired: true
    },
    {
      type: "Input.Text",
      id: "option2",
      label: "Option 2",
      isRequired: true
    },
    {
      type: "Input.Text",
      id: "option3",
      label: "Option 3 (optional)"
    },
    {
      type: "Input.Text",
      id: "option4",
      label: "Option 4 (optional)"
    },
    {
      type: "Input.Toggle",
      id: "allowMultiple",
      title: "Allow multiple selections",
      valueOn: "true",
      valueOff: "false"
    }
  ],
  actions: [
    {
      type: "Action.Submit",
      title: "Create poll",
      data: {
        action: "createPoll"
      }
    }
  ]
}

export const voteCard = (poll: PollState) => {
  return {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        text: poll.question,
        weight: "Bolder",
      },
      {
        type: "Input.ChoiceSet",
        id: "vote",
        style: "expanded",
        isMultiSelect: poll.allowMultiple,
        choices: poll.options.map((o, i) => ({
          title: o,
          value: String(i),
        })),
      },
    ],
    actions: [
      {
        type: "Action.Submit",
        title: "Submit vote",
        data: { action: "submitVote" },
      },
    ],
  };
};

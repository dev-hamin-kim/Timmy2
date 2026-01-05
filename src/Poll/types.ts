export type PollOption = {
  id: string;
  text: string;
};

export type VoteMap = {
  [userId: string]: string[]; // optionIds
};

export type PollState = {
  id: string;
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  votes: VoteMap;
  createdBy: string;
  createdAt: number;
  isOpen: boolean;
};

export type CreatePollResult = {
  action: "createPoll";
  question: string;
  option1: string;
  option2: string;
  option3?: string;
  option4?: string;
  allowMultiple: "true" | "false";
};
export interface PollOptionResult {
  id: string
  option_text: string
  position: number
  voteCount: number
}

export interface PollResults {
  options: PollOptionResult[]
  totalVotes: number
  myVoteOptionId: string | null
}

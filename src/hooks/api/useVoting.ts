import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { VoteDirection } from "../../lib/types";
import { useState } from "react";

export function useVoting(modeId: Id<"modes">) {
  const [isVotingDisabled, setIsVotingDisabled] = useState(false);

  const voteMutation = useMutation(api.mutation.vote);
  const userVote = useQuery(api.query.getUserVote, { modeId });

  const handleVote = async (direction: VoteDirection) => {
    try {
      setIsVotingDisabled(true);
      await voteMutation({ modeId, direction });
    } catch (error) {
      console.error("Failed to vote:", error);
    } finally {
      setIsVotingDisabled(false);
    }
  };

  return {
    userVote,
    isVotingDisabled,
    handleVote,
  };
}

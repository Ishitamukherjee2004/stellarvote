import { useState, useEffect } from 'react';
import PollCard from './PollCard';

export default function PollList({ polls, resultsMap, onVote, userAddress }) {
  const [votingId, setVotingId] = useState(null);

  const handleVote = async (pollId, optionIdx) => {
    setVotingId(pollId);
    try {
      await onVote(pollId, optionIdx);
    } finally {
      setVotingId(null);
    }
  };

  if (!polls || polls.length === 0) {
    return (
      <div className="text-center py-12 bg-dark-800/50 rounded-xl border border-white/5">
        <p className="text-gray-400">No polls available right now.</p>
        <p className="text-sm text-gray-500 mt-2">Create the first poll to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {polls.map((poll) => (
        <PollCard
          key={Number(poll.id)}
          poll={poll}
          results={resultsMap[Number(poll.id)]}
          onVote={handleVote}
          isVoting={votingId === poll.id}
          userVotedIndex={null} // We don't track user votes permanently in state for this simple version unless we fetch it
        />
      ))}
    </div>
  );
}

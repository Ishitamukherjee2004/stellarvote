import { useState } from 'react';
import { ChartBar, CheckCircle2 } from 'lucide-react';

export default function PollCard({ poll, results, onVote, userVotedIndex, isVoting }) {
  const totalVotes = results?.reduce((a, b) => a + b, 0) || 1; // avoid division by 0

  return (
    <div className="bg-dark-800 rounded-xl p-6 shadow-xl border border-white/5 backdrop-blur-sm flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-white leading-tight">
          {poll.question}
        </h3>
        {!poll.is_active && (
          <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded w-max">
            Closed
          </span>
        )}
      </div>

      <div className="space-y-3 mt-auto">
        {poll.options.map((option, idx) => {
          const votes = results ? results[idx] : 0;
          const percentage = results ? Math.round((votes / totalVotes) * 100) : 0;
          const isSelected = userVotedIndex === idx;

          return (
            <div key={idx} className="relative group">
              <button
                onClick={() => onVote(poll.id, idx)}
                disabled={!poll.is_active || userVotedIndex !== null || isVoting}
                className={`w-full text-left flex justify-between items-center p-3 rounded-lg border transition-all z-10 relative
                  ${isSelected ? 'bg-primary-500/20 border-primary-500 text-primary-300' : 'bg-dark-900 border-gray-700/50 hover:border-gray-600'}
                  ${(userVotedIndex !== null || !poll.is_active) ? 'cursor-default' : 'hover:bg-dark-700 cursor-pointer'}
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium z-20 relative mix-blend-difference">{option}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-500 z-20" />}
                </div>
                {results && (
                  <span className="text-sm font-semibold z-20 relative mix-blend-difference">
                    {percentage}% ({votes})
                  </span>
                )}
              </button>
              
              {results && (
                <div 
                  className={`absolute top-0 left-0 h-full rounded-lg opacity-20 transition-all duration-1000 ease-out ${isSelected ? 'bg-primary-500' : 'bg-gray-400'}`}
                  style={{ width: `${percentage}%` }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center text-sm text-gray-400">
        <span className="flex items-center gap-1">
          <ChartBar className="w-4 h-4" />
          {results ? results.reduce((a, b) => a + b, 0) : 0} Total Votes
        </span>
        <span>Poll #{Number(poll.id)}</span>
      </div>
    </div>
  );
}

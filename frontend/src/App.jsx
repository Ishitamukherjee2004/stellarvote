import { useState, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import CreatePoll from './components/CreatePoll';
import PollList from './components/PollList';
import { Client, networks } from './contracts/voting/src';
import { signTransaction } from '@stellar/freighter-api';
import { Vote } from 'lucide-react';

// Stellar Testnet Soroban RPC endpoint
const TESTNET_RPC_URL = 'https://soroban-testnet.stellar.org';

// Initialize the Smart Contract Client with the required rpcUrl
const client = new Client({
  ...networks.testnet,
  rpcUrl: TESTNET_RPC_URL,
});


function App() {
  const [address, setAddress] = useState(null);
  const [polls, setPolls] = useState([]);
  const [resultsMap, setResultsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFundingAndRetrying, setIsFundingAndRetrying] = useState(false);

  // Auto-fund via Friendbot then retry an action
  const fundAccountAndRetry = async (retryFn) => {
    setIsFundingAndRetrying(true);
    setError('🪙 Account not funded yet — funding via Friendbot (testnet only)...');
    try {
      const res = await fetch(`https://friendbot.stellar.org?addr=${address}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // already funded — just retry
        if (!body?.detail?.includes('createAccountAlreadyExist')) {
          throw new Error('Friendbot funding failed');
        }
      }
      setError('✅ Funded! Retrying your transaction...');
      await retryFn();
      setError(null);
    } catch (e) {
      setError(`Funding failed: ${e.message}. Please visit https://friendbot.stellar.org and fund: ${address}`);
    } finally {
      setIsFundingAndRetrying(false);
    }
  };


  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setIsLoading(true);
    try {
      const fetchedPolls = [];
      const fetchedResults = {};
      
      // Since we don't have a get_all_polls or get_poll_count, we fetch sequentially until failure.
      // In a production app, we would add get_poll_count to the contract.
      for (let i = 0; i < 20; i++) {
        try {
          // get_poll doesn't require signing if we just simulate it to read state
          const { result: poll } = await client.get_poll({ poll_id: BigInt(i) });
          if (poll) {
            fetchedPolls.push(poll);
            
            // fetch results too
            const { result: results } = await client.get_results({ poll_id: BigInt(i) });
            fetchedResults[Number(poll.id)] = results;
          }
        } catch (e) {
          // If poll doesn't exist, it throws. We break the loop.
          break;
        }
      }
      
      setPolls(fetchedPolls.reverse()); // Show newest first
      setResultsMap(fetchedResults);
    } catch (err) {
      console.error("Error fetching polls:", err);
      // Don't show error for the simple "not found" breaking loop
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePoll = async (question, options) => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }
    
    const doCreate = async () => {
      const tx = await client.create_poll({ question, options }, { publicKey: address });
      await tx.signAndSend({
        signTransaction: async (xdr, opts) =>
          signTransaction(xdr, {
            networkPassphrase: networks.testnet.networkPassphrase,
            address,
            ...opts,
          }),
      });
      await fetchPolls();
    };

    try {
      await doCreate();
    } catch (err) {
      console.error(err);
      if (err.message?.includes('Account not found')) {
        await fundAccountAndRetry(doCreate);
      } else {
        setError(err.message || 'Failed to create poll. Did you reject the transaction?');
      }
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }
    
    const doVote = async () => {
      const tx = await client.vote(
        { voter: address, poll_id: BigInt(pollId), option_index: optionIndex },
        { publicKey: address }
      );
      await tx.signAndSend({
        signTransaction: async (xdr, opts) =>
          signTransaction(xdr, {
            networkPassphrase: networks.testnet.networkPassphrase,
            address,
            ...opts,
          }),
      });
      await fetchPolls();
    };

    try {
      await doVote();
    } catch (err) {
      console.error(err);
      if (err.message?.includes('Account not found')) {
        await fundAccountAndRetry(doVote);
      } else if (err.message?.includes('already voted')) {
        setError('You have already voted in this poll');
      } else {
        setError(err.message || "Failed to vote. Ensure you haven't voted already.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white selection:bg-primary-500/30">
      <nav className="border-b border-white/5 bg-dark-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              StellarVote
            </h1>
          </div>
          
          <WalletConnect onAddressChange={setAddress} />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="hover:text-red-300">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <CreatePoll onCreate={handleCreatePoll} />
            
            <div className="bg-dark-800/50 rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-semibold mb-2">How it works</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex gap-2"><span className="text-primary-500">•</span> Connect your Freighter wallet</li>
                <li className="flex gap-2"><span className="text-primary-500">•</span> Create decentralized polls</li>
                <li className="flex gap-2"><span className="text-primary-500">•</span> Vote securely (1 wallet = 1 vote)</li>
                <li className="flex gap-2"><span className="text-primary-500">•</span> Results live on the Stellar Testnet forever</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Active Polls</h2>
              <button onClick={fetchPolls} className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                Refresh
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                <p className="text-gray-400 animate-pulse">Syncing with Stellar Testnet...</p>
              </div>
            ) : (
              <PollList 
                polls={polls} 
                resultsMap={resultsMap} 
                onVote={handleVote}
                userAddress={address}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

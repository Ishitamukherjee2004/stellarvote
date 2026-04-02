import { useState, useEffect } from 'react';
import { isConnected, requestAccess, getAddress } from '@stellar/freighter-api';
import { Wallet, Droplets } from 'lucide-react';

const FRIENDBOT_URL = 'https://friendbot.stellar.org';

export default function WalletConnect({ onAddressChange }) {
  const [address, setAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [fundStatus, setFundStatus] = useState(null);
  const [noExtension, setNoExtension] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { isConnected: connected } = await isConnected();
      if (connected) {
        const { address: addr, error } = await getAddress();
        if (!error && addr) {
          setAddress(addr);
          onAddressChange(addr);
        }
      }
    } catch (e) {
      console.error('Wallet check failed:', e);
    }
  };

  const connect = async () => {
    setIsConnecting(true);
    setNoExtension(false);
    try {
      const { address: addr, error } = await requestAccess();
      if (error) {
        if (error.includes('not installed') || error.includes('undefined')) {
          setNoExtension(true);
        }
        throw new Error(error);
      }
      if (addr) {
        setAddress(addr);
        onAddressChange(addr);
      }
    } catch (e) {
      console.error('Failed to connect:', e);
    } finally {
      setIsConnecting(false);
    }
  };

  const fundAccount = async () => {
    if (!address) return;
    setIsFunding(true);
    setFundStatus(null);
    try {
      const res = await fetch(`${FRIENDBOT_URL}?addr=${address}`);
      if (res.ok) {
        setFundStatus('success');
      } else {
        const body = await res.json().catch(() => ({}));
        if (body?.detail?.includes('createAccountAlreadyExist') || res.status === 400) {
          setFundStatus('already');
        } else {
          setFundStatus('error');
        }
      }
    } catch (e) {
      setFundStatus('error');
    } finally {
      setIsFunding(false);
      setTimeout(() => setFundStatus(null), 4000);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  if (address) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <button
            onClick={fundAccount}
            disabled={isFunding}
            title="Fund this account with 10,000 test XLM via Friendbot"
            className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-full text-xs font-medium transition-all"
          >
            <Droplets className="w-3.5 h-3.5" />
            {isFunding ? 'Funding...' : 'Fund Testnet'}
          </button>

          <div className="flex items-center gap-2 bg-dark-800 border border-gray-700 rounded-full px-4 py-2 shadow-sm shadow-primary-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-gray-200">{formatAddress(address)}</span>
          </div>
        </div>

        {fundStatus === 'success' && (
          <span className="text-xs text-emerald-400">✅ Funded with 10,000 test XLM!</span>
        )}
        {fundStatus === 'already' && (
          <span className="text-xs text-yellow-400">⚡ Already funded — you're good to go!</span>
        )}
        {fundStatus === 'error' && (
          <span className="text-xs text-red-400">❌ Friendbot failed. Try again.</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={connect}
        disabled={isConnecting}
        className="flex flex-row items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {noExtension && (
        <a
          href="https://www.freighter.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          ⚠ Freighter not found. Install it →
        </a>
      )}
    </div>
  );
}

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { useNotifications, NotificationTemplates } from '../components/NotificationSystem';
import { useErrorHandler } from '../hooks/useErrorHandler';
import type { WalletAccount, WalletState } from '../types';

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  selectAccount: (account: WalletAccount) => void;
  signTransaction: (address: string, payload: any) => Promise<any>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

type WalletAction =
  | { type: 'SET_CONNECTING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: { accounts: WalletAccount[]; selectedAccount?: WalletAccount } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SELECT_ACCOUNT'; payload: WalletAccount }
  | { type: 'DISCONNECT' }
  | { type: 'CLEAR_ERROR' };

const initialState: WalletState = {
  isConnected: false,
  isConnecting: false,
  accounts: [],
  selectedAccount: null,
  error: null,
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_CONNECTING':
      return { ...state, isConnecting: action.payload, error: null };
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: true,
        isConnecting: false,
        accounts: action.payload.accounts,
        selectedAccount: action.payload.selectedAccount || action.payload.accounts[0] || null,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isConnecting: false };
    case 'SELECT_ACCOUNT':
      return { ...state, selectedAccount: action.payload };
    case 'DISCONNECT':
      return { ...initialState };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const { showSuccess, showInfo, addNotification } = useNotifications();
  const { handleWalletError } = useErrorHandler();

  // Check for saved wallet connection on mount
  useEffect(() => {
    const savedAccount = localStorage.getItem('freelanceforge_wallet_account');
    if (savedAccount) {
      try {
        const account = JSON.parse(savedAccount);
        // Attempt to reconnect
        reconnectWallet(account);
      } catch (error) {
        console.error('Failed to parse saved account:', error);
        localStorage.removeItem('freelanceforge_wallet_account');
      }
    }
  }, []);

  const reconnectWallet = async (savedAccount: WalletAccount) => {
    try {
      dispatch({ type: 'SET_CONNECTING', payload: true });

      const extensions = await web3Enable('FreelanceForge');
      if (extensions.length === 0) {
        throw new Error('No wallet extension found');
      }

      const accounts = await web3Accounts();
      const validAccount = accounts.find(acc => acc.address === savedAccount.address);

      if (validAccount) {
        dispatch({
          type: 'SET_CONNECTED',
          payload: { accounts, selectedAccount: validAccount }
        });

        // Show reconnection success
        showInfo('Wallet reconnected successfully');
      } else {
        // Account no longer available, clear saved data
        localStorage.removeItem('freelanceforge_wallet_account');
        throw new Error('Previously connected account is no longer available');
      }
    } catch (error) {
      console.error('Reconnection failed:', error);
      localStorage.removeItem('freelanceforge_wallet_account');

      // Use error handler for consistent error handling
      handleWalletError(error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reconnect wallet' });
    }
  };

  const connectWallet = async () => {
    try {
      dispatch({ type: 'SET_CONNECTING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Enable the extension
      const extensions = await web3Enable('FreelanceForge');

      if (extensions.length === 0) {
        // Show wallet not found notification with install link
        addNotification(NotificationTemplates.walletNotFound());
        throw new Error('No wallet extension detected. Please install Polkadot.js extension.');
      }

      // Get accounts
      const accounts = await web3Accounts();

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your wallet extension.');
      }

      dispatch({ type: 'SET_CONNECTED', payload: { accounts } });

      // Show success notification
      const accountName = accounts[0]?.meta.name || 'Account';
      addNotification(NotificationTemplates.walletConnected(accountName));

      // Save the first account for auto-reconnection
      if (accounts[0]) {
        localStorage.setItem('freelanceforge_wallet_account', JSON.stringify(accounts[0]));
      }
    } catch (error) {
      // Use error handler for consistent error handling
      handleWalletError(error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem('freelanceforge_wallet_account');
    dispatch({ type: 'DISCONNECT' });

    // Show disconnection notification
    addNotification(NotificationTemplates.walletDisconnected());
  };

  const selectAccount = (account: WalletAccount) => {
    dispatch({ type: 'SELECT_ACCOUNT', payload: account });
    localStorage.setItem('freelanceforge_wallet_account', JSON.stringify(account));
  };

  const signTransaction = async (address: string, payload: any) => {
    try {
      const injector = await web3FromAddress(address);
      if (!injector.signer.signPayload) {
        throw new Error('Signer does not support payload signing');
      }
      return await injector.signer.signPayload(payload);
    } catch (error) {
      // Use error handler for transaction signing errors
      handleWalletError(error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to sign transaction';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const contextValue: WalletContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    selectAccount,
    signTransaction,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
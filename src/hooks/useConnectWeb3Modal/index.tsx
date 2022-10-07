import React, { useCallback, useEffect, useRef, useState } from 'react';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from 'walletlink';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';

import { ethers, providers } from 'ethers';

const CHAIN_ID = process.env.IS_DEV === 'true' ? '0x4' : '0x1';
const NETWORK_NAME = process.env.IS_DEV === 'true' ? 'rinkeby' : 'mainnet';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS
  ? process.env.CONTRACT_ADDRESS
  : '';

const useConnectWeb3Modal = (web3Modal?: Web3Modal) => {
  const [connectedAddress, setConnectedAddress] = useState<string>();
  const [contract, setContract] = useState<Contract>();

  const [web3Provider, setWeb3Provider] = useState<Web3>();
  const [ethersProvider, setEthersProvider] =
    useState<ethers.providers.Web3Provider>();

  const [isListening, setIsListening] = useState<boolean>(false);
  const [disconnectAccumulator, incrementDisconnectAccumulator] =
    useState<number>(0);

  const addListeners = async (provider: any) => {
    provider.on('accountsChanged', (accounts: string[]) => {
      if (accounts[0]) {
        setConnectedAddress(accounts[0]);
      } else {
        disconnect();
      }
    });
    setIsListening(true);
  };

  useEffect(() => {
    // Automatically connect wallet if user is already connected
    if (web3Modal && web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [web3Modal]);

  const GetFunctionAbi = async (): Promise<AbiItem[]> => {
    const GetABI = async (): Promise<AbiItem[]> => {
      const response = await fetch(`api/abi`, {
        method: 'GET',
      });
      return response.json();
    };

    const abi_item = await GetABI();
    return abi_item as AbiItem[];
  };

  // useEffect(() => {
  //   if (web3Modal) {
  //     connectWallet();
  //   }
  // }, [web3Modal]);

  const connectWallet = async () => {
    if (web3Modal) {
      const provider = await web3Modal.connect().catch(error => {
        if (
          error.toString().includes('User closed modal') ||
          error.toString().includes('User denied account authorization') ||
          error.toString().includes('Modal closed by user') ||
          error.toString().includes('User Rejected')
        ) {
          // console.log('User Closed Modal');
          return;
        } else {
          throw new Error(error.toString());
        }
      });
      if (provider) {
        if (!isListening) {
          addListeners(provider);
        }
        const web3 = new Web3(provider);
        setWeb3Provider(web3);

        const ethersProvider = new providers.Web3Provider(provider);
        setEthersProvider(ethersProvider);

        const accounts = await web3.eth.getAccounts();
        setConnectedAddress(accounts[0]);
        const ABI = await GetFunctionAbi();
        const contractObj = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
        setContract(contractObj as any);
      }
    } else {
      // console.log(`web3Modal is undefined`)
    }
  };
  const refreshState = () => {
    setContract(undefined);
    setConnectedAddress(undefined);
    setWeb3Provider(undefined);
    setEthersProvider(undefined);
  };

  const disconnect = () => {
    localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
    if (web3Modal) {
      web3Modal.clearCachedProvider();
    }
    setContract(undefined);
    setConnectedAddress(undefined);
    setWeb3Provider(undefined);
    setEthersProvider(undefined);
  };

  return {
    connectWallet,
    connectedAddress,
    contract,
    web3Provider,
    disconnect,
  };
};
export default useConnectWeb3Modal;

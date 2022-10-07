import '../src/styles/globals.css';
import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// web3modal dependencies start
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from 'walletlink';
import Web3Modal from 'web3modal';
import useConnectWeb3Modal from '@/src/hooks/useConnectWeb3Modal';
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
// web3modal dependencies end

export interface IPageProps {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  contract?: Contract;
  web3Provider?: Web3;
  connectedAddress?: string;
  connectWallet: () => Promise<void>;
  disconnect: () => Promise<void>;
}

interface IRootProps extends AppProps {
  Component: NextPage<any, IPageProps>;
}

const CHAIN_ID = process.env.IS_DEV === 'true' ? '0x4' : '0x1';
const NETWORK_NAME = process.env.IS_DEV === 'true' ? 'rinkeby' : 'mainnet';

export default function App(props: IRootProps) {
  const { Component } = props;

  const [darkMode, setDarkMode] = useState<boolean>();
  const [modal, setModal] = useState<Web3Modal>();
  useEffect(() => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: '2a900f7aabc6460b94bcfea23f69d5d2',
        },
      },
      walletlink: {
        package: WalletLink,
        options: {
          appName: 'NFT project',
          infuraId: '2a900f7aabc6460b94bcfea23f69d5d2',
          rpc: '',
          chainId: CHAIN_ID,
          appLogoUrl: null,
          darkMode: true,
        },
      },
    };

    const web3Modal = new Web3Modal({
      network: NETWORK_NAME,
      theme: 'dark',
      cacheProvider: true,
      providerOptions,
    });
    setModal(web3Modal);
  }, []);

  const { contract, web3Provider, connectedAddress, connectWallet, disconnect } =
    useConnectWeb3Modal(modal);

  useEffect(() => {
    console.log(`darkMode`, darkMode);
    if (darkMode !== undefined) {
      if (darkMode) {
        // Set value of  darkmode to dark
        document.documentElement.setAttribute('data-theme', 'dark');
        window.localStorage.setItem('theme', 'dark');
      } else {
        // Set value of  darkmode to light
        document.documentElement.setAttribute('data-theme', 'light');
        window.localStorage.setItem('theme', 'light');
      }
    }
  }, [darkMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    const initialColorValue = root.style.getPropertyValue(
      '--initial-color-mode'
    );
    // Set initial darkmode to light
    setDarkMode(initialColorValue === 'dark');
  }, []);

  return (
    <>
      <ToastContainer toastClassName="custom-notify" position="top-center" />
      <Component
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        contract={contract}
        connectedAddress={connectedAddress}
        connectWallet={connectWallet}
        disconnect={disconnect}
        web3Provider={web3Provider}
      />
    </>
  );
}

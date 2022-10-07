import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useConnectWeb3Modal from '../src/hooks/useConnectWeb3Modal';
import { Contract } from 'web3-eth-contract';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from 'walletlink';
import Web3Modal from 'web3modal';
import styles from '../src/styles/pages/index.module.css';
import { IPageProps } from './_app';

const Home: NextPage<IPageProps> = ({
  contract,
  web3Provider,
  connectedAddress,
  connectWallet,
  disconnect,
}) => {
  const [methodName, setMethodName] = useState<string>('');

  const contractInteract = async (
    contract: Contract,
    connectedAddress: string
  ) => {
    await contract.methods
      .mint(1, [])
      .send({ from: connectedAddress, value: 1000000, gas: 176610 })
      .on('transactionHash', (transactionHash: string) => {})
      .on('receipt', (receipt: unknown) => {})
      .on('error', (error: any) => {
        if (
          !(
            error.message ===
              'MetaMask Tx Signature: User denied transaction signature.' ||
            error.message ===
              `Cannot set properties of undefined (setting 'loadingDefaults')` ||
            error.message === 'User rejected the transaction' ||
            error.message === 'User denied transaction signature'
          )
        ) {
          if (error.message === 'execution reverted: Max two per wallet') {
            toast.error('Max two per wallet');
          } else {
            toast.error('Transaction status unknown');
            // console.log(`Transaction error:`, error.message);
          }
        }
      })
      .finally(() => {});
  };
  return (
    <>
      <Head>
        <title>Home</title>
        <meta name="description" content="Home page description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container} id="app">
        {/* {isConnectModalOpen && (
          <ConnectWalletModal
            isOpen={isConnectModalOpen}
            closeModal={() => {
              setIsConnectModalOpen(false);
            }}
            connectedWallet={connectedWallet}
            connectMetamask={connectMetamask}
            connectToWalletConnect={connectToWalletConnect}
            connectWalletLink={connectWalletLink}
          />
        )} */}

        <input
          value={methodName}
          onChange={e => setMethodName(e.target.value)}
        ></input>
        {/* <PaymentModal
          isOpen={isPaymentModalOpen}
          setIsOpen={setIsPaymentModalOpen}
          methodName={methodName}
          connectedAddress={'0x00000000000000000'}
        /> */}

        <div className={styles.buttonTray}>
          <div
            className={styles.button}
            onClick={() => {
              connectWallet();
            }}
          >
            {connectedAddress
              ? `${connectedAddress.slice(0, 6)}...${connectedAddress.slice(
                  connectedAddress.length - 5,
                  connectedAddress.length - 1
                )}`
              : `Connect Wallet`}
          </div>
          <div
            className={styles.button}
            onClick={() => {
              disconnect();
            }}
          >{`Disconnect Wallet`}</div>
          <div
            className={styles.button}
            onClick={async () => {
              if (contract && connectedAddress) {
                contractInteract(contract, connectedAddress);
              }
            }}
          >
            {`Transact`}
          </div>
          <div
            className={styles.button}
            onClick={async () => {
              if (web3Provider && web3Provider.currentProvider) {
                const chain_id = await web3Provider.eth.getChainId();
                (web3Provider.currentProvider as any).request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x4' }],
                });
                console.log(`chain_id`, chain_id);
              } else {
                console.log(`no provider`);
              }
              //  await (window as any).ethereum.request({
              //   method: 'wallet_switchEthereumChain',
              //   params: [{ chainId: '0x89' }],
              // });
            }}
          >
            {`Toggle Chain`}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

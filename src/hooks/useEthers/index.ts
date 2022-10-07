import { ethers } from 'ethers';
import { FormatTypes, Interface } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { AbiItem } from 'web3-utils';

const useEthers = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();
  const [ABI, setABI] = useState<AbiItem[]>();
  const [contract, setContract] = useState<ethers.Contract>();

  useEffect(() => {
    const initContract = async (
      signer_obj: ethers.providers.JsonRpcSigner
    ): Promise<void> => {
      const response = await fetch(`api/abi`, {
        method: 'GET',
      });
      const abi: AbiItem[] = await response.json();
      if (abi) {
        setABI(abi);
        const contract_interface = new Interface(JSON.stringify(abi));
        contract_interface.format(FormatTypes.full);
        const contract_obj = new ethers.Contract(
          process.env.CONTRACT_ADDRESS || '',
          contract_interface,
          signer_obj
        );
        setContract(contract_obj);
      }
    };

    if (window.ethereum) {
      const provider_obj = new ethers.providers.Web3Provider(
        window.ethereum as any
      );

      const signer_obj = provider_obj.getSigner();
      setProvider(provider_obj);
      setSigner(signer_obj);

      initContract(signer_obj);
    }
  }, [typeof window]);

  // useEffect(() => {
  //   const asyncGet = async (provider: ethers.providers.Web3Provider) => {
  //     const address = await provider.resolveName('tomvandorn.eth');
  //     console.log(`address`, address);
  //   };
  //   if (provider) {
  //     asyncGet(provider);
  //   }
  // }, [provider]);

  return {
    provider,
    signer,
    ABI,
    contract,
  };
};

export default useEthers;

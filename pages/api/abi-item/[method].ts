import { NextApiRequest, NextApiResponse } from 'next';
import { AbiItem } from 'web3-utils';

export interface PolygonScanResponse extends Response {
  result: string;
  message: string;
}

interface IInputs {
  internalType: string;
  name: string;
  type: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const GetABI = async (): Promise<PolygonScanResponse> => {
    const response = await fetch(
      `${process.env.API_URL}?module=contract&action=getabi&address=${process.env.ABI_ADDRESS}&apikey=${process.env.API_KEY}`,
      { method: 'GET' }
    );
    return response.json();
  };

  const abi: AbiItem[] = JSON.parse((await GetABI()).result);
  for (let i = 0; i < abi.length; i++) {
    if (abi[i].name === req.query.method) {
      res.json([abi[i]]);
      return;
    }
  }
  res.json([{ message: 'undefined' }]);
}

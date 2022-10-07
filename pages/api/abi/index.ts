import { NextApiRequest, NextApiResponse } from 'next';

export interface PolygonScanResponse extends Response {
  result: string;
  message: string;
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

  res.json(JSON.parse((await GetABI()).result));
}

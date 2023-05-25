// helper/utils.ts
import { ethers } from "ethers"; // npm install ethers

import * as config from "../config/config";
import * as ERC20Json from "../config/contracts/darkAutoPoolContract.json";

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const hexToInt = (s: string) => {
  const bn = ethers.BigNumber.from(s);
  return parseInt(bn.toString());
};

export const hexToIntForToken = (s: string) => {
  const bn = ethers.BigNumber.from(s);
  return parseInt(
    (
      bn.div(ethers.BigNumber.from("10000000000000000")).toNumber() / 100
    ).toString()
  );
};
export const reloadApp = () => {
  window.location.reload();
};

// Get the last block number
export const getLastBlockNumber = async (ethersProvider: any): Promise<any> => {
  return ethersProvider.getBlockNumber();
};

// Get the CRO balance of address
export const getCroBalance = async (
  serverWeb3Provider: ethers.providers.JsonRpcProvider,
  address: string
): Promise<number> => {
  const balance = await serverWeb3Provider.getBalance(address);
  // Balance is rounded at 2 decimals instead of 18, to simplify the UI
  return (
    ethers.BigNumber.from(balance)
      .div(ethers.BigNumber.from("10000000000000000"))
      .toNumber() / 100
  );
};

// Generate a ethers.Contract instance of the contract object
// together with a signer that will trigger a transaction
// approval in the wallet whenever it is called by the Dapp
export const getWriteContractInstance = async (
  browserWeb3Provider: any
): Promise<ethers.Contract> => {
  const ethersProvider = browserWeb3Provider;
  const contractAbi = ERC20Json.abi;
  // Create ethers.Contract object using the smart contract's ABI
  const readContractInstance = new ethers.Contract(
    config.configVars.erc20.address,
    contractAbi,
    ethersProvider
  );
  // Add a signer to make the ethers.Contract object able
  // to craft transactions
  const fromSigner = ethersProvider.getSigner();
  return readContractInstance.connect(fromSigner);
};

export const getReadContractInstance = async (
  browserWeb3Provider: any
): Promise<ethers.Contract> => {
  const ethersProvider = browserWeb3Provider;
  const contractAbi = ERC20Json.abi;
  // Create ethers.Contract object using the smart contract's ABI
  return new ethers.Contract(ERC20Json.address, contractAbi, ethersProvider);
};

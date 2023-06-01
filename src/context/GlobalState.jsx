import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";

import ABI_TOKEN from "../abis/token.json";
import ABI_LOCKED_CONTRACT from "../abis/locked_contract.json";

import { ADDRESS_TOKEN, ADDRESS_LOCKED_CONTRACT } from "../constants";

const Context = createContext();

export const useGlobalState = () => {
  const context = useContext(Context);

  return context;
};

// eslint-disable-next-line react/prop-types
export const GlobalProvider = ({ children }) => {
  const [account, setAccount] = useState(undefined);
  const [contractToken, setContractToken] = useState(undefined);
  const [contractLocked, setcontractLocked] = useState(undefined);
  const [balance, setBalance] = useState(0);
  const [tokensBloqueados, setTokensBloqueados] = useState(0);

  useEffect(() => {}, []);

  const handleConnect = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();

      const address = await signer.getAddress();

      setAccount(address);

      const contractToken = new ethers.Contract(
        ADDRESS_TOKEN,
        ABI_TOKEN,
        signer
      );

      setContractToken(contractToken);

      const balance = await contractToken.balanceOf(address);

      setBalance(ethers.utils.formatEther(balance) / 10);

      const contractLocked = new ethers.Contract(
        ADDRESS_LOCKED_CONTRACT,
        ABI_LOCKED_CONTRACT,
        signer
      );

      setcontractLocked(contractLocked);

      const tokensBloqueados = await contractLocked.locks(address);
      setTokensBloqueados(
        ethers.utils.formatEther(tokensBloqueados.amount) / 10
      );
    } else {
      toast.info("Por favor instale metamask");
    }
  };

  return (
    <Context.Provider
      value={{
        account,
        setBalance,
        balance,
        handleConnect,
        contractToken,
        contractLocked,
        setTokensBloqueados,
        tokensBloqueados,
      }}
    >
      {children}
    </Context.Provider>
  );
};

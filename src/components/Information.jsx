import { useGlobalState } from "../context/GlobalState";

const Information = () => {
  const { account, balance, handleConnect, tokensBloqueados } =
    useGlobalState();

  return (
    <div>
      {account !== undefined ? (
        <>
          <br />
          <h5 style={{ paddingBottom: "10px" }}>Mi Wallet: {account}</h5>
          <h5 className="bg-indigo-100 border-l-4 border-yellow-400 text-yellow-700 p-4 mb-4">
            Mi Balance: {balance} (CPGE)
          </h5>
          <h5 className="bg-indigo-100 border-l-4 border-yellow-400 text-yellow-700 p-4 mb-4">
            Tokens Bloqueados: {tokensBloqueados} (CPGE)
          </h5>
        </>
      ) : (
        <>
          <br />
          <a
            className="buy-button"
            style={{
              backgroundColor: "#f0f0f0",
              color: "#222",
              fontSize: "15px",
            }}
            onClick={handleConnect}
          >
            {"CONECTE SU BILLETERA A METAMASK"}
          </a>
        </>
      )}
    </div>
  );
};

export default Information;

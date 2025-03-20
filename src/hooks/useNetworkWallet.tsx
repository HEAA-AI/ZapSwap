import { useEffect, useState } from "react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useSolanaWallet } from "@/provider/WalletProvider";
import { TokenBalanceInfo } from "@/types/type";

function useNetworkWallet() {
  const { connection, connected, publicKey } = useSolanaWallet();
  const [tokenBalances, setTokenBalances] = useState<TokenBalanceInfo[]>([]);

  // Fetch both SOL and SPL token balances
  const fetchBalances = async () => {
    if (!publicKey) return;

    try {
      const newBalances: any[] = [];

      // Fetch SOL Balance
      const solBalanceLamports = await connection.getBalance(publicKey);
      const solBalance = solBalanceLamports / 1e9; // Convert lamports to SOL
      newBalances.push({
        mint: "So11111111111111111111111111111111111111112",
        balance: solBalance,
        symbol: "SOL",
        decimals: 9,
      });

      // Fetch SPL Token Balances
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      tokenAccounts.value.forEach((account) => {
        const info = account.account.data.parsed.info;
        newBalances.push({
          mint: info.mint,
          balance: info.tokenAmount.uiAmount,
          symbol: info.tokenAmount.uiAmount > 0 ? "SPL Token" : "Unknown",
          decimals: info.tokenAmount.decimals,
        });
      });

      setTokenBalances(newBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  useEffect(() => {
    if (connected) fetchBalances();
  }, [connected, publicKey]);

  return { tokenBalances };
}

export default useNetworkWallet;

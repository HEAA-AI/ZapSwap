import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SolanaProvider from "./provider/SolanaWalletProvider";
import SwapPage from "./screens/swap/index";

import "./App.css";
import WalletsConnectModal from "./components/global/modal/WalletsConnectModal";
import { TooltipProvider } from "./components/ui/tooltip";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store/store";
import SolanaWalletProvider from "./provider/WalletProvider";
import { SOLANA_RPC_URL } from "./utility/constant";

const queryClient = new QueryClient();
function App() {
  return (
    <SolanaProvider>
      <SolanaWalletProvider endpoint={SOLANA_RPC_URL}>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <Provider store={store}>
              <PersistGate persistor={persistor}>
                <SwapPage />
                <WalletsConnectModal />
                <ReactQueryDevtools initialIsOpen={false} />
              </PersistGate>
            </Provider>
          </QueryClientProvider>
        </TooltipProvider>
      </SolanaWalletProvider>
    </SolanaProvider>
  );
}

export default App;

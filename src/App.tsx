import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SolanaProvider from "./provider/SolanaWalletProvider";
import SwapPage from "./screens/swap/index";

import "./App.css";

const queryClient = new QueryClient();
function App() {
  return (
    <SolanaProvider>
      <QueryClientProvider client={queryClient}>
        <SwapPage />
        {/* <Swap /> */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SolanaProvider>
  );
}

export default App;

import { FC } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
export const WalletButton: FC = () => {
  return (
    
    <div className="navbar flex flex-row md:mb-2 shadow-lg bg-neutral text-neutral-content">    
    {/* Wallet & Settings */}
    <div className="navbar-end">
      <WalletMultiButton />
    </div>
  </div>
  );
};
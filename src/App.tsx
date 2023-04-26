import React, { useEffect, useState } from 'react';
import './App.css';
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import { Idl, Program } from '@project-serum/anchor';
import idl from './idl/zebec.json';
import { WalletContext } from './components/wallet/Context';
import { WalletButton } from './components/wallet/Button';
import Stream from './components/streams/Stream';

const getProviders = () => {
  // @ts-ignore
  if (window.solana.isPhantom) {
    // @ts-ignore
    return window.solana;
  }
}
function App() {
  return (
    <WalletContext>
      <div className="App">
        <WalletButton />
        <Stream/>
      </div>
    </WalletContext>
  );
}

export default App;

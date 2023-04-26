import React, { useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js';
import { AnchorProvider, Idl, Program } from '@project-serum/anchor';
import idl from '../../idl/zebec.json';
import { publicKey } from '@project-serum/anchor/dist/cjs/utils';

interface StreamProps{
    id: string;
    startTime: string;
    endTime: string;
    paused: string;
    withdrawLimit: string;
    amount: string;
    sender: string;
    receiver: string;
    withdrawn: string;
    pausedAt: string;
    feeOwner: string;
    pausedAmt: string;
    canCancel: boolean;
    canUpdate: boolean;
}

function Stream() {
    const walletObj = useWallet();
    const { wallet, publicKey } = walletObj;
    const {connection} = useConnection();
    const [outgoing, setOutgoing] = React.useState<StreamProps[]>([]);
    const [incoming, setIncoming] = React.useState<StreamProps[]>([]);

    const programId = new PublicKey("zbcKGdAmXfthXY3rEPBzexVByT2cqRqCZb9NwWdGQ2T")
    const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: 'recent' });
    const program = new Program(idl as Idl, programId, provider);
      
      const streams = async () => {
        if (publicKey) {
          console.log("publicKey", publicKey.toBase58());
          const streamsOutgoing = await program.account.stream.all(
            [
              {
                memcmp: {
                  offset: 48,
                  bytes: publicKey.toBase58(),
                }
              }
            ]
          );
          const streamsIncoming = await program.account.stream.all(
            [
              {
                memcmp: {
                  offset: 48+32,
                  bytes: publicKey.toBase58(),
                }
              }
            ]
          );
          const parsedStreamsOut = streamsOutgoing.map((stream) => {
            return {
              id: stream.publicKey.toBase58(),
              startTime: stream.account.startTime.toString(),
              endTime: stream.account.endTime.toString(),
              paused: stream.account.paused.toString(),
              withdrawLimit: stream.account.withdrawLimit.toString(),
              amount: stream.account.amount.toString(),
              sender: stream.account.sender.toBase58(),
              receiver: stream.account.receiver.toBase58(),
              withdrawn: stream.account.withdrawn.toString(),
              pausedAt: stream.account.pausedAt.toString(),
              feeOwner: stream.account.feeOwner.toBase58(),
              pausedAmt: stream.account.pausedAmt.toString(),
              canCancel: stream.account.canCancel,
              canUpdate: stream.account.canUpdate
            };
          });
          const parsedStreamsIn = streamsIncoming.map((stream) => {
            return {
              id: stream.publicKey.toBase58(),
              startTime: stream.account.startTime.toString(),
              endTime: stream.account.endTime.toString(),
              paused: stream.account.paused.toString(),
              withdrawLimit: stream.account.withdrawLimit.toString(),
              amount: stream.account.amount.toString(),
              sender: stream.account.sender.toBase58(),
              receiver: stream.account.receiver.toBase58(),
              withdrawn: stream.account.withdrawn.toString(),
              pausedAt: stream.account.pausedAt.toString(),
              feeOwner: stream.account.feeOwner.toBase58(),
              pausedAmt: stream.account.pausedAmt.toString(),
              canCancel: stream.account.canCancel,
              canUpdate: stream.account.canUpdate
            };
          });
          for (const stream of parsedStreamsOut) {
            setOutgoing((prev) => [...prev, stream]);
          }
          for (const stream of parsedStreamsIn) {
            setIncoming((prev) => [...prev, stream]);
          }
      }}

      

      useEffect(() => {
          streams()
      }, [publicKey]);

  return (
    <div> 
      <h1 className='font-bold text-3xl border-b-[3px] py-3'>Outgoing</h1>
      <div className ="rowC border-b-[3px] py-3" >
        {outgoing.map((stream) => (
          <div key={stream.id} style={{textAlign:"left", paddingLeft:"100px", paddingBottom:"70px"}}>
            <strong>id: {stream.id}</strong>
            <p>startTime: {stream.startTime}</p>
            <p>endTime: {stream.endTime}</p>
            <p>paused: {stream.paused}</p>
            <p>withdrawLimit: {stream.withdrawLimit}</p>
            <p>amount: {stream.amount}</p>
            <p>sender: {stream.sender}</p>
            <p>receiver: {stream.receiver}</p>
            <p>withdrawn: {stream.withdrawn}</p>
            <p>pausedAt: {stream.pausedAt}</p>
            <p>feeOwner: {stream.feeOwner}</p>
            <p>pausedAmt: {stream.pausedAmt}</p>
          </div>
        ))}
        </div>
        <h1  className='font-bold text-3xl border-b-[3px] py-3'>Incoming</h1>
        <div className ="rowC border-b-[3px] py-3">
          {incoming.map((stream) => (
            <div key={stream.id} style={{textAlign:"left", paddingLeft:"100px", paddingBottom:"70px"}}>
              <strong>id: {stream.id}</strong>
              <p>startTime: {stream.startTime}</p>
              <p>endTime: {stream.endTime}</p>
              <p>paused: {stream.paused}</p>
              <p>withdrawLimit: {stream.withdrawLimit}</p>
              <p>amount: {stream.amount}</p>
              <p>sender: {stream.sender}</p>
              <p>receiver: {stream.receiver}</p>
              <p>withdrawn: {stream.withdrawn}</p>
              <p>pausedAt: {stream.pausedAt}</p>
              <p>feeOwner: {stream.feeOwner}</p>
              <p>pausedAmt: {stream.pausedAmt}</p>
              <p>canCancel: {stream.canCancel}</p>
              <p>canUpdate: {stream.canUpdate}</p>
            </div>
          ))}
        </div>
    </div>
  );
};

export default Stream;


export const STREAM_TOKEN_SIZE =
  8 + 8 + 8 + 8 + 8 + 8 + 32 + 32 + 32 + 8 + 8 + 32 + 8 + 8 + 1 + 1;
// discriminator: 8 byter+start_time: u64+end_time: u64+paused: u64+withdraw_limit: u64+amount: u64,sender:Pubkey+receiver: Pubkey+token_mint: Pubkey+withdrawn: u64+paused_at: u64+fee_owner:Pubkey+fee_percentage+paused_amt:u64+can_cancel:bool+can_update:bool,
export const STREAM_SIZE =
  8 + 8 + 8 + 8 + 8 + 8 + 32 + 32 + 8 + 8 + 32 + 8 + 8 + 1 + 1;
// discriminator: 8 byter+start_time: u64+end_time: u64+paused: u64+withdraw_limit: u64+amount: u64,sender:Pubkey+receiver: Pubkey+withdrawn: u64+paused_at: u64+fee_owner:Pubkey+fee_percentage:u64+paused_amt:u64+can_cancel:bool+can_update:bool,can_update:cancel

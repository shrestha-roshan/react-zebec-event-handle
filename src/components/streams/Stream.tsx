import React, {
  useEffect,
  useState,
} from 'react';

import {
  AnchorProvider,
  BN,
  Idl,
  Program,
} from '@project-serum/anchor';
import {
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

import idl from '../../idl/zebec.json';

interface Stream {
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

interface RawStream {
	id: PublicKey;
	startTime: BN;
	endTime: BN;
	paused: BN;
	withdrawLimit: BN;
	amount: BN;
	sender: PublicKey;
	receiver: PublicKey;
	withdrawn: BN;
	pausedAt: BN;
	feeOwner: PublicKey;
	pausedAmt: BN;
	canCancel: boolean;
	canUpdate: boolean;
}

const parseStream = (stream: any, id: string) => {
	return {
		id: id,
		startTime: stream.startTime.toString(),
		endTime: stream.endTime.toString(),
		paused: stream.paused.toString(),
		withdrawLimit: stream.withdrawLimit.toString(),
		amount: stream.amount.toString(),
		sender: stream.sender.toBase58(),
		receiver: stream.receiver.toBase58(),
		withdrawn: stream.withdrawn.toString(),
		pausedAt: stream.pausedAt.toString(),
		feeOwner: stream.feeOwner.toBase58(),
		pausedAmt: stream.pausedAmt.toString(),
		canCancel: stream.canCancel,
		canUpdate: stream.canUpdate,
	};
};

function Stream() {
	const walletObj = useWallet();
	const { wallet, publicKey } = walletObj;
	const { connection } = useConnection();
	const [outgoing, setOutgoing] = React.useState<Stream[]>([]);
	const [incoming, setIncoming] = React.useState<Stream[]>([]);

	const programId = new PublicKey("zbcKGdAmXfthXY3rEPBzexVByT2cqRqCZb9NwWdGQ2T");
	const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: "recent" });
	const program = new Program(idl as Idl, programId, provider);
	const [outgoingSubs, setOutgoingSub] = useState<number[]>([]);
	const [incommingSub, setIncommingSub] = useState<number[]>([]);

	const streams = async () => {
		if (publicKey) {
			console.log("publicKey", publicKey.toBase58());
			const streamsOutgoing = await program.account.stream.all([
				{
					memcmp: {
						offset: 48,
						bytes: publicKey.toBase58(),
					},
				},
			]);
			const streamsIncoming = await program.account.stream.all([
				{
					memcmp: {
						offset: 48 + 32,
						bytes: publicKey.toBase58(),
					},
				},
			]);
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
					canUpdate: stream.account.canUpdate,
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
					canUpdate: stream.account.canUpdate,
				};
			});

			for (const stream of parsedStreamsOut) {
				setOutgoing((prev) => [...prev, stream]);
			}
			for (const stream of parsedStreamsIn) {
				setIncoming((prev) => [...prev, stream]);
			}
		}
	};

	useEffect(() => {
		if (publicKey) {
			streams();
		}
		// eslint-disable-next-line
	}, [publicKey]);

	useEffect(() => {
		if (outgoing.length) {
			outgoing.forEach((item, i) => {
				const id = connection.onAccountChange(
					new PublicKey(item.id),
					(info) => {
						const data = program.coder.accounts.decode("Stream", info.data);
						console.log(data);
						const newarr = [...outgoing];
						console.log("newarr: ", newarr);
						newarr[i] = parseStream(data, item.id);

						setOutgoing(newarr);
					},
					"finalized",
				);
				// const newSubscriptions = [...outgoingSubs];
				// newSubscriptions[i] = id;
				// setOutgoingSub(newSubscriptions);
			});
		}
		// return () => {
		// 	if (outgoingSubs.length) {
		// 		outgoingSubs.forEach((id) => {
		// 			connection.removeAccountChangeListener(id);
		// 		});
		// 	}
		// };
	}, [outgoing, setOutgoing, setOutgoingSub, connection, outgoingSubs, program]);

	useEffect(() => {
		if (incoming.length) {
			incoming.forEach((item, i) => {
				const id = connection.onAccountChange(
					new PublicKey(item.id),
					(info) => {
						const data = program.coder.accounts.decode("Stream", info.data);
						console.log(data);
						const newarr = [...incoming];

						// may break here
						newarr[i] = parseStream(data, item.id);
						setIncoming(newarr);
					},
					"finalized",
				);

				// const newSubscriptions = [...incommingSub];
				// newSubscriptions[i] = id;
				// setIncommingSub(newSubscriptions);
			});
		}

		// return () => {
		// 	if (incommingSub.length) {
		// 		incommingSub.forEach((id) => {
		// 			connection.removeAccountChangeListener(id);
		// 		});
		// 	}
		// };
	}, [incoming, setIncoming, setIncommingSub, connection, incommingSub, program]);

	return (
		<div className="bg-slate-50">
		  <h1 className="font-bold text-3xl border-b-[3px] py-3 bg-slate-300">Outgoing</h1>
		  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{outgoing.map((stream) => (
			<div className="hover:-translate-y-1 hover:scale-105 mt-2">
				<div
					key={stream.id}
					className="rounded-lg shadow-md p-6 overflow-hidden bg-slate-100"
				>
					<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-bold">{stream.id}</h2>
					</div>

					<p className="text-sm mb-2">
					<span className="font-bold">Sender:</span> {stream.sender}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Receiver:</span> {stream.receiver}
					</p>
					
					<p className="text-sm mb-2">
					<span className="font-bold">Amount:</span> {stream.amount}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Withdraw Limit:</span> {stream.withdrawLimit}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Start Time:</span> {stream.startTime}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">End Time:</span> {stream.endTime}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Withdrawn:</span> {stream.withdrawn}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Paused At:</span> {stream.pausedAt}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Fee Owner:</span> {stream.feeOwner}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Paused Amount:</span> {stream.pausedAmt}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Paused:</span> {stream.paused === '1' ? 'Yes' : 'No'}
					</p>
				</div>
			</div>
			))}
		  </div>
		  <br/>
		  <h1 className="font-bold text-3xl border-b-[3px] py-3 border-t-2 bg-slate-300">Incoming</h1>
		  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
			{incoming.map((stream) => (
			<div className="hover:-translate-y-1 hover:scale-105">
				<div
					key={stream.id}
					className="rounded-lg shadow-md p-6 overflow-hidden bg-slate-100"
				>
					<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-bold">{stream.id}</h2>
					</div>

					<p className="text-sm mb-2">
					<span className="font-bold">Sender:</span> {stream.sender}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Receiver:</span> {stream.receiver}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Amount:</span> {stream.amount}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Withdraw Limit:</span> {stream.withdrawLimit}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Start Time:</span> {stream.startTime}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">End Time:</span> {stream.endTime}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Withdrawn:</span> {stream.withdrawn}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Paused At:</span> {stream.pausedAt}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Fee Owner:</span> {stream.feeOwner}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Paused Amount:</span> {stream.pausedAmt}
					</p>

					<p className="text-sm mb-2">
					<span className="font-bold">Paused:</span> {stream.paused === '1' ? 'Yes' : 'No'}
					</p>
				</div>
			</div>
			))}
		  </div>
		</div>
	  );
}

export default Stream;

export const STREAM_TOKEN_SIZE = 8 + 8 + 8 + 8 + 8 + 8 + 32 + 32 + 32 + 8 + 8 + 32 + 8 + 8 + 1 + 1;
// discriminator: 8 byter+start_time: u64+end_time: u64+paused: u64+withdraw_limit: u64+amount: u64,sender:Pubkey+receiver: Pubkey+token_mint: Pubkey+withdrawn: u64+paused_at: u64+fee_owner:Pubkey+fee_percentage+paused_amt:u64+can_cancel:bool+can_update:bool,
export const STREAM_SIZE = 8 + 8 + 8 + 8 + 8 + 8 + 32 + 32 + 8 + 8 + 32 + 8 + 8 + 1 + 1;
// discriminator: 8 byter+start_time: u64+end_time: u64+paused: u64+withdraw_limit: u64+amount: u64,sender:Pubkey+receiver: Pubkey+withdrawn: u64+paused_at: u64+fee_owner:Pubkey+fee_percentage:u64+paused_amt:u64+can_cancel:bool+can_update:bool,can_update:cancel

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
						// may break
						newarr[i] = parseStream(data, item.id);

						setOutgoing(newarr);
					},
					"finalized",
				);
				const newSubscriptions = outgoingSubs;
				newSubscriptions[i] = id;
				setOutgoingSub(newSubscriptions);
			});
		}
		return () => {
			if (outgoingSubs.length) {
				outgoingSubs.forEach((id) => {
					connection.removeAccountChangeListener(id);
				});
			}
		};
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

				const newSubscriptions = incommingSub;
				newSubscriptions[i] = id;
				setIncommingSub(newSubscriptions);
			});
		}

		return () => {
			if (incommingSub.length) {
				incommingSub.forEach((id) => {
					connection.removeAccountChangeListener(id);
				});
			}
		};
	}, [incoming, setIncoming, setIncommingSub, connection, incommingSub, program]);

	return (
		<div>
			<h1 className="font-bold text-3xl border-b-[3px] py-3">Outgoing</h1>
			<div className="rowC border-b-[3px] py-3">
				{outgoing.map((stream) => (
					<div key={stream.id} style={{ textAlign: "left", paddingLeft: "100px", paddingBottom: "70px" }}>
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
			<h1 className="font-bold text-3xl border-b-[3px] py-3">Incoming</h1>
			<div className="rowC border-b-[3px] py-3">
				{incoming.map((stream) => (
					<div key={stream.id} style={{ textAlign: "left", paddingLeft: "100px", paddingBottom: "70px" }}>
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
}

export default Stream;

export const STREAM_TOKEN_SIZE = 8 + 8 + 8 + 8 + 8 + 8 + 32 + 32 + 32 + 8 + 8 + 32 + 8 + 8 + 1 + 1;
// discriminator: 8 byter+start_time: u64+end_time: u64+paused: u64+withdraw_limit: u64+amount: u64,sender:Pubkey+receiver: Pubkey+token_mint: Pubkey+withdrawn: u64+paused_at: u64+fee_owner:Pubkey+fee_percentage+paused_amt:u64+can_cancel:bool+can_update:bool,
export const STREAM_SIZE = 8 + 8 + 8 + 8 + 8 + 8 + 32 + 32 + 8 + 8 + 32 + 8 + 8 + 1 + 1;
// discriminator: 8 byter+start_time: u64+end_time: u64+paused: u64+withdraw_limit: u64+amount: u64,sender:Pubkey+receiver: Pubkey+withdrawn: u64+paused_at: u64+fee_owner:Pubkey+fee_percentage:u64+paused_amt:u64+can_cancel:bool+can_update:bool,can_update:cancel

import { TOKEN_PROGRAM_ID, createTransferInstruction, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import {
    Connection,
    PublicKey,
    SystemProgram,
    Transaction,
    Keypair
} from '@solana/web3.js';
import { heliusClusterUrls, USDC_MINT_AUTHORITY } from './utils';

// Your Turnkey Paymaster Public Key
const TURNKEY_PUBLIC_KEY = 'YOUR_TURNKEY_PUBLIC_KEY';
// Standup Solana Web3 JS RPC Connection
export const connection = new Connection(heliusClusterUrls((__DEV__ || true) ? 'devnet' : 'mainnet-beta'), { commitment: 'confirmed' });

async function executeUSDCTransfer(fromKeypair: Keypair, amount: string, toPublicKey: PublicKey) {
    // Get token account of the fromWallet Solana address. If it does not exist, create it
    let fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromKeypair,
        USDC_MINT_AUTHORITY,
        fromKeypair.publicKey
    )

    // Get token account of the toWallet Solana address. If it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromKeypair,
        USDC_MINT_AUTHORITY,
        toPublicKey
    )

    // Add token transfer instructions to transaction
    const transaction = new Transaction().add(
        createTransferInstruction(
            fromTokenAccount.address,
            toTokenAccount.address,
            fromKeypair.publicKey,
            1000000, // 1 USDC
            [],
            TOKEN_PROGRAM_ID
        )
    );
    // Assign a fee payer
    transaction.feePayer = new PublicKey(TURNKEY_PUBLIC_KEY)
    // Optionally, set a recent blockhash to the transaction
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(fromKeypair)
    // Serialize the transaction to send it to the backend
    const serializedTransaction = transaction.serialize({ requireAllSignatures: false }).toString('base64');
    const response = await fetch(`https://yourbackend.io/api/paymaster`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 123`
        },
        body: JSON.stringify({ transaction: serializedTransaction })
    })
    const paymasterResponse = await response.json()
    const { signedTransaction } = paymasterResponse;
    // Deserialize the signed transaction
    const finalTransaction = Transaction.from(Buffer.from(signedTransaction, 'base64'));
    return connection.sendEncodedTransaction(finalTransaction.serialize().toString('base64'))
        .then(res => console.log(`Send executed: ${JSON.stringify(res)}`))
}

function sendAirdrop() {
    const fromPubkey = new PublicKey(TURNKEY_PUBLIC_KEY)
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey,
            toPubkey: recipientPublicKey,
            lamports: minimumRentAmount
        })
    )
    // Set the fee payer (in this case, it's the sender)
    transaction.feePayer = fromPubkey;
    // Set a recent blockhash
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    // Serialize the transaction
    const serializedTransaction = transaction.serialize({ requireAllSignatures: false }).toString('base64');
    const response = await fetch(`https://yourbackend.io/api/accountRentMinimum`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer 123`
        },
        body: JSON.stringify({ transaction: serializedTransaction })
    })
    const paymasterResponse = await response.json()
    const { signedTransaction } = paymasterResponse;
    console.log("API Response", paymasterResponse)
    // Deserialize the signed transaction
    const finalTransaction = Transaction.from(Buffer.from(signedTransaction, 'base64'));
    console.log("[airdropSOLToWallet Attempting to send and confirm airdrop using turnkey")
    return connection.sendEncodedTransaction(finalTransaction.serialize().toString('base64'))
        .then(res => console.log(`Send executed: ${JSON.stringify(res)}`))
}
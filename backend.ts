import { Turnkey } from "@turnkey/sdk-server";
import { TurnkeySigner } from "@turnkey/solana";
import { Transaction } from "@solana/web3.js"

const DEFAULT_TK_ORG_ID = "5ed8b3cb-28dd-4a45-a0e6-804f6be981eb"
let turnkeyClient: Turnkey
let turnkeySigner: TurnkeySigner

async function initializeTurnkeyClient() {
    const TK_API_KEY = await getSecret("TURNKEY_DEV_API_KEY_PAYMASTER")
    const TK_API_SECRET = await getSecret("TURNKEY_DEV_API_SECRET_PAYMASTER")
    turnkeyClient = new Turnkey({
        apiBaseUrl: "https://api.turnkey.com",
        apiPrivateKey: TK_API_SECRET,
        apiPublicKey: TK_API_KEY,
        defaultOrganizationId: DEFAULT_TK_ORG_ID
    });
}
initializeTurnkeyClient()
    .then(() => {
        if (turnkeyClient) {
            turnkeySigner = new TurnkeySigner({
                organizationId: "5ed8b3cb-28dd-4a45-a0e6-804f6be981eb",
                client: turnkeyClient.apiClient(),
            });
        }
    })
    .catch((error) => {
        console.log("Something went wrong initializing TK client", error)
    })

app.post("/paymaster", authenticateRequest, async (req, res) => {
    // get serialization ID from frontend
    try {
        const { transaction: serializedTransaction } = req.body
        const transaction = Transaction.from(Buffer.from(serializedTransaction, "base64"));
        // sign txn 
        await turnkeySigner.addSignature(transaction, "HM3hJUq1YxLKRj5Fm1n7yxjdMewJfqPKS2EyMEQbxQvZ")
        // serialize and send back to FE?
        const rawTransaction = transaction.serialize()
        res.status(200).send({ signedTransaction: rawTransaction })
    } catch (error) {
        res.status(500).send({ error })
    }
})
import { PublicKey } from '@solana/web3.js';

export const heliusClusterUrls = (environment: 'devnet' | 'testnet' | 'mainnet-beta') => {
    switch (environment) {
        case 'devnet':
            return `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` // Todo: rotate this before going to prod
        case 'testnet':
            return '';
        case 'mainnet-beta':
            return 'https://rpc-proxy.lacrosse.workers.dev/' // Proxies production requests to cloudflare to hide API key
    }
}

export const USDC_MINT_AUTHORITY = (__DEV__ || true) ? DEVNET_USDC_MINT : MAINNET_USDC_MINT
export const DEVNET_USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
export const MAINNET_USDC_MINT = new PublicKey('2wmVCSfPxGPjrnMMn7rchp4uaeoTqN39mXFC2zhPdri9');
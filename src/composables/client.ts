import Web3 from 'web3';
import { useWaku } from './waku';
import { sha256 } from 'crypto-hash';

declare global {
    interface Window {
        ethereum: any;
        web3: any
    }
}

const waku = useWaku()
export const generateUniqueID = () => {
    const userAgentHash = sha256(navigator.userAgent + Math.floor(Math.random() * 90000));
  return userAgentHash;
};

// Validate Ethereum Address
export const validateEthereumAddress = (address:any) => {
    return /^(0x)?[0-9a-fA-F]{40}$/.test(address);
}

export function useWalletConnect() {
    // Improved connectWallet Function
    async function connectWallet() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                window.web3 = new Web3(window.ethereum);
    
                if (accounts.length > 0 && validateEthereumAddress(accounts[0])) {
                    const walletAddress = accounts[0];
                    waku.sender.value = walletAddress;
                    localStorage.setItem('senderWalletAddress', walletAddress);
                } else {
                    console.error('Invalid Ethereum address detected. Generating fallback ID.');
                    generateUniqueID().then((hashID) => {
                        const newHash = 'abcdef012345'[Math.floor(Math.random() * 12)] + "x" + hashID.slice(-20);
                        waku.sender.value = newHash;
                        localStorage.setItem('senderWalletAddress', newHash);
                    });
                }
    
                await waku.start();
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        } else {
            console.log('No Ethereum wallet detected.');
        }
    }
    
  
    async function disconnectWallet() {
        localStorage.removeItem('senderWalletAddress');
        localStorage.removeItem('polls');
        // stop waku's light node
        await waku.wakuNode.stop();
        waku.stop()
        waku.sender.value = ""
        waku.status.value = "connecting..."
        waku.polls.value = []
    }
    async function signMessage(msgid: string, stringifiedMessage:string) {
        const messageToSign = `Message ID: ${msgid}, Content: ${stringifiedMessage}`;
        let signature;
        try {
            signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [messageToSign, waku.sender.value],
            });
            return signature
        } catch (signError) {
            console.error('Error signing the message:', signError);
            return;
        }
    }

    return {
        connectWallet,
        disconnectWallet,
        signMessage
	};
}
    


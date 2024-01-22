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

export function useWalletConnect() {
    async function connectWallet() {
        if (window.ethereum) {
            try {
                // Request account access from the user
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                
                // Initialize web3 with the current provider
                window.web3 = new Web3(window.ethereum);
        
                // Use the first account from the accounts array as the current account
                const walletAddress = accounts.length > 0 ? accounts[0] : null;
                if (walletAddress) {
                    waku.sender.value = walletAddress;
                    // Update waku sender and local storage
                    localStorage.setItem('senderWalletAddress', walletAddress);
                } else {
                    generateUniqueID().then((hashID) => {
                        const newHash = 'abcdef012345'[Math.floor(Math.random() * 15)] + "x" + hashID.slice(-20)
                        waku.sender.value = newHash
                        localStorage.setItem('senderWalletAddress', newHash);
                    });
                }
        
                // Start Waku
                await waku.start();
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        } else {
            console.log('No wallet');
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
    


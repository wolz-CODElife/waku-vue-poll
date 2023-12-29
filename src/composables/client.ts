import Web3 from 'web3';
import { useWaku } from './waku';


const waku = useWaku()
export function useWalletConnect() {
    async function connectWallet() {
        if (window.ethereum) {
        try {
            // Request account access from the user
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            
            // Initialize web3 with the current provider
            window.web3 = new Web3(window.ethereum);
    
            // Get the current MetaMask selected/active wallet
            const walletAddress = accounts[0];
            console.log(walletAddress);
    
            // Update waku sender and local storage
            waku.sender.value = walletAddress;
            localStorage.setItem('senderWalletAddress', walletAddress);
    
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
        // stop waku's light node
        await waku.wakuNode.stop();
        waku.stop()
        waku.sender.value = ""
        waku.status.value = "connecting..."
    }
    

    return {
        connectWallet,
        disconnectWallet
	};
}
    


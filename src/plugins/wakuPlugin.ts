import { Plugin } from 'vue';
import { createLightNode, waitForRemotePeer, Protocols, LightNode } from "@waku/sdk";

// Define a symbol to store the Waku Light Node instance
export const WAKU_NODE = Symbol('wakunode');

const wakuPlugin: Plugin = {
    async install(app) {
        try {
            // Create and start the Waku Light Node
            createLightNode({ defaultBootstrap: true }).then(node => {
                // Attach a status variable to the $waku instance
                console.log("LightNode created....");
                
                (node as LightNode & { status: string }).status = "connecting...";
            
                // Update status to "connecting" when starting
                node.start()
                waitForRemotePeer(node, [Protocols.LightPush, Protocols.Filter]).then(() => {
                    console.log("node started....");
                    
                    (node as LightNode & { status: string }).status = "connected";
                    // Wait for a successful peer connection with specific protocols
                }).catch((error) => {
                        // Handle the error and update status accordingly
                        console.error("Error starting Waku Light Node:", error);
                        console.log("disconnected");
                        (node as LightNode & { status: string }).status = "not connected";
                });
            
                // Make the Waku Light Node available globally
                app.provide('wakunode', node);
            });
        } catch (error) {
            console.error('Error installing Waku plugin:', error);
        }
    }
};

export default wakuPlugin;

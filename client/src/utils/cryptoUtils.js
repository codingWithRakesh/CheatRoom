class CryptoUtils {
    static base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    static arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    static async generateRSAKeyPair() {
        try {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256",
                },
                true,
                ["encrypt", "decrypt"]
            );

            const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
            const publicKeyBase64 = this.arrayBufferToBase64(publicKey);

            const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
            const privateKeyBase64 = this.arrayBufferToBase64(privateKey);

            return {
                publicKey: publicKeyBase64,
                privateKey: privateKeyBase64
            };
        } catch (error) {
            console.error("Error generating RSA keys:", error);
            throw error;
        }
    }

    static async importPublicKey(publicKeyBase64) {
        try {
            const publicKeyBuffer = this.base64ToArrayBuffer(publicKeyBase64);
            return await window.crypto.subtle.importKey(
                "spki",
                publicKeyBuffer,
                { name: "RSA-OAEP", hash: "SHA-256" },
                true,
                ["encrypt"]
            );
        } catch (error) {
            console.error("Error importing public key:", error);
            throw error;
        }
    }

    static async importPrivateKey(privateKeyBase64) {
        try {
            const privateKeyBuffer = this.base64ToArrayBuffer(privateKeyBase64);
            return await window.crypto.subtle.importKey(
                "pkcs8",
                privateKeyBuffer,
                { name: "RSA-OAEP", hash: "SHA-256" },
                true,
                ["decrypt"]
            );
        } catch (error) {
            console.error("Error importing private key:", error);
            throw error;
        }
    }

    static async encryptText(text, publicKeyBase64) {
        try {
            const publicKey = await this.importPublicKey(publicKeyBase64);
            const encoder = new TextEncoder();
            const data = encoder.encode(text);

            const encrypted = await window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                publicKey,
                data
            );

            return this.arrayBufferToBase64(encrypted);
        } catch (error) {
            console.error("Error encrypting text:", error);
            throw error;
        }
    }

    static async decryptText(encryptedTextBase64, privateKeyBase64) {
        try {
            const privateKey = await this.importPrivateKey(privateKeyBase64);
            const encryptedData = this.base64ToArrayBuffer(encryptedTextBase64);

            const decrypted = await window.crypto.subtle.decrypt(
                { name: "RSA-OAEP" },
                privateKey,
                encryptedData
            );

            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error("Error decrypting text:", error);
            throw error;
        }
    }

    static isEncrypted(content) {
        if (!content || typeof content !== 'string') return false;
        
        const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(content);
        const isLongEnough = content.length > 100;
        
        return isBase64 && isLongEnough;
    }
}

export default CryptoUtils;
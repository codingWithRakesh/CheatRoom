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
            if (!publicKeyBase64) throw new Error("Missing publicKeyBase64");
            const publicKey = await this.importPublicKey(publicKeyBase64);

            const aesKey = await window.crypto.subtle.generateKey(
                { name: "AES-GCM", length: 256 },
                true,
                ["encrypt", "decrypt"]
            );

            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encoder = new TextEncoder();
            const data = encoder.encode(text);

            const cipherBuffer = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv },
                aesKey,
                data
            );

            const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
            const encryptedAesKeyBuffer = await window.crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                publicKey,
                rawAesKey
            );

            const payload = {
                iv: this.arrayBufferToBase64(iv),
                ciphertext: this.arrayBufferToBase64(cipherBuffer),
                encryptedKey: this.arrayBufferToBase64(encryptedAesKeyBuffer)
            };

            return JSON.stringify(payload);
        } catch (error) {
            console.error("Error encrypting text:", error);
            throw error;
        }
    }

    static async decryptText(encryptedTextBase64, privateKeyBase64) {
        try {
            if (!privateKeyBase64) throw new Error("Missing privateKeyBase64");
            let payload;
            try {
                payload = typeof encryptedTextBase64 === "string"
                    ? JSON.parse(encryptedTextBase64)
                    : encryptedTextBase64;
            } catch (e) {
                throw new Error("Malformed encrypted payload (expected JSON string).");
            }

            const { iv: ivB64, ciphertext: ctB64, encryptedKey: encKeyB64 } = payload;
            if (!ivB64 || !ctB64 || !encKeyB64) {
                throw new Error("Encrypted payload missing fields");
            }

            const privateKey = await this.importPrivateKey(privateKeyBase64);

            const encKeyBuf = this.base64ToArrayBuffer(encKeyB64);
            const rawAesKeyBuffer = await window.crypto.subtle.decrypt(
                { name: "RSA-OAEP" },
                privateKey,
                encKeyBuf
            );

            const aesKey = await window.crypto.subtle.importKey(
                "raw",
                rawAesKeyBuffer,
                { name: "AES-GCM" },
                false,
                ["decrypt"]
            );

            const iv = new Uint8Array(this.base64ToArrayBuffer(ivB64));
            const ctBuffer = this.base64ToArrayBuffer(ctB64);

            const decryptedBuffer = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                aesKey,
                ctBuffer
            );

            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            console.error("Error decrypting text:", error);
            throw error;
        }
    }

    static isEncrypted(content) {
        if (!content || typeof content !== 'string') return false;
        try {
            const parsed = JSON.parse(content);
            return !!(parsed.iv && parsed.ciphertext && parsed.encryptedKey);
        } catch (e) {
            return false;
        }
    }
}

export default CryptoUtils;

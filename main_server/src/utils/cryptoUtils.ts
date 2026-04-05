import crypto from "crypto";

const CODE_SECRET: string = process.env.CODE_SECRET || "API_SECRET";

class CryptoUtils {
  static hashRoomCode(code: string | number): string {
    return crypto
      .createHmac("sha256", CODE_SECRET)
      .update(String(code))
      .digest("hex");
  }

  static genrateKey(): Buffer {
    return crypto
      .createHash("sha256")
      .update(CODE_SECRET)
      .digest();
  }

  static encrypt(algorithm: string, key: Buffer, data: string): { data: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    return {
      data: encrypted,
      iv: iv.toString("hex"),
    };
  }

  static decrypt(algorithm: string, key: Buffer, encryptedData: string, iv: string): string {
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(iv, "hex")
    );

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}

export { CryptoUtils };
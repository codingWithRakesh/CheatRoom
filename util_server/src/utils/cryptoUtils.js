import crypto from "crypto";

const CODE_SECRET = process.env.CODE_SECRET || "API_SECRET";

class CryptoUtils {
  static hashRoomCode(code) {
    return crypto
      .createHmac("sha256", CODE_SECRET)
      .update(String(code))
      .digest("hex");
  }
}

export { CryptoUtils };
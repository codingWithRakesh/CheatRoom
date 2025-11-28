import crypto from "crypto";

const CODE_SECRET = process.env.CODE_SECRET || "SUPER_SECRET_PEPPER";

function hashRoomCode(code) {
  return crypto
    .createHmac("sha256", CODE_SECRET)
    .update(String(code))              
    .digest("hex");                    
}

export { hashRoomCode };
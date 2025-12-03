import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";

const SALT_ROUNDS = 10;
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_PASSWORD_ENCRYPTION_KEY || "laundry-system-secret-key-2024";

// Bcrypt hashing (one-way, for security verification)
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// AES encryption (two-way, for admin viewing)
export const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
};

export const decryptPassword = (encryptedPassword: string): string => {
  try {
    // Check if it's an encrypted string (AES encrypted strings start with "U2F")
    if (!encryptedPassword || !encryptedPassword.startsWith("U2F")) {
      // Return as-is if it's not encrypted (legacy plain text password)
      return encryptedPassword || "";
    }
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption fails or returns empty, return original (might be plain text)
    return decrypted || encryptedPassword;
  } catch {
    // If decryption fails, return the original value (might be plain text)
    return encryptedPassword || "";
  }
};

import CryptoJS from "crypto-js";
import config from "@/config/config";

export default function encryptText(text) {
    var secretKey = config.SECRET_KEY;
    secretKey = atob(secretKey);
    secretKey = CryptoJS.enc.Utf8.parse(secretKey);

    const encrypted = CryptoJS.AES.encrypt(text, secretKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString(); // Convert encrypted result to string
}

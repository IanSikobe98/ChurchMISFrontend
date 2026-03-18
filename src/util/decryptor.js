import config from "@/config/config";
import CryptoJS from "crypto-js";

export default function (encryptedText){
    var secretKey = config.SECRET_KEY;
    secretKey = atob(secretKey);
    secretKey = CryptoJS.enc.Utf8.parse(secretKey);

    const decrypted = CryptoJS.AES.decrypt(encryptedText, secretKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8); // Convert decrypted data to a UTF-8 string

}
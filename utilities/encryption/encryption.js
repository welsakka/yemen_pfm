//Encryption functions
// soruced from : https://github.com/tectiv3/react-native-aes

import Aes from 'react-native-aes-crypto'

export const generateKey = (password, salt, cost, length) => Aes.pbkdf2(password, salt, cost, length)

export const encryptData = (text, key) => {
    return Aes.randomKey(16).then(iv => {
        return Aes.encrypt(text, key, iv, 'aes-256-cbc').then(cipher => ({
            cipher,
            iv,
        }))
    })
}
import bcrypt from 'bcrypt';
import crypto from 'crypto-js';

// Gera o hash de um texto
export const hash = async (text: string) => {
  const salt = await bcrypt.genSalt(10);

  return await bcrypt.hash(text, salt);
};

// Encriptografa um texto baseado em uma chave
export const encrypt = async (text: string, secret: string) => {
  return await crypto.AES.encrypt(text, secret).toString();
};

// Descriptografa um texto baseado em uma chave
export const decrypt = async (encrypted: string, secret: string) => {
  return await crypto.AES.decrypt(encrypted, secret).toString(crypto.enc.Utf8);
};

// Compara um texto hasheado com um outro texto
export const compare = async (text: string, textToCompare: string) => {
  return await bcrypt.compare(text, textToCompare);
};

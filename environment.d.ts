declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLIENTS_DB_URL: string;
      PORT: string;
      NODE_ENV: 'dev' | 'prod';
    }
  }
}

export {};

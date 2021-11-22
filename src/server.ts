import express from 'express';
import dotenv from 'dotenv';
import clientRouter from './routes/client';
import db from './services/clients_db';
import passport from 'passport';
import authRouter from './routes/auth';
import jwtStrategy from './middlewares/jwt';

// Biblioteca para a utilização das variáveis de ambiente
dotenv.config({
  path: `./.env.${process.env.NODE_ENV?.toLocaleLowerCase() || 'dev'}`,
});

const app = express();
const clients_db = process.env.CLIENTS_DB_URL;
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Utilização do middleware de autenticação via JWT
jwtStrategy(passport);

// Endpoints de autenticação
app.use('/api/auth', authRouter);

// Endpoints de clientes
app.use('/api/clients', clientRouter);

if (clients_db && port) {
  const host = process.env.NODE_ENV == 'dev' ? 'localhost' : '0.0.0.0';

  db.connect(clients_db).then(() => {
    app.listen(Number(port), host, () => {
      console.log(`\x1b[32mServer started at: http://${host}:${port}\x1b[0m`);
    });
  });
}

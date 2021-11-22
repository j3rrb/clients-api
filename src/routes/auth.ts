import express, { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '../constants';
import { ClientModel } from '../models/client';
import { compare } from '../services/hasher';
import { ClientSchema } from '../types';

const authRouter = express.Router();

// Autentica um cliente via nome de usuário e senha
authRouter.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const client = await ClientModel.findOne({
    username,
  });

  if (client) {
    if (await compare(password, client.password)) {
      const payload = { id: client._id, name: client.name };
      const token = sign(payload, JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '30m',
        issuer: String(client._id),
      });

      res.json({ access_token: token });
    } else
      res.status(401).json({
        error: 'Incorrect password!',
      });
  } else {
    res.status(404).json({
      error: 'Client not found!',
    });
  }
});

export default authRouter;

import express, { Request, Response } from 'express';
import { ClientModel } from '../models/client';
import ContactsDB from '../services/contacts_db';
import {
  Client,
  ClientSchema,
  Contact,
  ContactSchema,
  CreateContact,
} from '../types';
import { decode } from 'jsonwebtoken';
import { decrypt } from '../services/hasher';
import { SECRET } from '../constants';
import getHeaderToken from '../utils/getHeaderToken';
import passport from 'passport';

const clientRouter = express.Router();

// Cria um cliente
clientRouter.post(
  '/',
  async (
    req: Request<{}, {}, Client>,
    res: Response<{ message: string } | { error: string }>,
  ) => {
    try {
      const client: ClientSchema = await ClientModel.findOne({
        username: req.body.username,
      });

      if (client) {
        res.status(409).json({ error: 'Client already exists!' });
      } else {
        await ClientModel.create(req.body);

        res.status(201).json({ message: 'Client successfully created!' });
      }
    } catch (e) {
      res.status(500).json({
        error: `It was not possible to create the client due to an error: ${e}`,
      });
    }
  },
);

// Busca todos os clientes ativos
clientRouter.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (_: Request, res: Response<ClientSchema[] | { error: string }>) => {
    try {
      const data: ClientSchema[] = await ClientModel.find()
        .select('-password')
        .clone();

      res.json(data);
    } catch (e) {
      res.status(500).json({
        error: `It was not possible to find all clients due to an error: ${e}`,
      });
    }
  },
);

// Busca um cliente através do ID
clientRouter.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response<ClientSchema | { error: string }>) => {
    try {
      const { id } = req.params;
      const client: ClientSchema = await ClientModel.findById(
        {
          _id: id,
        },
        () => {},
      )
        .select('-password')
        .clone();

      if (client) {
        res.json(client);
      } else {
        res.status(404).json({ error: 'Client not found!' });
      }
    } catch (e) {
      res.status(500).json({
        error: `It was not possible to find the specified client due to an error: ${e}`,
      });
    }
  },
);

// Atualiza os dados de um cliente através do ID
clientRouter.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const client: ClientSchema = await ClientModel.findById({
        _id: id,
      }).clone();

      if (client) {
        await ClientModel.updateOne(
          {
            _id: client._id,
          },
          req.body,
          () => {},
        ).clone();

        res.json({ message: 'Client successfully updated!' });
      } else {
        res.status(404).json({ error: 'Client not found!' });
      }
    } catch (e) {
      res.status(500).json({
        error: `It was not possible to update the specified client due to an error: ${e}`,
      });
    }
  },
);

// Exclui um cliente através do ID
clientRouter.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const token = getHeaderToken(req.headers.authorization);

      let issuer;
      if (token) {
        issuer = decode(token, {
          json: true,
        })?.iss;
      }

      if (id == issuer)
        return res.status(403).json({ error: 'You cannot delete yourself!' });

      const client: ClientSchema = await ClientModel.findOne({
        _id: id,
      }).clone();

      if (client) {
        await ClientModel.deleteOne(
          {
            _id: client._id,
          },
          () => {},
        ).clone();

        res.json({ message: 'Client successfully deleted!' });
      } else {
        res.status(404).json({ error: 'Client not found!' });
      }
    } catch (e) {
      res.status(500).json({
        error: `It was not possible to delete the specified client due to an error: ${e}`,
      });
    }
  },
);

// Busca todos os contatos de um cliente
clientRouter.get(
  '/:clientId/contacts',
  passport.authenticate('jwt', { session: false }),
  async (
    req: Request<
      { clientId: number },
      {},
      {},
      { id?: number; name?: string; phone?: string }
    >,
    res: Response<ContactSchema[] | { error: string }>,
  ) => {
    try {
      const { clientId } = req.params;
      const { id, name, phone } = req.query;
      const client: ClientSchema = await ClientModel.findOne({
        _id: String(clientId),
      }).clone();

      if (client) {
        const { db_client, db_url } = client;
        const decryptedUrl = await decrypt(db_url, SECRET);
        const contactsDb = ContactsDB(db_client, decryptedUrl);

        if (id) {
          return res.json(await contactsDb.select('*').where({ id }));
        } else if (name) {
          return res.json(await contactsDb.select('*').where({ nome: name }));
        } else if (phone) {
          return res.json(
            await contactsDb.select('*').where({ celular: phone }),
          );
        } else {
          const contacts: ContactSchema[] = await ContactsDB(
            db_client,
            decryptedUrl,
          ).select('*');

          res.json(contacts);
        }
      } else {
        res.status(404).json({ error: 'Client not found!' });
      }
    } catch (e) {
      res.status(500).json({
        error: `It was not possible to find the contacts due to an error: ${e}`,
      });
    }
  },
);

// Cria um contato a partir do ID de um cliente
clientRouter.post(
  '/:clientId/contacts',
  passport.authenticate('jwt', { session: false }),
  async (
    req: Request<{ clientId: number }, {}, { contacts: CreateContact[] }>,
    res: Response<{ message: string } | { error: string }>,
  ) => {
    try {
      const { clientId } = req.params;
      const contacts = req.body.contacts;
      const client: ClientSchema = await ClientModel.findOne({
        _id: String(clientId),
      }).clone();

      if (client) {
        const {
          db_client,
          db_url,
          phone_max_chars,
          name_max_chars,
          name_regex,
          phone_regex,
        } = client;
        const decryptedUrl = await decrypt(db_url, SECRET);
        const bulkInsert: Contact[] = [];

        contacts.forEach((contact, idx) => {
          if (contact.cellphone.length > phone_max_chars) {
            throw new Error(
              `Error at element ${idx}: The phone number length is greater than the expected!`,
            );
          }

          if (contact.name.length > name_max_chars) {
            throw new Error(
              `Error at element ${idx}: The name length is greated than the expected!`,
            );
          }

          if (name_regex) {
            const nameReg = new RegExp(name_regex, 'g');

            if (!nameReg.test(contact.name)) {
              throw new Error(
                `Error at element ${idx}: The name format is incompatible with the expected!`,
              );
            }
          }

          if (phone_regex) {
            const phoneReg = new RegExp(phone_regex, 'g');

            if (!phoneReg.test(contact.cellphone)) {
              throw new Error(
                `Error at element ${idx}: The phone format is incompatible with the expected!`,
              );
            }
          }

          bulkInsert.push({ nome: contact.name, celular: contact.cellphone });
        });

        await ContactsDB(db_client, decryptedUrl).insert(bulkInsert);

        res.status(201).json({ message: 'Contact successfully created!' });
      } else {
        res.status(404).json({ error: 'Client not found!' });
      }
    } catch (e) {
      res.status(500).json({
        error: `It was not possible to create the contact due to an error: ${e}`,
      });
    }
  },
);

// Atualiza os dados de um contato a partir do ID de um cliente
clientRouter.put(
  '/:clientId/contacts',
  passport.authenticate('jwt', { session: false }),
  async (
    req: Request<
      { clientId: number },
      {},
      { contacts: Contact },
      { id?: number; name?: string; phone?: string }
    >,
    res: Response<{ message: string } | { error: string }>,
  ) => {
    const { clientId } = req.params;
    const { id, name, phone } = req.query;

    try {
      const client: ClientSchema = await ClientModel.findOne({
        _id: String(clientId),
      }).clone();

      if (client) {
        const { db_client, db_url } = client;
        const decryptedUrl = await decrypt(db_url, SECRET);
        const contactsDb = ContactsDB(db_client, decryptedUrl);

        if (name) {
          await contactsDb
            .where({
              nome: name,
            })
            .update(req.body);

          return res.json({ message: 'Contact successfully updated!' });
        } else if (phone) {
          await contactsDb
            .where({
              celular: phone,
            })
            .update(req.body);

          return res.json({ message: 'Contact successfully updated!' });
        } else if (id) {
          await contactsDb
            .where({
              id,
            })
            .update(req.body);

          return res.json({ message: 'Contact successfully updated!' });
        }
      } else {
        res.status(404).json({ error: 'Client not found!' });
      }
    } catch (e) {
      res.status(500).json({
        error: `It was not possible to update the contact due to an error: ${e}`,
      });
    }
  },
);

// Exclui um contato a partir do ID de um cliente
clientRouter.delete(
  '/:clientId/contacts',
  passport.authenticate('jwt', { session: false }),
  async (
    req: Request<
      { clientId: number },
      {},
      { contacts: Contact },
      { id?: number; name?: string; phone?: string }
    >,
    res: Response<{ message: string } | { error: string }>,
  ) => {
    const { clientId } = req.params;
    const { id, name, phone } = req.query;

    try {
      const client: ClientSchema = await ClientModel.findOne({
        _id: String(clientId),
      }).clone();

      if (client) {
        const { db_client, db_url } = client;
        const decryptedUrl = await decrypt(db_url, SECRET);
        const contactsDb = ContactsDB(db_client, decryptedUrl);

        if (name) {
          await contactsDb
            .where({
              nome: name,
            })
            .delete();

          return res.json({ message: 'Contact successfully deleted!' });
        } else if (phone) {
          await contactsDb
            .where({
              celular: phone,
            })
            .delete();

          return res.json({ message: 'Contact successfully deleted!' });
        } else if (id) {
          await contactsDb
            .where({
              id,
            })
            .delete();

          return res.json({ message: 'Contact successfully deleted!' });
        }
      } else {
        res.status(404).json({ error: 'Client not found!' });
      }
    } catch (e) {
      res.status(500).json({
        error: `It was not possible to delete the contact due to an error: ${e}`,
      });
    }
  },
);

export default clientRouter;

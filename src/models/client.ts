import { Schema, model } from 'mongoose';
import { SECRET } from '../constants';
import { encrypt, hash } from '../services/hasher';

export const clientSchema = new Schema(
  {
    username: {
      type: 'string',
      unique: true,
      required: [true, 'The username is required!'],
    },
    password: {
      type: 'string',
      required: [true, 'The password is required!'],
    },
    name: {
      type: 'string',
      required: [true, 'Name is required!'],
    },
    db_url: {
      type: 'string',
      required: [true, 'The database url is required!'],
    },
    db_client: {
      type: 'string',
      required: [true, 'The database client is required!'],
    },
    phone_regex: {
      type: 'string',
      required: false,
    },
    name_regex: {
      type: 'string',
      required: false,
    },
    name_max_chars: {
      type: 'number',
      required: [true, 'The max length of contact name is required!'],
    },
    phone_max_chars: {
      type: 'number',
      required: [true, 'The max length of contact phone is required!'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
    collection: 'clients',
  },
);

// Hook que criptografa os campos com informações sensíveis antes de serem salvos
clientSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.isModified('db_url')) {
    return next();
  }

  this.password = await hash(this.password);
  this.db_url = await encrypt(this.db_url, SECRET);

  next();
});

// Hook que criptografa os campos com informações sensíveis antes de serem atualizados
clientSchema.pre('updateOne', async function (next) {
  if (this.getUpdate().password) {
    this.getUpdate().password = await hash(this.getUpdate().password);
  }

  if (this.getUpdate().db_url) {
    this.getUpdate().db_url = await encrypt(this.getUpdate().db_url, SECRET);
  }

  next();
});

export const ClientModel = model('Client', clientSchema);

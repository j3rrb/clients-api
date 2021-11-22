import { connect, connection } from 'mongoose';

connection.on(
  'open',
  console.log.bind(console, 'Clients database connected successfully!'),
);

connection.on(
  'error',
  console.error.bind(console, 'Clients database connection error!'),
);

export default {
  connect: (url: string) =>
    connect(url, {
      autoIndex: true,
    }),
};

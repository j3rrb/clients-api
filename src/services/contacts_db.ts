import knex from 'knex';

// Instancia o banco de dados de contatos via Knex
export default function ContactsDB(client: string, connectionString: any) {
  return knex({
    client,
    connection: connectionString,
  })('contacts');
}

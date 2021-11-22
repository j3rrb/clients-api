/*
  Interface que representa os tipos dos dados vindos 
  da requisição de criação de um cliente
*/
export interface Client {
  username: string;
  password: string;
  name: string;
  db_client: string;
  db_url: string;
  phone_regex?: string;
  name_regex?: string;
  name_max_chars: number;
  phone_max_chars: number;
}

/*
  Interface que herda os atributos da interface
  de cliente, e que representa os dados de um 
  cliente vindo do banco de dados
*/
export interface ClientSchema extends Client {
  _id: string;
}

/*
  Interface que representa o tipos dos dados 
  necessesários para o login de um cliente
*/
export interface Login {
  username: string;
  password: string;
}

/*
  Interface que representa os tipos 
  dos dados para a criação de um contato
*/
export interface CreateContact {
  name: string;
  cellphone: string;
}

/*
  Interface que representa os tipos dos 
  dados de um contato
*/
export interface Contact {
  nome: string;
  celular: string;
}

/*
  Interface que herda os atributos de contato, 
  que representa os tipos de dados de um contato 
  vindo do banco de dados
*/
export interface ContactSchema extends Contact {
  id: number;
}

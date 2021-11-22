### Qual é o problema?

Uma API REST que receba 1 ou mais contatos de celulares através de diferentes clientes que utilizam diferentes bancos de dados, tanto na questão de servidor quanto na questão de tipo de banco (SGBD). O cliente deverá realizar uma requisição para a API, enviando o nome e o celular do contato, porém, o cliente deverá estar autenticado. Cada cliente tem sua própria maneira de armazenar os dados, como por exemplo, o nome do contato para um cliente deve ser somente em letras maiúsculas e para o outro não importa, assim como, o número de telefone, para um deve ser armazenado com uma máscara de número de telefone (+99 (99) 99999-9999), e para o outro deve ser sem a máscara, e também, o banco de dados de ambos possui uma limitação do tamanho do dado que será inserido. A autenticação do cliente (usuário) deverá ser feita utilizando tokens JWT via Authorization (Bearer) Header. Cada cliente possui uma chave única. A solução deverá ser desenvolvida utilizando Go ou Node. Se houver alguma suposição de um cenário não pensado, poderá e deve ser aplicado.

### Como foi pensado?

Em um contexto, por exemplo, de uma empresa com 10 clientes, e todos possuem variações em suas bases de dados (assim como no problema proposto), deve-se ter uma maneira de armazenar essas diferenças, e nesse caso será utilizando um banco somente para clientes (mongoDB), que irá, principalmente, armazenar os dados para a autenticação de um cliente, assim como as suas "configurações". 

Então em um esquema REST de endpoints ficará da seguinte maneira: 
- /api/clients/ (POST, GET)
    - Criação de um clinte e busca todos os clientes cadastrados
- /api/clients/:clientId (GET, PUT, DELETE)
    - Busca, edição de informações e exclusão de um cliente através do ID do mesmo
- /api/clients/:clientId/contacts/ (POST, GET)
    - Criação de um contato e busca todos os contatos a partir do ID de um cliente
- /api/clients/:clientId/contacts/?[id= | name= | phone=] (GET, PUT, DELETE)
    - Busca, atualiza ou exclui um contato através de seu ID, nome ou telefone, e também, do ID de um cliente

Para realizar o cadastro de um cliente, deverá ser fornecido:
- Nome de usuário*
- Senha (será hasheada posteriormente)*
- Tipo do banco de dados* (um dos tipos listados aqui que deverão estar instalados para o uso → [https://knexjs.org/#Installation-client](https://knexjs.org/#Installation-client))
- URL de conexão do banco de dados* (ex.: postgresql://root:root@root:5432/nome_do_banco) (será criptografado posteriormente)
- Expressão regular de telefone (para realizar a formatação posteriormente)
- Expressão regular de nome (para realizar a formatação posteriormente)
- Máximo de caractéres para nome* (para utilizar na validação posteriormente)
- Máximo de caractéres para telefone* (para utilizar na validação posteriormente)

Para realizar o login de um cliente, deverá ser fornecido:
- Nome de usuário
- Senha

Além disso, foi criado um ambiente de testes para a simulação utilizando docker e docker compose para a criação de vários serviços que utilizam da mesma rede, porém, de forma mais facilitada.
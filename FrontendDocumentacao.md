Documentação de Requisitos e Fluxos do Sistema: X Salgados
1. Visão Geral do Sistema
O sistema "X Salgados - Gestão de Pedidos" é uma aplicação web projetada para automatizar e centralizar todo o ciclo de vida dos pedidos da empresa. Seu principal objetivo é substituir o controle manual, proporcionando eficiência, organização e visibilidade sobre as operações diárias, desde o recebimento de um pedido até sua entrega final.

O sistema foi concebido para ser utilizado pelos colaboradores internos da empresa, com diferentes níveis de acesso e funcionalidades, de acordo com suas responsabilidades.

2. Perfis de Usuário e Permissões
O acesso ao sistema é controlado por papéis, garantindo que cada usuário veja e execute apenas as ações pertinentes à sua função.

Perfil	Descrição	Permissões de Acesso
Administrador  :	Usuário com controle total sobre o sistema. Geralmente o gerente ou dono do negócio.	
- Visualizar o Dashboard com todos os indicadores. - Acesso completo (criar, ler, editar, excluir) aos módulos de Pedidos, Clientes, Produtos e Usuários. - Visualizar as Rotas de Entrega.
Atendente : 	Responsável pela operação diária, como cadastrar pedidos e clientes.	
- Acesso completo (criar, ler, editar, excluir) aos módulos de Pedidos e Clientes. - Acesso de leitura ao módulo de Produtos. - Não pode visualizar o Dashboard, Rotas de Entrega ou gerenciar Usuários.
Entregador :	Responsável exclusivamente pela entrega dos pedidos.	
- Acesso exclusivo e limitado à tela de Rotas de Entrega. - Não pode acessar nenhum outro módulo do sistema.

Exportar para as Planilhas
3. Módulos e Funcionalidades do Sistema
3.1. Dashboard (Visão Geral)
Esta tela serve como um painel de controle central para o gestor, oferecendo uma visão rápida e consolidada da saúde do negócio.

Acesso: Exclusivo para o perfil Administrador.

Componentes:

Cards de KPIs (Indicadores-Chave de Performance):

Receita Total: Soma do valor de todos os pedidos dentro de um período pré-definido (ex: mês atual). O indicador de +12% este mês sugere uma comparação com o período anterior.

Total de Pedidos: Contagem de todos os pedidos recebidos no mesmo período.

Total de Clientes: Número total de clientes cadastrados na base.

Produtos Ativos: Contagem de produtos que estão com o status "Ativo" no catálogo.

Gráfico de Pedidos por Mês:

Um gráfico de barras que exibe a quantidade de pedidos realizados nos últimos 6 meses, permitindo a análise de sazonalidade e crescimento.

Gráfico de Status dos Pedidos:

Um gráfico de pizza que mostra a distribuição percentual e quantitativa dos pedidos em seus respectivos status atuais (Pendente, Em Produção, Pronto, Em Entrega).

3.2. Pedidos
Este é o módulo central do sistema, onde todos os pedidos são gerenciados.

Fluxo de Status de um Pedido: Um pedido progride através de um ciclo de vida bem definido:

Pendente: O pedido foi criado, mas a produção ainda não começou.

Em Produção: A cozinha iniciou a preparação do pedido.

Pronto: O pedido está finalizado e aguardando para sair para entrega.

Em Entrega: O pedido saiu com o entregador.

Entregue (Status Final): O pedido foi entregue com sucesso ao cliente.

Funcionalidades:

Listagem de Pedidos: Exibe todos os pedidos em uma tabela com as colunas: Número, Cliente, Data Entrega, Valor Total e Status.

Busca Rápida: Um campo de busca permite filtrar os pedidos por número, nome do cliente ou status.

Criação de Pedido:

Um botão "Novo Pedido" abre um formulário (modal) para o cadastro de um novo pedido.

Campos necessários: Cliente (selecionado de uma lista), Produtos (com suas respectivas quantidades), Data de Entrega.

O Valor Total do pedido deve ser calculado automaticamente com base nos produtos e quantidades selecionadas.

Ao ser criado, o pedido recebe o status inicial de Pendente.

Edição de Pedido: Permite alterar informações de um pedido existente, como produtos, quantidades ou status.

Exclusão de Pedido: Permite remover um pedido. Uma janela de confirmação ("Tem certeza que deseja excluir?") deve ser exibida antes da exclusão definitiva.

3.3. Clientes
Este módulo funciona como o CRM (Customer Relationship Management) do sistema, armazenando todas as informações dos clientes.

Funcionalidades:

Listagem de Clientes: Apresenta todos os clientes em uma tabela com as colunas: Nome, Telefone, Email, Cidade e CEP.

Busca Rápida: Permite filtrar clientes por nome, telefone ou email.

Cadastro de Cliente:

Um botão "Novo Cliente" abre um formulário (modal) para o cadastro.

Campos como Nome e Telefone são obrigatórios.

Edição de Cliente: Permite atualizar os dados cadastrais de um cliente.

Exclusão de Cliente: Permite remover um cliente do sistema, mediante confirmação.

Regra de Negócio: Não deve ser possível excluir um cliente que possua pedidos associados a ele. O sistema deve primeiro exigir a remoção dos pedidos ou a sua reatribuição.

3.4. Produtos
Gerencia o catálogo de todos os produtos oferecidos pela X Salgados.

Funcionalidades:

Listagem de Produtos: Exibe todos os produtos em uma tabela com as colunas: Nome, Categoria (ex: Salgados, Doces), Preço, Status e Ações.

Busca Rápida: Permite encontrar produtos por nome ou categoria.

Criação e Edição de Produto: Formulário (modal) para adicionar ou editar produtos. Campos como Nome, Preço e Categoria são obrigatórios.

Status do Produto: Um produto pode ser definido como Ativo ou Inativo.

Regra de Negócio: Produtos com status Inativo não devem aparecer na lista de seleção ao se criar ou editar um novo pedido.

3.5. Rotas de Entrega
Tela otimizada para o entregador, focada em fornecer as informações necessárias para as entregas do dia de forma clara e objetiva.

Acesso: Visível para Administrador e Entregador.

Funcionalidades:

Filtro Automático: A tela exibe automaticamente apenas os pedidos que estão com o status Pronto e cuja data de entrega corresponde ao dia atual.

Agrupamento Lógico: Os pedidos são agrupados por CEP para otimizar a rota de entrega e facilitar a logística.

Informações Essenciais: Para cada pedido na rota, são exibidas as informações cruciais: nome do cliente, endereço completo e telefone de contato.

Atualização de Status: O entregador deve ter uma forma simples (ex: um botão) de atualizar o status do pedido para Em Entrega ao iniciar a rota e para Entregue ao finalizar a entrega.

3.6. Usuários
Módulo administrativo para gerenciar quem pode acessar o sistema.

Acesso: Exclusivo para o perfil Administrador.

Funcionalidades:

Listagem de Usuários: Exibe todos os usuários do sistema com as colunas: Nome, Email, Papel (Administrador, Atendente, Entregador), Telefone e Data de Cadastro.

Criação e Edição de Usuário: Permite criar novos usuários, definir senhas e atribuir um papel a eles. Permite também editar os dados e o papel de usuários existentes.

Regra de Negócio: Um administrador não pode excluir a sua própria conta de usuário.

4. Requisitos Gerais e de Usabilidade
Autenticação: O sistema deve possuir uma tela de login (não exibida nas imagens) onde o usuário informa seu email e senha para acessar.

Navegação: A navegação principal é feita através de uma barra lateral fixa à esquerda, com ícones e texto, que direciona o usuário para os diferentes módulos de acordo com suas permissões.

Feedback ao Usuário:

Notificações: Todas as operações de criação, edição e exclusão devem gerar uma notificação visual de sucesso (verde) ou erro (vermelha) no canto da tela.

Carregamento: Durante o carregamento de dados (ex: ao carregar a lista de pedidos), um indicador de carregamento (spinner) deve ser exibido para informar ao usuário que o sistema está processando a requisição.

Confirmação: Ações destrutivas, como exclusões, sempre exigem uma confirmação explícita do usuário através de um modal.
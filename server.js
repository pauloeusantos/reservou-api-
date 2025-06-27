// server.js - VERSÃO CORRIGIDA

const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Habilita o parser para ler o corpo de requisições POST/PATCH/PUT
server.use(jsonServer.bodyParser);

// Adiciona os middlewares padrão (logger, static, cors, etc.)
server.use(middlewares);

// ROTA DE LOGIN CUSTOMIZADA
server.post('/api/login', (req, res) => {
  const { email, password, isRestaurante } = req.body;

  // Verifica se os dados necessários foram enviados
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  // Acessa o banco de dados do json-server
  const db = router.db.getState();
  
  let account = null;

  if (isRestaurante) {
    // Procura na tabela de restaurantes
    account = db.restaurantes.find(
      r => r.infoCadastro && r.infoCadastro.email === email
    );

    // Validação da senha
    if (account && account.infoCadastro.password === password) {
      // Login bem-sucedido
      const restauranteLogado = {
        id: account.id,
        nome: account.infoCadastro.nome,
        email: account.infoCadastro.email,
        type: 'restaurante'
      };
      // Nunca retorne a senha!
      return res.status(200).json(restauranteLogado);
    }
  } else {
    // Procura na tabela de usuários
    account = db.usuarios.find(u => u.email === email);
    
    // Validação da senha
    if (account && account.password === password) {
      // Login bem-sucedido
      const usuarioLogado = {
        id: account.id,
        nome: account.nome,
        email: account.email,
        type: 'usuario',
        // Inclui os favoritos para que o frontend não precise buscar de novo
        restaurantesFavoritos: account.restaurantesFavoritos || []
      };
      // Nunca retorne a senha!
      return res.status(200).json(usuarioLogado);
    }
  }
  
  // Se chegou até aqui, o login falhou
  return res.status(401).json({ message: 'Email ou senha incorretos.' });
});

// Adiciona o rewriter DEPOIS da rota customizada
// para não interferir no /api/login
server.use(jsonServer.rewriter({
  "/*": "/$1"
}));

// Usa o router do json-server para todas as outras rotas
server.use(router);

// Exporta o servidor para a Vercel
module.exports = server;
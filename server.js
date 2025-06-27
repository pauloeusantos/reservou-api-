const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");

// Usamos apenas o body-parser, que é essencial para o login funcionar
server.use(jsonServer.bodyParser);

// Adicionamos de volta sua rota de login segura
server.post('/api/login', (req, res) => {
  const { email, password, isRestaurante } = req.body;
  const db = router.db.getState();
  let account = null;

  if (isRestaurante) {
    account = db.restaurantes.find(r => r.infoCadastro && r.infoCadastro.email === email);
    if (account && account.infoCadastro.password === password) {
      const restauranteLogado = { id: account.id, nome: account.infoCadastro.nome, email: account.infoCadastro.email, type: 'restaurante' };
      return res.status(200).json(restauranteLogado);
    }
  } else {
    account = db.usuarios.find(u => u.email === email);
    if (account && account.password === password) {
      const usuarioLogado = { id: account.id, nome: account.nome, email: account.email, type: 'usuario', restaurantesFavoritos: account.restaurantesFavoritos || [] };
      return res.status(200).json(usuarioLogado);
    }
  }
  
  return res.status(401).json({ message: 'Email ou senha incorretos.' });
});

// O rewriter padrão do json-server
server.use(jsonServer.rewriter({ "/*": "/$1" }));

// O router principal para as rotas do db.json
server.use(router);

// Exporta a API para a Vercel
module.exports = server;
// server.js - VERSÃO CORRIGIDA PARA READ-ONLY

const jsonServer = require("json-server");
const server = jsonServer.create();

// ****** CORREÇÃO AQUI ******
// Carregamos o db.json como um objeto JavaScript em vez de um nome de arquivo
const dbData = require("./db.json");
const router = jsonServer.router(dbData); // O router agora usa o objeto em memória

server.use(jsonServer.bodyParser);

server.post('/api/login', (req, res) => {
    const { email, password, isRestaurante } = req.body;
    // O router.db agora acessa o banco de dados em memória
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

server.use(jsonServer.rewriter({ "/*": "/$1" }));
server.use(router);

module.exports = server;

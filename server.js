const jsonServer = require("json-server");
const cors = require("cors"); // 1. IMPORTE O PACOTE CORS
const server = jsonServer.create();

const dbData = require("./db.json");
const router = jsonServer.router(dbData);

// 2. USE O MIDDLEWARE DE CORS ANTES DE TODAS AS ROTAS
server.use(cors()); 

server.use(jsonServer.bodyParser);

// Sua rota de login continua aqui
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

server.use(jsonServer.rewriter({ "/*": "/$1" }));
server.use(router);

module.exports = server;
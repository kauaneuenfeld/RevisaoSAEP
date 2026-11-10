const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const CHAVE = 'academia_chave';

const db = require('./db');

const app = express();
app.use(express.json());
app.use(session({
  secret: 'segredo-academia',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, '..', 'FrontEnd')));

function autenticado(req, res, next) {
  if (!req.session.usuario) return res.status(401).json({ erro: 'Nao autenticado' });
  next();
}

app.post('/api/login', async (req, res) => {
  const { login, senha } = req.body;
  if (!login || !senha) return res.status(400).json({ erro: 'Informe login e senha' });
  const [rows] = await db.query('SELECT * FROM usuario WHERE login = ?', [login]);
  if (rows.length === 0 || !bcrypt.compareSync(senha, rows[0].senha)) {
    return res.status(401).json({ erro: 'Login ou senha invalidos' });
  }
  req.session.usuario = { id: rows[0].id, nome: rows[0].nome };
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/usuario', autenticado, (req, res) => res.json(req.session.usuario));

app.get('/api/alunos', autenticado, async (req, res) => {
  const busca = '%' + (req.query.busca || '') + '%';
  const [rows] = await db.query(
    `SELECT id, nome, CAST(AES_DECRYPT(cpf, ?) AS CHAR) AS cpf, email, telefone
     FROM aluno WHERE nome LIKE ? ORDER BY nome`, [CHAVE, busca]);
  res.json(rows);
});

app.post('/api/alunos', autenticado, async (req, res) => {
  const { nome, cpf, email, telefone } = req.body;
  if (!nome || !cpf) return res.status(400).json({ erro: 'Nome e CPF sao obrigatorios' });
  await db.query('INSERT INTO aluno (nome, cpf, email, telefone) VALUES (?, AES_ENCRYPT(?, ?), ?, ?)',
    [nome, cpf, CHAVE, email, telefone]);
  res.json({ ok: true });
});

app.put('/api/alunos/:id', autenticado, async (req, res) => {
  const { nome, cpf, email, telefone } = req.body;
  await db.query('UPDATE aluno SET nome=?, cpf=AES_ENCRYPT(?, ?), email=?, telefone=? WHERE id=?',
    [nome, cpf, CHAVE, email, telefone, req.params.id]);
  res.json({ ok: true });
});

app.delete('/api/alunos/:id', autenticado, async (req, res) => {
  try {
    await db.query('DELETE FROM aluno WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ erro: 'Aluno possui plano de treino ou agendamento e nao pode ser excluido' });
  }
});

app.get('/api/planos', autenticado, async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.*, a.nome AS aluno_nome FROM plano_treino p
     JOIN aluno a ON a.id = p.aluno_id ORDER BY p.id`);
  res.json(rows);
});

app.post('/api/planos', autenticado, async (req, res) => {
  const { nome, objetivo, descricao, aluno_id } = req.body;
  if (!nome || !aluno_id) return res.status(400).json({ erro: 'Nome e aluno sao obrigatorios' });
  await db.query('INSERT INTO plano_treino (nome, objetivo, descricao, aluno_id) VALUES (?, ?, ?, ?)',
    [nome, objetivo, descricao, aluno_id]);
  res.json({ ok: true });
});

app.get('/api/agendamentos', autenticado, async (req, res) => {
  const [rows] = await db.query(
    `SELECT g.id, g.data_aula,
            a.nome AS aluno_nome, CAST(AES_DECRYPT(a.cpf, ?) AS CHAR) AS aluno_cpf,
            a.email AS aluno_email, a.telefone AS aluno_telefone,
            p.nome AS plano_nome, p.objetivo AS plano_objetivo, p.descricao AS plano_descricao
     FROM agendamento g
     JOIN aluno a ON a.id = g.aluno_id
     JOIN plano_treino p ON p.id = g.plano_treino_id
     ORDER BY g.data_aula`, [CHAVE]);
  res.json(rows);
});

app.put('/api/agendamentos/:id', autenticado, async (req, res) => {
  if (!req.body.data_aula) return res.status(400).json({ erro: 'Informe a data' });
  await db.query('UPDATE agendamento SET data_aula = ? WHERE id = ?', [req.body.data_aula, req.params.id]);
  res.json({ ok: true });
});

app.listen(3000, () => console.log('Sistema rodando em http://localhost:3000'));

async function api(url, metodo, corpo) {
  const r = await fetch(url, {
    method: metodo || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  if (r.status === 401 && !url.includes('login')) {
    location.href = 'entrar.html';
    throw new Error('Sessão expirada');
  }
  const dados = await r.json();
  if (!r.ok) throw new Error(dados.erro || 'Erro');
  return dados;
}

async function cabecalho() {
  const u = await api('/api/usuario');
  document.getElementById('topo').innerHTML =
    'Usuário: <b>' + u.nome + '</b> | <a href="index.html">Início</a> | <a href="#" onclick="sair()">Sair</a><hr>';
}

async function sair() {
  await api('/api/logout', 'POST');
  location.href = 'entrar.html';
}

function paraInput(d) {
  return d.slice(0, 16).replace(' ', 'T');
}

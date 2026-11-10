DROP DATABASE IF EXISTS saep_db;
CREATE DATABASE saep_db CHARACTER SET utf8mb4;
USE saep_db;

CREATE TABLE usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  login VARCHAR(50) NOT NULL UNIQUE,
  senha VARCHAR(100) NOT NULL
);

CREATE TABLE aluno (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf VARBINARY(255) NOT NULL,
  email VARCHAR(100),
  telefone VARCHAR(20)
);

CREATE TABLE plano_treino (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  objetivo VARCHAR(100),
  descricao TEXT,
  aluno_id INT NOT NULL,
  FOREIGN KEY (aluno_id) REFERENCES aluno(id)
);

CREATE TABLE agendamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data_aula DATETIME NOT NULL,
  aluno_id INT NOT NULL,
  plano_treino_id INT NOT NULL,
  FOREIGN KEY (aluno_id) REFERENCES aluno(id),
  FOREIGN KEY (plano_treino_id) REFERENCES plano_treino(id)
);

INSERT INTO usuario (nome, login, senha) VALUES
 ('Maria Gerente', 'maria', '$2b$10$3RpsNGZTa88y3IBQLkN1jegrqt10HLvlA.GfEfQBnrvGXtx5iIa4y'),
 ('Joao Recepcao', 'joao',  '$2b$10$3RpsNGZTa88y3IBQLkN1jegrqt10HLvlA.GfEfQBnrvGXtx5iIa4y'),
 ('Ana Personal',  'ana',   '$2b$10$3RpsNGZTa88y3IBQLkN1jegrqt10HLvlA.GfEfQBnrvGXtx5iIa4y');

INSERT INTO aluno (nome, cpf, email, telefone) VALUES
 ('Carlos Silva',  AES_ENCRYPT('11122233344', 'academia_chave'), 'carlos@email.com', '11999990001'),
 ('Beatriz Souza', AES_ENCRYPT('55566677788', 'academia_chave'), 'bia@email.com',    '11999990002'),
 ('Pedro Lima',    AES_ENCRYPT('99988877766', 'academia_chave'), 'pedro@email.com',  '11999990003');

INSERT INTO plano_treino (nome, objetivo, descricao, aluno_id) VALUES
 ('Treino A', 'Hipertrofia',  'Peito, ombro e triceps', 1),
 ('Treino B', 'Emagrecimento','Cardio e funcional',     2),
 ('Treino C', 'Condicionamento','Circuito completo',    3);

INSERT INTO agendamento (data_aula, aluno_id, plano_treino_id) VALUES
 ('2026-11-10 08:00:00', 1, 1),
 ('2026-11-09 18:30:00', 2, 2),
 ('2026-11-11 07:00:00', 3, 3);

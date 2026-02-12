/**
 * database.js - Exemplo de Schema e Queries para persistir Codespaces
 * 
 * Suporta: PostgreSQL, MongoDB, MySQL
 * 
 * Instale: npm install pg  (para PostgreSQL)
 */

// ============================================================
// 1. SCHEMA PostgreSQL (SQL)
// ============================================================

/*
-- Criar tabela de usuários
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  github_username VARCHAR(100) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  foto_url VARCHAR(500),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de Codespaces
CREATE TABLE codespaces (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  github_codespace_id VARCHAR(100) UNIQUE NOT NULL,
  codespace_name VARCHAR(255) NOT NULL,
  web_url VARCHAR(500) NOT NULL,
  state VARCHAR(50) DEFAULT 'Creating', -- Creating, Available, Rebuilding, Stopped
  machine_type VARCHAR(50) NOT NULL,
  machine_display_name VARCHAR(100),
  location VARCHAR(100),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletado_em TIMESTAMP NULL
);

-- Criar tabela de logs para auditoria
CREATE TABLE codespaces_logs (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  codespace_id INT REFERENCES codespaces(id),
  acao VARCHAR(50) NOT NULL, -- create, start, stop, delete, error
  detalhes TEXT,
  status_code INT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX idx_codespaces_usuario ON codespaces(usuario_id);
CREATE INDEX idx_codespaces_state ON codespaces(state);
CREATE INDEX idx_logs_codespace ON codespaces_logs(codespace_id);
*/

// ============================================================
// 2. CLASSE Database com Métodos
// ============================================================

const { Pool } = require('pg');

class Database {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
  }

  // -------- USUÁRIOS --------

  /**
   * Criar novo usuário
   */
  async criarUsuario(email, githubUsername, nome) {
    const query = `
      INSERT INTO usuarios (email, github_username, nome)
      VALUES ($1, $2, $3)
      RETURNING id, email, github_username, criado_em
    `;

    const result = await this.pool.query(query, [
      email,
      githubUsername,
      nome,
    ]);
    return result.rows[0];
  }

  /**
   * Obter usuário por email
   */
  async obterUsuarioPorEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await this.pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Obter usuário por GitHub username
   */
  async obterUsuarioPorGithub(githubUsername) {
    const query = 'SELECT * FROM usuarios WHERE github_username = $1';
    const result = await this.pool.query(query, [githubUsername]);
    return result.rows[0] || null;
  }

  // -------- CODESPACES --------

  /**
   * Salvar novo Codespace
   */
  async salvarCodespace(usuarioId, githubData) {
    const query = `
      INSERT INTO codespaces (
        usuario_id, github_codespace_id, codespace_name, 
        web_url, state, machine_type, machine_display_name, location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      usuarioId,
      githubData.id,
      githubData.name,
      githubData.web_url,
      githubData.state,
      githubData.machine.name,
      githubData.machine.display_name,
      githubData.location,
    ]);

    // Log da ação
    await this.logAcao(usuarioId, result.rows[0].id, 'create', 'Codespace criado com sucesso', 201);

    return result.rows[0];
  }

  /**
   * Obter Codespaces do usuário
   */
  async obterCodespacesDoUsuario(usuarioId) {
    const query = `
      SELECT c.*, u.github_username 
      FROM codespaces c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.usuario_id = $1 AND c.deletado_em IS NULL
      ORDER BY c.criado_em DESC
    `;

    const result = await this.pool.query(query, [usuarioId]);
    return result.rows;
  }

  /**
   * Atualizar estado do Codespace
   */
  async atualizarEstado(codespaceName, novoEstado) {
    const query = `
      UPDATE codespaces 
      SET state = $1, atualizado_em = CURRENT_TIMESTAMP
      WHERE codespace_name = $2
      RETURNING *
    `;

    const result = await this.pool.query(query, [novoEstado, codespaceName]);
    return result.rows[0] || null;
  }

  /**
   * Deletar Codespace (soft delete)
   */
  async deletarCodespace(codespaceName, usuarioId) {
    const query = `
      UPDATE codespaces 
      SET deletado_em = CURRENT_TIMESTAMP
      WHERE codespace_name = $1 AND usuario_id = $2
      RETURNING *
    `;

    const result = await this.pool.query(query, [codespaceName, usuarioId]);

    if (result.rows[0]) {
      await this.logAcao(
        usuarioId,
        result.rows[0].id,
        'delete',
        `Codespace ${codespaceName} deletado`,
        200
      );
    }

    return result.rows[0] || null;
  }

  /**
   * Obter um Codespace por ID
   */
  async obterCodespaceById(codespaceName) {
    const query = `
      SELECT c.*, u.email, u.github_username
      FROM codespaces c
      JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.codespace_name = $1 AND c.deletado_em IS NULL
    `;

    const result = await this.pool.query(query, [codespaceName]);
    return result.rows[0] || null;
  }

  // -------- LOGS DE AUDITORIA --------

  /**
   * Registrar ação (log)
   */
  async logAcao(usuarioId, codespacceId, acao, detalhes, statusCode) {
    const query = `
      INSERT INTO codespaces_logs (usuario_id, codespace_id, acao, detalhes, status_code)
      VALUES ($1, $2, $3, $4, $5)
    `;

    await this.pool.query(query, [
      usuarioId,
      codespacceId,
      acao,
      detalhes,
      statusCode,
    ]);
  }

  /**
   * Obter logs de um usuário
   */
  async obterLogsDoUsuario(usuarioId, limite = 50) {
    const query = `
      SELECT * FROM codespaces_logs
      WHERE usuario_id = $1
      ORDER BY criado_em DESC
      LIMIT $2
    `;

    const result = await this.pool.query(query, [usuarioId, limite]);
    return result.rows;
  }

  /**
   * Obter logs de um Codespace
   */
  async obterLogsDoCodespace(codespacceId) {
    const query = `
      SELECT * FROM codespaces_logs
      WHERE codespace_id = $1
      ORDER BY criado_em DESC
    `;

    const result = await this.pool.query(query, [codespacceId]);
    return result.rows;
  }

  // -------- ESTATÍSTICAS --------

  /**
   * Contar Codespaces ativos
   */
  async contarCodespacesAtivos() {
    const query = `
      SELECT COUNT(*) as total FROM codespaces 
      WHERE state != 'Stopped' AND deletado_em IS NULL
    `;

    const result = await this.pool.query(query);
    return parseInt(result.rows[0].total);
  }

  /**
   * Listar Codespaces por estado
   */
  async codespacesPorEstado() {
    const query = `
      SELECT state, COUNT(*) as total 
      FROM codespaces 
      WHERE deletado_em IS NULL
      GROUP BY state
    `;

    const result = await this.pool.query(query);
    return result.rows;
  }

  /**
   * Usuário mais ativo (mais Codespaces criados)
   */
  async usuariosMaisAtivos(limite = 10) {
    const query = `
      SELECT 
        u.github_username, 
        COUNT(c.id) as total_codespaces,
        MAX(c.criado_em) as ultimo_codespace
      FROM usuarios u
      LEFT JOIN codespaces c ON u.id = c.usuario_id
      GROUP BY u.id, u.github_username
      ORDER BY total_codespaces DESC
      LIMIT $1
    `;

    const result = await this.pool.query(query, [limite]);
    return result.rows;
  }

  /**
   * Fechar pool de conexões
   */
  async fechar() {
    await this.pool.end();
  }
}

module.exports = new Database();

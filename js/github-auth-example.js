/**
 * Exemplo de uso da Autenticação GitHub no Frontend
 * 
 * Este arquivo demonstra como:
 * 1. Verificar se o usuário está autenticado
 * 2. Obter dados do usuário autenticado
 * 3. Fazer logout
 */

// ============ VERIFICAR AUTENTICAÇÃO ============

async function checkAuthentication() {
  try {
    const response = await fetch('/auth/user');
    
    if (response.status === 401) {
      console.log('Usuário não autenticado');
      // Redirecionar para login
      window.location.href = '/login.html';
      return null;
    }

    const data = await response.json();
    if (data.success) {
      console.log('Usuário autenticado:', data.user);
      return data.user;
    }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
  }
  return null;
}

// ============ OBTER DADOS DO USUÁRIO ============

async function getCurrentUser() {
  try {
    const response = await fetch('/auth/user');
    const data = await response.json();
    
    if (data.success) {
      return data.user;
    }
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
  }
  return null;
}

// ============ FAZER LOGOUT ============

function logout() {
  // Redireciona para a rota de logout que limpa a sessão
  window.location.href = '/auth/logout';
}

// ============ ATUALIZAR INTERFACE COM DADOS DO USUÁRIO ============

async function updateUserInterface() {
  const user = await getCurrentUser();
  
  if (user) {
    // Atualizar nome
    const nameElement = document.getElementById('userName');
    if (nameElement) {
      nameElement.textContent = user.name;
    }

    // Atualizar email
    const emailElement = document.getElementById('userEmail');
    if (emailElement) {
      emailElement.textContent = user.email;
    }

    // Atualizar avatar
    const avatarElement = document.getElementById('userAvatar');
    if (avatarElement) {
      avatarElement.src = user.avatar;
    }

    // Atualizar username
    const usernameElement = document.getElementById('userUsername');
    if (usernameElement) {
      usernameElement.textContent = `@${user.login}`;
    }

    return user;
  }
  
  return null;
}

// ============ EXEMPLOS DE USO EM HTML ============

/*

<!-- Elemento para mostrar dados do usuário -->
<div id="userProfile">
  <img id="userAvatar" src="" alt="Avatar" width="50" height="50">
  <div>
    <p id="userName">Carregando...</p>
    <p id="userEmail">Carregando...</p>
    <p id="userUsername">Carregando...</p>
  </div>
  <button onclick="logout()">Logout</button>
</div>

<script>
  // Quando a página carregar, atualizar interface com dados do usuário
  window.addEventListener('load', async () => {
    await updateUserInterface();
  });
</script>

*/

// ============ USO EM PAINEL/DASHBOARD ============

/*

// Proteger página (redirecionar se não autenticado)
window.addEventListener('load', async () => {
  const user = await checkAuthentication();
  if (!user) {
    // checkAuthentication já redireciona para login automaticamente
    return;
  }

  // Carregar dados do painel do usuário
  console.log(`Bem-vindo, ${user.name}!`);
  
  // Aqui você pode:
  // 1. Carregar dados do usuário do banco de dados
  // 2. Carregar Codespaces do usuário
  // 3. Atualizar interface do painel
});

*/

// ============ CRIAR CODESPACE APÓS LOGIN ============

async function createCodespaceAfterLogin(username) {
  try {
    const response = await fetch('/api/codespaces/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        userEmail: 'user@example.com',
        machineType: 'largeLinux' // 4 cores, 16GB RAM
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Codespace criado:', data.data);
      console.log('URL:', data.data.webUrl);
      return data.data;
    } else {
      console.error('Erro:', data.error);
    }
  } catch (error) {
    console.error('Erro ao criar Codespace:', error);
  }
  return null;
}

// ============ LISTAR CODESPACES DO USUÁRIO ============

async function listUserCodespaces(username) {
  try {
    const response = await fetch(`/api/codespaces/${username}`);
    const data = await response.json();

    if (data.success) {
      console.log(`Codespaces de ${username}:`, data.codespaces);
      return data.codespaces;
    }
  } catch (error) {
    console.error('Erro ao listar Codespaces:', error);
  }
  return [];
}

// ============ DELETAR CODESPACE ============

async function deleteCodespace(codespaceName) {
  try {
    const response = await fetch(`/api/codespaces/${codespaceName}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Codespace deletado com sucesso');
      return true;
    }
  } catch (error) {
    console.error('Erro ao deletar Codespace:', error);
  }
  return false;
}

// ============ EXEMPLO COMPLETO: FLUXO DE LOGIN ============

/*

// 1. Usuário clica no botão "Entrar com GitHub"
// 2. É redirecionado para /auth/github
// 3. GitHub OAuth flow acontece
// 4. Browser é redirecionado para /auth/github/callback
// 5. Backend:
//    - Troca código por token
//    - Busca dados do usuário no GitHub
//    - Cria repositório 'minehosting' se não existir
//    - Cria Codespace automaticamente
//    - Redireciona para /painel.html com dados do usuário
// 6. Em painel.html, você pode usar:
//    - getCurrentUser() para obter dados
//    - updateUserInterface() para atualizar UI
//    - logout() para fazer logout

*/

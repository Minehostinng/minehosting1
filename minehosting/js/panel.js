/* ================================
   MineHosting - Panel Logic
   ================================ */

document.addEventListener('DOMContentLoaded', function () {
    checkLogin();
    initPanel();
});

/* ================================
   Authentication
   ================================ */
function checkLogin() {
    // Verificar se há dados de login na URL (retorno do GitHub)
    const urlParams = new URLSearchParams(window.location.search);
    const githubSuccess = urlParams.get('success');

    if (githubSuccess === 'true') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user_name', urlParams.get('name') || 'Usuário');
        localStorage.setItem('user_email', urlParams.get('email') || '');
        localStorage.setItem('login_method', 'github');

        // Limpar parâmetros da URL sem recarregar a página
        window.history.replaceState({}, document.title, window.location.pathname);

        // Se houver um redirecionamento pendente, processa agora
        const pendingUrl = localStorage.getItem('pendingReturnUrl');
        if (pendingUrl) {
            localStorage.removeItem('pendingReturnUrl');
            window.location.href = pendingUrl;
            return;
        }
    }

    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userName = localStorage.getItem('user_name');

    // Lista de páginas protegidas
    const protectedPages = ['painel.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !isAuthenticated) {
        window.location.href = `login.html?returnUrl=${encodeURIComponent(window.location.href)}`;
        return;
    }

    // Se estiver no login mas já autenticado, redireciona para painel
    if (currentPage === 'login.html' && isAuthenticated) {
        window.location.href = 'painel.html';
        return;
    }

    // Update UI com dados do usuário
    if (isAuthenticated && userName) {
        const nameDisplay = document.getElementById('userName');
        const avatarDisplay = document.getElementById('userAvatar');

        if (nameDisplay) nameDisplay.textContent = userName;
        if (avatarDisplay) {
            const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            avatarDisplay.textContent = initials;
        }
    }
}

function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('login_method');
    window.location.href = 'index.html';
}

/* ================================
   Panel Functionality
   ================================ */
// Estado simulado dos servidores
const servers = {
    'srv-1': {
        id: 'srv-1',
        name: 'MeuServidor Survival',
        type: 'Paper 1.20.4',
        ram: '6GB',
        address: 'play.meuservidor.com',
        status: 'online', // online, offline, starting, stopping
        players: 23,
        maxPlayers: 100,
        logs: []
    },
    'srv-2': {
        id: 'srv-2',
        name: 'Servidor PvP Arena',
        type: 'Spigot 1.20.4',
        ram: '6GB',
        address: 'pvp.meuservidor.com',
        status: 'online',
        players: 24,
        maxPlayers: 100,
        logs: []
    }
};

let activeConsoleId = null;
let consoleInterval = null;

function initPanel() {
    if (!document.querySelector('.servers-section')) return; // Apenas na página do painel

    renderServers();
    setupModals();
    setupEventListeners();
}

function renderServers() {
    const container = document.querySelector('.servers-section');
    if (!container) return;

    // Manter o header, remover os cards antigos
    const header = container.querySelector('.servers-header');
    container.innerHTML = '';
    container.appendChild(header);

    Object.values(servers).forEach(server => {
        const card = document.createElement('div');
        card.className = 'server-card';
        card.id = `card-${server.id}`;

        const statusClass = server.status === 'online' ? 'online' : (server.status === 'offline' ? 'offline' : 'online warning');
        const statusText = server.status === 'online' ? `Online • ${server.players} jogadores` :
            (server.status === 'offline' ? 'Offline' :
                (server.status === 'starting' ? 'Iniciando...' : 'Parando...'));

        card.innerHTML = `
            <div class="server-info">
                <div class="server-icon">
                    <i class="fas fa-cube"></i>
                </div>
                <div class="server-details">
                    <h3>${server.name}</h3>
                    <p>${server.type} • ${server.ram} • ${server.address}</p>
                </div>
            </div>
            <div class="server-status ${statusClass}">${statusText}</div>
            <div class="server-actions">
                <button class="btn btn-outline" onclick="openConsole('${server.id}')"><i class="fas fa-terminal"></i> Console</button>
                <button class="btn btn-primary" onclick="openManager('${server.id}')"><i class="fas fa-cogs"></i> Gerenciar</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.querySelector('a[href*="login.html"]'); // Encontra botão de sair
    if (logoutBtn) {
        logoutBtn.removeAttribute('href');
        logoutBtn.style.cursor = 'pointer';
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            logout();
        };
    }
}

/* ================================
   Console Simulation
   ================================ */
function openConsole(serverId) {
    activeConsoleId = serverId;
    const server = servers[serverId];
    const modal = document.getElementById('consoleModal');

    // Reset console UI
    document.getElementById('consoleTitle').textContent = `Console: ${server.name}`;
    const output = document.getElementById('consoleOutput');
    output.innerHTML = '';

    // Adicionar logs históricos ou mensagem inicial
    if (server.logs.length === 0) {
        addLog(server, 'System: Console connection established.');
        if (server.status === 'online') {
            addLog(server, 'Server is running.');
        } else {
            addLog(server, 'Server is offline.');
        }
    } else {
        server.logs.forEach(log => appendLogToUI(log));
    }

    modal.classList.add('active');

    // Iniciar logs fake se o servidor estiver online
    if (server.status === 'online') {
        startFakeLogs(serverId);
    }
}

function closeConsole() {
    const modal = document.getElementById('consoleModal');
    modal.classList.remove('active');
    activeConsoleId = null;
    clearInterval(consoleInterval);
}

function sendCommand() {
    const input = document.getElementById('consoleInput');
    const command = input.value.trim();
    if (!command || !activeConsoleId) return;

    const server = servers[activeConsoleId];
    addLog(server, `> ${command}`);
    input.value = '';

    // Processar comandos
    processCommand(server, command);
}

function processCommand(server, cmd) {
    const command = cmd.toLowerCase().split(' ')[0];

    setTimeout(() => {
        switch (command) {
            case 'start':
                if (server.status !== 'offline') {
                    addLog(server, 'Server is already running or performing an action.');
                } else {
                    serverStatusChange(server.id, 'starting');
                }
                break;
            case 'stop':
                if (server.status === 'offline') {
                    addLog(server, 'Server is already offline.');
                } else {
                    serverStatusChange(server.id, 'stopping');
                }
                break;
            case 'restart':
                serverStatusChange(server.id, 'stopping');
                setTimeout(() => serverStatusChange(server.id, 'starting'), 3000);
                break;
            case 'help':
                addLog(server, 'Available commands: start, stop, restart, op <player>, say <msg>, help');
                break;
            case 'op':
                addLog(server, `Opped ${cmd.split(' ')[1] || 'unknown'}`);
                break;
            case 'say':
                addLog(server, `[Server] ${cmd.substring(4)}`);
                break;
            default:
                addLog(server, `Unknown command: ${command}`);
        }
    }, 500);
}

function serverStatusChange(serverId, newStatus) {
    const server = servers[serverId];
    server.status = newStatus;
    renderServers(); // Atualizar card na lista

    if (activeConsoleId === serverId) {
        if (newStatus === 'starting') {
            addLog(server, 'Starting server details...');
            simulateBoot(server);
        } else if (newStatus === 'stopping') {
            addLog(server, 'Stopping server...');
            clearInterval(consoleInterval);
            setTimeout(() => {
                server.status = 'offline';
                addLog(server, 'Server stopped.');
                renderServers();
            }, 2000);
        }
    }
}

function simulateBoot(server) {
    let steps = [
        'Loading libraries, please wait...',
        'Loading properties...',
        'Default game type: SURVIVAL',
        'Generating keypair...',
        'Starting Minecraft server on *:25565',
        'Preparing level "world"',
        'Preparing start region for level 0',
        'Done (2.543s)! For help, type "help"'
    ];

    let i = 0;
    const bootInterval = setInterval(() => {
        if (i >= steps.length) {
            clearInterval(bootInterval);
            server.status = 'online';
            addLog(server, 'Server marked as ONLINE.');
            renderServers();
            startFakeLogs(server.id);
        } else {
            addLog(server, steps[i]);
            i++;
        }
    }, 800);
}

function startFakeLogs(serverId) {
    clearInterval(consoleInterval);
    consoleInterval = setInterval(() => {
        if (activeConsoleId !== serverId || servers[serverId].status !== 'online') {
            clearInterval(consoleInterval);
            return;
        }

        const randomLogs = [
            'Can\'t keep up! Is the server overloaded?',
            'User123 joined the game',
            'User123 lost connection: Disconnected',
            'Villager generated at 102, 65, -300',
            'Saving... Saved the world'
        ];

        if (Math.random() > 0.7) {
            addLog(servers[serverId], randomLogs[Math.floor(Math.random() * randomLogs.length)]);
        }
    }, 3000);
}

function addLog(server, message) {
    const timestamp = new Date().toLocaleTimeString();
    const logLine = `[${timestamp}] [Server thread/INFO]: ${message}`;
    server.logs.push(logLine);
    if (server.logs.length > 50) server.logs.shift(); // Manter histórico limitado

    if (activeConsoleId === server.id) {
        appendLogToUI(logLine);
    }
}

function appendLogToUI(text) {
    const output = document.getElementById('consoleOutput');
    const p = document.createElement('div');
    p.textContent = text;
    p.style.fontFamily = 'monospace';
    p.style.marginBottom = '2px';
    output.appendChild(p);
    output.scrollTop = output.scrollHeight;
}

/* ================================
   Modals
   ================================ */
let activeServerIdManger = null;

function openManager(serverId) {
    activeServerIdManger = serverId;
    const server = servers[serverId];

    document.getElementById('managerName').value = server.name;
    document.getElementById('managerAddress').value = server.address;
    document.getElementById('managerType').value = server.type; // Simplificação

    document.getElementById('managerModal').classList.add('active');
}

function closeManager() {
    document.getElementById('managerModal').classList.remove('active');
    activeServerIdManger = null;
}

function saveManager() {
    if (!activeServerIdManger) return;

    const server = servers[activeServerIdManger];
    server.name = document.getElementById('managerName').value;
    server.address = document.getElementById('managerAddress').value;
    // Em um app real, atualizariamos o tipo também com validação

    renderServers();
    closeManager();

    // Feedback visual opcional
    alert('Configurações salvas com sucesso!');
}

function setupModals() {
    // Modais já estão no HTML estático
}

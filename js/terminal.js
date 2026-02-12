/* ================================
   MineHosting - Terminal & GitHub Logic
   ================================ */

document.addEventListener('DOMContentLoaded', function () {
    initTerminal();
});

function initTerminal() {
    const terminalInput = document.getElementById('terminalInput');
    const terminalOutput = document.getElementById('terminalOutput');
    const btnConnectGithub = document.getElementById('btnConnectGithub');
    const btnInstallVersion = document.getElementById('btnInstallVersion');
    const btnExecuteVersion = document.getElementById('btnExecuteVersion');
    const clearTerminal = document.getElementById('clearTerminal');

    // Estado da página
    const state = {
        githubConnected: false,
        instanceRunning: false,
        currentVersion: null,
        installedVersions: [],
        username: localStorage.getItem('user_name') || 'usuario'
    };

    // Mensagem de boas-vindas
    addTerminalLine(`Bem-vindo ao MineHosting Terminal, ${state.username}!`, 'info');
    addTerminalLine('Ambiente isolado detectado como x86_64 v3.', 'system');

    // Terminal Input
    terminalInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            const cmd = this.value.trim();
            if (cmd) {
                processUserCommand(cmd);
            }
            this.value = '';
        }
    });

    // GitHub Connection
    btnConnectGithub.addEventListener('click', function () {
        const repo = document.getElementById('githubRepo').value;
        if (!repo) {
            addTerminalLine('Erro: Por favor, insira o repositório (usuario/repo).', 'error');
            return;
        }

        addTerminalLine(`Conectando ao GitHub API...`, 'system');
        
        setTimeout(() => {
            state.githubConnected = true;
            document.getElementById('githubStatusDot').classList.add('connected');
            document.getElementById('githubStatusText').textContent = 'Conectado';
            document.getElementById('githubStatusText').style.color = '#00d4aa';
            
            addTerminalLine(`Sucesso! Repositório ${repo} vinculado.`, 'info');
            addTerminalLine(`Webhook instalado na branch ${document.getElementById('githubBranch').value}.`, 'system');
            
            document.getElementById('lastSync').textContent = new Date().toLocaleString();
            btnConnectGithub.innerHTML = '<i class="fas fa-sync"></i> Sincronizar Agora';
        }, 1500);
    });

    // Install Version
    btnInstallVersion.addEventListener('click', function () {
        const engine = document.getElementById('minecraftEngine').value;
        const version = document.getElementById('minecraftVersion').value;
        
        addTerminalLine(`Baixando binários para ${engine}-${version}...`, 'system');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress <= 100) {
                // Simula progresso no terminal
            }
            if (progress === 100) {
                clearInterval(interval);
                state.installedVersions.push(`${engine}-${version}`);
                addTerminalLine(`Instalação do ${engine} ${version} concluída com sucesso.`, 'info');
                document.getElementById('currentVersion').textContent = `${engine} ${version}`;
            }
        }, 300);
    });

    // Execute Version
    btnExecuteVersion.addEventListener('click', function () {
        const version = document.getElementById('currentVersion').textContent;
        if (version === 'Nenhuma') {
            addTerminalLine('Erro: Nenhuma versão instalada. Instale uma versão primeiro.', 'error');
            return;
        }

        if (state.instanceRunning) {
            addTerminalLine('Interrompendo instância atual...', 'warn');
            stopInstance();
            btnExecuteVersion.innerHTML = '<i class="fas fa-play"></i> Executar';
            btnExecuteVersion.classList.remove('btn-warn');
            btnExecuteVersion.classList.add('btn-primary');
        } else {
            addTerminalLine(`Iniciando Minecraft Server (${version})...`, 'info');
            startInstance();
            btnExecuteVersion.innerHTML = '<i class="fas fa-stop"></i> Parar';
            btnExecuteVersion.classList.remove('btn-primary');
            btnExecuteVersion.classList.add('btn-warn');
        }
    });

    // Utilities
    clearTerminal.addEventListener('click', function() {
        terminalOutput.innerHTML = '';
        addTerminalLine('Console limpo.', 'system');
    });

    function addTerminalLine(text, type = '') {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour12: false });
        line.innerHTML = `<span style="opacity: 0.5">[${timestamp}]</span> ${text}`;
        
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function processUserCommand(cmd) {
        addTerminalLine(cmd, 'command');
        const args = cmd.toLowerCase().split(' ');
        const baseCmd = args[0];

        setTimeout(() => {
            switch (baseCmd) {
                case 'help':
                    addTerminalLine('Comandos disponíveis:', 'info');
                    addTerminalLine('  github connect <repo> - Vincula repositório', 'system');
                    addTerminalLine('  minecraft install <versao> - Instala versão', 'system');
                    addTerminalLine('  minecraft start - Inicia o servidor', 'system');
                    addTerminalLine('  minecraft stop - Para o servidor', 'system');
                    addTerminalLine('  clear - Limpa o console', 'system');
                    addTerminalLine('  git pull - Sincroniza com GitHub', 'system');
                    break;
                case 'clear':
                    terminalOutput.innerHTML = '';
                    break;
                case 'git':
                    if (args[1] === 'pull') {
                        if (!state.githubConnected) {
                            addTerminalLine('Erro: GitHub não está vinculado.', 'error');
                        } else {
                            addTerminalLine('Fetching remote changes...', 'system');
                            addTerminalLine('Pulling from origin/main...', 'system');
                            addTerminalLine('Files updated: 12. Total size: 450KB.', 'info');
                        }
                    } else {
                        addTerminalLine('Uso: git pull', 'warn');
                    }
                    break;
                case 'minecraft':
                    if (args[1] === 'start') {
                        btnExecuteVersion.click();
                    } else if (args[1] === 'stop') {
                        if (state.instanceRunning) btnExecuteVersion.click();
                        else addTerminalLine('Servidor já está offline.', 'warn');
                    } else {
                        addTerminalLine('Uso: minecraft <start|stop|install>', 'warn');
                    }
                    break;
                default:
                    addTerminalLine(`Comando não reconhecido: ${baseCmd}. Digite 'help'.`, 'error');
            }
        }, 100);
    }

    function startInstance() {
        state.instanceRunning = true;
        document.getElementById('instanceStatus').textContent = 'Online';
        document.getElementById('instanceStatus').style.color = '#00d4aa';
        
        const logs = [
            'Loading libraries, please wait...',
            'Starting Minecraft server on *:25565',
            'Preparing level "world"',
            'Done! For help, type "help"'
        ];
        
        let i = 0;
        const logInterval = setInterval(() => {
            if (i < logs.length) {
                addTerminalLine(logs[i], 'system');
                i++;
            } else {
                clearInterval(logInterval);
            }
        }, 600);
    }

    function stopInstance() {
        state.instanceRunning = false;
        document.getElementById('instanceStatus').textContent = 'Offline';
        document.getElementById('instanceStatus').style.color = '#ff4757';
        addTerminalLine('Server thread stopped.', 'system');
    }
}

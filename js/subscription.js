// js/subscription.js - Gerenciar seleção e salvamento de plano com persistência
class SubscriptionManager {
    constructor() {
        this.selectedPlan = 'pro'; // Padrão
        this.init();
    }

    init() {
        // Buscar elementos de plano
        const planOptions = document.querySelectorAll('.plan-option');
        
        planOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectPlan(e.currentTarget);
            });
        });

        // Se houver um botão de confirmação
        const confirmBtn = document.getElementById('confirm-plan-btn') || 
                          document.querySelector('[data-action="confirm-subscription"]') ||
                          document.querySelector('button');
        
        if (confirmBtn && !confirmBtn.id.includes('logout')) {
            confirmBtn.addEventListener('click', () => this.savePlan());
        }
    }

    selectPlan(element) {
        // Remove seleção anterior
        document.querySelectorAll('.plan-option').forEach(opt => {
            opt.classList.remove('selected', 'featured');
        });

        // Marca novo plano
        element.classList.add('selected', 'featured');

        // Armazena dados do plano
        this.selectedPlan = element.getAttribute('data-plan');
        const price = element.getAttribute('data-price');
        
        console.log(`✓ Plano selecionado: ${this.selectedPlan} - R$ ${price}`);

        // Destaca visualmente
        element.style.transform = 'scale(1.05)';
        element.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';

        // Reset após animação
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);

        return {
            plan: this.selectedPlan,
            price: price
        };
    }

    async savePlan() {
        try {
            // Obter dados do usuário da URL
            const params = new URLSearchParams(window.location.search);
            const username = params.get('username') || this.getUserFromSession();
            const name = params.get('name') || this.getUserData('name');
            const email = params.get('email') || this.getUserData('email');
            const avatar = params.get('avatar') || this.getUserData('avatar');

            if (!username) {
                alert('❌ Você precisa fazer login primeiro!');
                window.location.href = '/login.html';
                return;
            }

            const planElement = document.querySelector('.plan-option.selected');
            if (!planElement) {
                alert('⚠️ Selecione um plano antes de continuar!');
                return;
            }

            const plan = planElement.getAttribute('data-plan');
            const price = planElement.getAttribute('data-price');

            console.log(`🔄 Salvando plano ${plan} para ${username}...`);

            // Salvar dados do usuário no localStorage
            const userData = {
                username,
                name,
                email,
                avatar,
                plan,
                price,
                selectedDate: new Date().toISOString(),
                startDate: new Date().toISOString(),
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active'
            };

            localStorage.setItem('userAccount', JSON.stringify(userData));
            console.log('💾 Dados salvos no localStorage:', userData);

            // Fazer requisição para API também
            const response = await fetch('/api/subscription/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    plan,
                    price,
                    email
                })
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Plano salvo com sucesso!', data.subscription);
                
                // Mostrar mensagem de sucesso
                this.showNotification('✅ Plano atualizado com sucesso!', 'success');

                // Redirecionar para área do cliente após 2 segundos
                setTimeout(() => {
                    window.location.href = `/cliente.html?username=${username}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&avatar=${encodeURIComponent(avatar)}&plan=${plan}`;
                }, 2000);
            } else {
                throw new Error(data.error || 'Erro ao salvar');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar plano:', error);
            this.showNotification(`❌ Erro: ${error.message}`, 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getUserFromSession() {
        // Tentar obter do localStorage
        const userData = this.getUserData();
        return userData?.username;
    }

    getUserData(field = null) {
        try {
            const stored = localStorage.getItem('userAccount');
            if (!stored) return field ? null : {};
            
            const data = JSON.parse(stored);
            return field ? data[field] : data;
        } catch (e) {
            console.error('Erro ao recuperar dados:', e);
            return field ? null : {};
        }
    }
}

// Função auxiliar global para salvar dados de usuário
window.saveUserData = function(userData) {
    try {
        localStorage.setItem('userAccount', JSON.stringify(userData));
        console.log('💾 Dados de usuário salvos:', userData);
    } catch (e) {
        console.error('Erro ao salvar dados:', e);
    }
};

// Função auxiliar global para obter dados de usuário
window.getUserData = function(field = null) {
    try {
        const stored = localStorage.getItem('userAccount');
        if (!stored) return field ? null : {};
        
        const data = JSON.parse(stored);
        return field ? data[field] : data;
    } catch (e) {
        console.error('Erro ao recuperar dados:', e);
        return field ? null : {};
    }
};

// Iniciar quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    window.subscriptionManager = new SubscriptionManager();
});

// Adicionar estilos CSS para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

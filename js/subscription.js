// js/subscription.js - Gerenciar seleção e salvamento de plano
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
            const email = params.get('email');

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

            // Fazer requisição para API
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
                    window.location.href = `/cliente.html?username=${username}&name=${params.get('name')}&email=${email}&avatar=${params.get('avatar')}&plan=${plan}`;
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
        // Tentar obter do localStorage ou sessionStorage
        return localStorage.getItem('username') || sessionStorage.getItem('username');
    }
}

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

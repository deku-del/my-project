// ===== ПЕРЕМЕННЫЕ ИГРЫ =====
let balance = localStorage.getItem('casinoBalance') !== null ? parseInt(localStorage.getItem('casinoBalance')) : 0;
let initialBalanceBaseline = localStorage.getItem('casinoBaseline') !== null ? parseInt(localStorage.getItem('casinoBaseline')) : 0;
let currentGame = null;
let gameStats = localStorage.getItem('casinoGameStats')
    ? JSON.parse(localStorage.getItem('casinoGameStats'))
    : { totalBets: 0, totalWins: 0, winCount: 0, loseCount: 0, drawCount: 0 };

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function showToast(message) {
    let toast = document.getElementById('custom-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'custom-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<span style="font-size: 1.2rem; margin-right: 8px;">⚠️</span> ${message}`;
    toast.className = 'toast-notification';

    // Clear previous timeout if exists
    if (toast.timeoutId) clearTimeout(toast.timeoutId);

    toast.timeoutId = setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 500); // Remove from DOM after animation
    }, 3500);
}

function showAlert(message) {
    showToast(message);
}

function updateStats() {
    const statsEl = document.getElementById('roulette-stats');
    if (!statsEl) return;
    if (gameStats.totalBets === 0) {
        statsEl.classList.remove('show');
        return;
    }
    statsEl.classList.add('show');
    const winRate = gameStats.winCount > 0 ? ((gameStats.winCount / (gameStats.winCount + gameStats.loseCount + gameStats.drawCount)) * 100).toFixed(1) : '0.0';
    statsEl.innerHTML = `
        <div class="stat-row"><span class="stat-label">Всего ставок ($):</span><span class="stat-value">$${gameStats.totalBets}</span></div>
        <div class="stat-row"><span class="stat-label">Общий выигрыш ($):</span><span class="stat-value">$${gameStats.totalWins}</span></div>
        <div class="stat-row"><span class="stat-label">Побед:</span><span class="stat-value">${gameStats.winCount}</span></div>
        <div class="stat-row"><span class="stat-label">Поражений:</span><span class="stat-value">${gameStats.loseCount}</span></div>
        <div class="stat-row"><span class="stat-label">Процент побед:</span><span class="stat-value">${winRate}%</span></div>
    `;
}

// ===== ИСТОРИЯ СТАВОК =====
let betHistory = localStorage.getItem('casinoBetHistory')
    ? JSON.parse(localStorage.getItem('casinoBetHistory'))
    : [];

// === Сохранение данных в localStorage ===
function saveBetHistory() {
    localStorage.setItem('casinoBetHistory', JSON.stringify(betHistory));
    localStorage.setItem('casinoGameStats', JSON.stringify(gameStats));
}

// ===== ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ =====
function initTheme() {
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.textContent = '🌙';
    }
}
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = isLight ? '🌙' : '☀️';
}
document.addEventListener('DOMContentLoaded', initTheme);

const LOSS_ITEMS = [
    { name: 'Пицца (Большая)', emoji: '🍕', price: 25, comment: 'Средний чек на доставку' },
    { name: 'AirPods Pro 3', emoji: '🎧', price: 250, comment: 'Новое поколение наушников Apple' },
    { name: 'iPhone 16 Pro (256 GB)', emoji: '📱', price: 750, comment: 'Классика для сравнения потерь' },
    { name: 'PlayStation 5 Pro', emoji: '🎮', price: 900, comment: 'Рекомендованная цена 2026' },
    { name: 'MacBook Air M3', emoji: '💻', price: 1100, comment: 'Идеально для сравнения «слитого» банка' }
];

const IRONIC_CAPTIONS = [
    { min: 0, max: 0, text: '🎉 Ваш баланс в порядке! Но это ненадолго…' },
    { min: 1, max: 100, text: '💸 Пока мелочь. Всего {pizza} пицц улетело в карман букмекера.' },
    { min: 101, max: 500, text: '🍕 На эти деньги вы могли бы купить {pizza} пицц, но выбрали поддержать букмекера. Приятного аппетита!' },
    { min: 501, max: 1000, text: '🎧 Поздравляем! Вы «подарили» букмекеру {airpods} пар AirPods Pro. Надеемся, он оценит вашу щедрость.' },
    { min: 1001, max: 1500, text: '📱 Вы могли бы купить {iphone} iPhone, но вместо этого инвестировали в статистику проигрышей. Мудрый выбор!' },
    { min: 1501, max: 2000, text: '🎮 {ps5} PlayStation 5 Pro могли бы быть вашими. Но букмекер сказал «спасибо» и забрал всё.' },
    { min: 2001, max: 2500, text: '💻 На эти деньги — {macbook} MacBook Air. Но зачем вам ноутбук, когда есть ощущение проигрыша?' },
    { min: 2501, max: 3000, text: '🔥 Вы потеряли почти всё! {pizza} пицц, {iphone} iPhone, {macbook} MacBook... Всё это теперь у букмекера.' }
];

function recordBet(game, bet, result, payout) {
    const entry = {
        game: game,
        iterations: 1,
        totalWager: bet,
        totalPayout: payout,
        netProfit: result === 'win' ? payout - bet : (result === 'lose' ? -bet : 0),
        result: result,
        balanceAfter: Math.floor(balance),
        timestamp: Date.now()
    };
    betHistory.unshift(entry);
    if (betHistory.length > 50) betHistory.pop();

    if (result === 'draw') gameStats.drawCount++;

    saveBetHistory();
    renderBetHistory();
    updateLossCalculator();
}

function renderBetHistory() {
    const container = document.getElementById('bet-history-list');
    if (!container) return;

    const counters = document.getElementById('bet-history-counters');
    if (counters) {
        const netProfit = Math.floor(balance) - initialBalanceBaseline;
        const totalHtml = netProfit >= 0
            ? `<span class="bh-counter bh-total-win">💰 Итог: +$${netProfit}</span>`
            : `<span class="bh-counter bh-total-lose">🔻 Итог: -$${Math.abs(netProfit)}</span>`;
        counters.innerHTML = `
            <span class="bh-counter bh-win">✅ ${gameStats.winCount}</span>
            <span class="bh-counter bh-lose">❌ ${gameStats.loseCount}</span>
            <span class="bh-counter bh-draw">🤝 ${gameStats.drawCount}</span>
            ${totalHtml}
        `;
    }

    if (betHistory.length === 0) {
        container.innerHTML = '<div class="bh-empty">Пока нет ставок. Сыграйте в любую игру!</div>';
        return;
    }

    const GAME_NAMES = {
        roulette: '🎡 Рулетка', slots: '🎰 Слоты', wheel: '🎪 Колесо',
        dice: '🎲 Кости', coin: '🟡 Монета', blackjack: '🃏 Блэкджек',
        rps: '✂️ КНБ', betting: '⚽ Ставки'
    };

    container.innerHTML = betHistory.map(e => {
        const cls = e.result === 'win' ? 'bh-item-win' : e.result === 'draw' ? 'bh-item-draw' : 'bh-item-lose';
        const icon = e.result === 'win' ? '✅' : e.result === 'draw' ? '🤝' : '❌';

        const iters = e.iterations || 1;
        const wager = e.totalWager !== undefined ? e.totalWager : e.bet;
        const payout = e.totalPayout !== undefined ? e.totalPayout : (e.payout || 0);
        let netProfit = 0;
        if (e.netProfit !== undefined) netProfit = e.netProfit;
        else netProfit = e.result === 'win' ? payout - wager : (e.result === 'lose' ? -wager : 0);

        const netProfitStr = netProfit > 0 ? `+$${netProfit}` : (netProfit < 0 ? `-$${Math.abs(netProfit)}` : `$0`);
        const profitColor = netProfit > 0 ? '#2ecc71' : (netProfit < 0 ? '#e74c3c' : '#f1c40f');

        return `<div class="bh-item ${cls}" style="flex-direction: column; align-items: stretch; gap: 5px; text-align: left; padding: 10px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; margin-bottom: 4px;">
                <span>${icon} ${GAME_NAMES[e.game] || e.game}</span>
                <span style="color: ${profitColor}; border: 1px solid ${profitColor}40; padding: 2px 6px; border-radius: 4px; background: ${profitColor}10;">Чистыми: ${netProfitStr}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #bdc3c7;">
                <span>Ставка: $${wager}</span>
                <span>Выплата: $${payout}</span>
                <span>Игр: ${iters}</span>
            </div>
            <div style="text-align: right; font-size: 0.8rem; color: #7f8c8d; margin-top: 4px;">
                Баланс: $${e.balanceAfter}
            </div>
        </div>`;
    }).join('');
}

function getIronicCaption(totalLost) {
    const pizza = Math.floor(totalLost / 25);
    const airpods = Math.floor(totalLost / 250);
    const iphone = Math.floor(totalLost / 750);
    const ps5 = Math.floor(totalLost / 900);
    const macbook = Math.floor(totalLost / 1100);

    let caption = IRONIC_CAPTIONS[0].text;
    for (const c of IRONIC_CAPTIONS) {
        if (totalLost >= c.min && totalLost <= c.max) { caption = c.text; break; }
    }
    return caption
        .replace('{pizza}', pizza)
        .replace('{airpods}', airpods)
        .replace('{iphone}', iphone)
        .replace('{ps5}', ps5)
        .replace('{macbook}', macbook);
}

function updateLossCalculator() {
    const totalLost = Math.max(0, initialBalanceBaseline - Math.floor(balance));
    const lossEl = document.getElementById('calc-loss-amount');
    const captionEl = document.getElementById('calc-ironic-caption');
    const gridEl = document.getElementById('calc-items-grid');

    if (!lossEl || !gridEl) return;

    lossEl.textContent = '$' + totalLost;
    if (totalLost > 0) lossEl.classList.add('loss-active');
    else lossEl.classList.remove('loss-active');

    if (captionEl) captionEl.textContent = getIronicCaption(totalLost);

    const lossRatio = Math.min(totalLost / initialBalanceBaseline, 1);

    gridEl.innerHTML = LOSS_ITEMS.map(item => {
        const count = Math.floor(totalLost / item.price);
        const itemOpacity = Math.max(0.15, 1 - lossRatio * 0.85);
        const glassBlur = lossRatio * 8;
        return `<div class="calc-item" style="--item-opacity: ${itemOpacity}; --glass-blur: ${glassBlur}px;">
            <div class="calc-item-emoji" style="opacity: ${itemOpacity}; filter: blur(${glassBlur}px);">${item.emoji}</div>
            <div class="calc-item-name">${item.name}</div>
            <div class="calc-item-price">$${item.price}</div>
            <div class="calc-item-count">${count > 0 ? '×' + count : '—'}</div>
            <div class="calc-item-comment">${item.comment}</div>
        </div>`;
    }).join('');

    // Dynamic item icons grid
    const dynamicGrid = document.getElementById('calc-dynamic-grid');
    if (dynamicGrid && totalLost > 0) {
        let icons = [];
        let remaining = totalLost;
        for (let i = LOSS_ITEMS.length - 1; i >= 0; i--) {
            const item = LOSS_ITEMS[i];
            const cnt = Math.floor(remaining / item.price);
            for (let j = 0; j < Math.min(cnt, 12); j++) {
                icons.push(`<span class="calc-dyn-icon" title="${item.name} ($${item.price})">${item.emoji}</span>`);
            }
            remaining -= cnt * item.price;
        }
        if (icons.length === 0 && totalLost > 0) {
            const pizzas = Math.floor(totalLost / 25);
            for (let j = 0; j < Math.min(pizzas, 20); j++) {
                icons.push(`<span class="calc-dyn-icon" title="Пицца ($25)">🍕</span>`);
            }
        }
        dynamicGrid.innerHTML = icons.join('');
    } else if (dynamicGrid) {
        dynamicGrid.innerHTML = '<span class="calc-dyn-empty">Потерь пока нет — так держать! 🎉</span>';
    }
}

function clearBetHistory() {
    betHistory = [];
    gameStats.drawCount = 0;
    saveBetHistory();
    renderBetHistory();
    updateLossCalculator();
}

// Сброс только истории ставок (кнопка)
function clearBetHistoryOnly() {
    betHistory = [];
    gameStats = { totalBets: 0, totalWins: 0, winCount: 0, loseCount: 0, drawCount: 0 };
    initialBalanceBaseline = Math.floor(balance);
    localStorage.setItem('casinoBaseline', initialBalanceBaseline);
    saveBetHistory();
    renderBetHistory();
    updateLossCalculator();
    updateStats();
    // showToast('История ставок очищена');
}

// Сброс калькулятора потерь (кнопка)
function clearCalculator() {
    initialBalanceBaseline = Math.floor(balance);
    localStorage.setItem('casinoBaseline', initialBalanceBaseline);
    updateLossCalculator();
    // showToast('Калькулятор потерь сброшен');
}

// Global Balance Update
function updateGlobalBalance() {
    localStorage.setItem('casinoBalance', balance);
    const navBal = document.getElementById('nav-global-balance');
    if (navBal) navBal.textContent = '$' + Math.floor(balance);
    const localBal = document.getElementById('balance-display');
    if (localBal) localBal.textContent = Math.floor(balance);
    updateLossCalculator();
}

function resetCasinoBalance() {
    openDepositModal();
}

function openDepositModal() {
    const modal = document.getElementById('depositModal');
    if (modal) {
        // Синхронизируем текущий баланс в окне депозита
        const depBal = document.getElementById('deposit-current-balance');
        if (depBal) depBal.textContent = Math.floor(balance);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeDepositModal() {
    const modal = document.getElementById('depositModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function submitDeposit() {
    const input = document.getElementById('deposit-amount');
    if (input) submitDepositQuick(input.value);
}

function submitDepositQuick(val) {
    const parsed = parseInt(val);
    if (isNaN(parsed) || parsed < 1 || parsed > 1000000) {
        showToast('Пожалуйста, введите сумму от $1 до $1,000,000.');
        return;
    }
    balance = parsed;
    initialBalanceBaseline = parsed;
    localStorage.setItem('casinoBalance', balance);
    localStorage.setItem('casinoBaseline', initialBalanceBaseline);
    updateGlobalBalance();
    updateStats();
    // showToast(`Баланс установлен: $${parsed}`);

    // Animate reset
    const navBal = document.getElementById('nav-global-balance');
    if (navBal) {
        navBal.style.animation = 'none';
        void navBal.offsetWidth;
        navBal.style.animation = 'winPulse 0.5s ease';
    }
    closeDepositModal();
}

function resetBalanceTo3000() {
    balance = 0;
    initialBalanceBaseline = 0;
    localStorage.setItem('casinoBalance', balance);
    localStorage.setItem('casinoBaseline', initialBalanceBaseline);
    updateGlobalBalance();
    updateStats();
    // showToast('Баланс сброшен до $0');

    // Обновляем отображение в модалке
    const depBal = document.getElementById('deposit-current-balance');
    if (depBal) depBal.textContent = Math.floor(balance);

    const navBal = document.getElementById('nav-global-balance');
    if (navBal) {
        navBal.style.animation = 'none';
        void navBal.offsetWidth;
        navBal.style.animation = 'winPulse 0.5s ease';
    }
    closeDepositModal();
}

document.addEventListener('DOMContentLoaded', () => {
    updateGlobalBalance();
    renderBetHistory();
    updateLossCalculator();
    updateStats();

    // Enter на поле депозита → подтверждает депозит
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const active = document.activeElement;
        if (!active || active.tagName !== 'INPUT' || active.type !== 'number') return;

        e.preventDefault();

        // Депозит
        if (active.id === 'deposit-amount') {
            submitDeposit();
            return;
        }

        // Ставки на футбол
        if (active.id === 'betting-amount' || active.id === 'betting-sim-iters') {
            const btn = document.getElementById('betting-sim-btn');
            if (btn && !btn.disabled) btn.click();
            return;
        }

        // Ставки в играх — находим ближайшую кнопку «Играть / Вращать»
        const gameArea = active.closest('#gameArea') || active.closest('.section');
        if (gameArea) {
            const playBtn = gameArea.querySelector('.btn-play');
            if (playBtn) playBtn.click();
        }
    });
});

const gameDetailsData = {
    roulette: {
        title: "Европейская рулетка",
        rules: `
            <ul style="color: #ecf0f1; font-size: 1.05rem;">
                <li><strong>Цель:</strong> Угадать, в какую из 37 ячеек (0-36) упадет шарик.</li>
                <li><strong>Ставки:</strong> Можно ставить на число, цвет (красное/черное), четное/нечетное, зеро, дюжина</li>
                <li><strong>Зеро (0):</strong> При выпадении 0 все ставки на простые шансы (цвет, четное/нечетное) проигрывают.</li>
                <li><strong>Выплаты:</strong>
                    <ul style="margin-top:0.5rem; color:#bdc3c7;">
                        <li>1 число: 35 к 1</li>
                        <li>Красное/Черное: 1 к 1</li>
                        <li>Четное/Нечетное: 1 к 1</li>
                        <li>Дюжина: 2 к 1</li>
                    </ul>
                </li>
            </ul>
        `,
        description: "Европейская рулетка — одна из самых популярных игр казино. В отличие от американской версии, здесь всего один сектор «зеро», что делает игру более выгодной для игрока (преимущество казино всего 2.7%).",
        theory: `
            <p><strong>Математическое ожидание и Распределение:</strong></p>
            <p style="margin-bottom: 1rem; font-size: 0.9rem;">В рулетке действует равномерное дискретное распределение (каждое число имеет выроятность 1/37).</p>
            <div class="beautiful-formula">
                <div class="formula-title">Формула Математического Ожидания E(X)</div>
                <div class="formula-content">E(X) = (P<sub>выигрыш</sub> &times; Выплата) - (P<sub>проигрыш</sub> &times; Ставка)</div>
            </div>
            <p style="margin-top: 1rem;">Для ставки $1 на красное / черное / четное / нечетное:</p>
            <div class="beautiful-formula">
                <div class="formula-content">E(X) = (18/37 &times; 1) - (19/37 &times; 1) = -1/37 &approx; <span style="color:#e74c3c;">-0.027 (-2.7%)</span></div>
            </div>
            <p style="margin-top: 1rem; font-size: 0.95rem; color:#bdc3c7;">На каждый поставленный $1 игрок теряет в среднем $0.027. Казино не обманывает, оно просто имеет статистическое преимущество на длинной дистанции (Закон больших чисел).</p>
        `,
        history: "Рулетка была изобретена французским математиком Блезом Паскалем в 17 веке в попытке создать вечный двигатель. Название происходит от французского 'roulette' — маленькое колесо. Европейская версия с одним зеро была представлена братьями Блан в 1843 году в Бад-Хомбурге.",
        howItWorks: `
            <div class="beautiful-formula">
                <div class="formula-title">🔧 Алгоритм игры (шаг за шагом)</div>
                <div class="formula-content">1. Вы делаете ставку на цвет (красное/чёрное), чётное/нечётное, зеро или дюжину.</div>
                <div class="formula-content">2. Генератор случайных чисел (Math.random()) выбирает целое число от 0 до 36 с равной вероятностью P = 1/37 для каждого числа.</div>
                <div class="formula-content">3. Число проверяется по таблице: красное ли оно, чёрное, или зеро (0). Красные: 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36.</div>
                <div class="formula-content">4. Если ваш выбор совпал — баланс увеличивается на ставку × коэффициент выплаты.</div>
                <div class="formula-content">5. Если выпало зеро (0) — проигрывают ВСЕ ставки на цвет и чёт/нечёт. Это даёт казино преимущество.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 1: Равномерное дискретное распределение</div>
                <div class="formula-content"><strong>Что это:</strong> Каждое из 37 чисел (0–36) выпадает с одинаковой вероятностью P(X = k) = 1/37 ≈ 2.70%. Это называется «равномерное дискретное распределение» — все исходы равновероятны.</div>
                <div class="formula-content"><strong>Как применяется в игре:</strong> При каждом вращении система вызывает Math.floor(Math.random() * 37), что генерирует случайное целое число от 0 до 36. Каждое число появляется с вероятностью ровно 1/37.</div>
                <div class="formula-content"><strong>Почему не 50/50:</strong> На колесе 18 красных + 18 чёрных + 1 зеро = 37 чисел. Зеро (0) не относится ни к красному, ни к чёрному, ни к чётному, ни к нечётному. Поэтому P(красное) = 18/37 ≈ 48.65%, а не 50%. Именно этот 1 сектор создаёт преимущество казино.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 2: Математическое ожидание E(X)</div>
                <div class="formula-content"><strong>Определение:</strong> E(X) = Σ [P(исход) × Выплата(исход)] — средний результат на бесконечном числе ставок.</div>
                <div class="formula-content"><strong>Для ставки $1 на красное:</strong> E(X) = (18/37 × $1) − (19/37 × $1) = $0.4865 − $0.5135 = <span style="color:#e74c3c;">−$0.027</span></div>
                <div class="formula-content"><strong>Что это значит:</strong> На каждый поставленный $1 игрок в среднем теряет 2.7 цента. За 1000 ставок по $1 средний проигрыш = $27. Казино не обманывает — оно зарабатывает на математике.</div>
                <div class="formula-content"><strong>Для ставки на число:</strong> E(X) = (1/37 × $35) − (36/37 × $1) = $0.946 − $0.973 = <span style="color:#e74c3c;">−$0.027</span>. Тот же самый House Edge 2.7% — независимо от типа ставки!</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 3: Закон больших чисел (ЗБЧ)</div>
                <div class="formula-content"><strong>Что это:</strong> Теорема Бернулли — при увеличении числа испытаний n → ∞, частота события P̂ сходится к истинной вероятности P.</div>
                <div class="formula-content"><strong>Как работает:</strong> После 10 вращений красное может выпасть 7 из 10 раз (70%). Но после 10 000 вращений частота красного будет около 48.6% ± 0.5%. Чем больше игр — тем точнее статистика приближается к теории.</div>
                <div class="formula-content"><strong>Когда работает:</strong> Всегда. На КАЖДОМ вращении. ЗБЧ не «включается» — он описывает постепенное схождение. На коротких дистанциях возможны крупные отклонения (дисперсия), но на длинных — казино всегда в плюсе.</div>
                <div class="formula-content"><strong>Практический пример:</strong> 1000 ставок по $10 на красное: общий оборот $10 000, ожидаемый проигрыш = 10 000 × 0.027 = <span style="color:#e74c3c;">$270</span>.</div>
            </div>
        `
    },
    slots: {
        title: "Слот-машина",
        rules: `
            <ul style="color: #ecf0f1; font-size: 1.05rem;">
                <li><strong>Цель:</strong> Собрать выигрышную комбинацию символов на линии выплат.</li>
                <li><strong>Механика:</strong> Игрок делает ставку и вращает барабаны. Результат определяется ГСЧ (Генератором Случайных Чисел).</li>
                <li><strong>В нашей версии:</strong> Победа (джекпот) достигается при выпадении трех одинаковых символов.</li>
                <li><strong>Выплата:</strong> 10 к 1.</li>
            </ul>
        `,
        description: "Классический 'однорукий бандит'. Слоты — самая популярная игра в казино, приносящая заведениям более 70% дохода. Современные слоты — это сложные компьютерные программы.",
        theory: `
            <p><strong>Вероятность джекпота (3 одинаковых) и Преимущество казино:</strong></p>
            <div class="beautiful-formula">
                <div class="formula-title">Формула комбинаторики</div>
                <div class="formula-content">Всего символов: 7. Барабанов: 3. Всего комбинаций = 7<sup>3</sup> = 343</div>
                <div class="formula-content">Выигрышных комбинаций (X-X-X): 7</div>
                <div class="formula-content">P(Win) = 7 / 343 = 1/49 &approx; <span style="color:#2ecc71;">2.04%</span></div>
            </div>
            <br>
            <div class="beautiful-formula">
                <div class="formula-title">Преимущество казино (House Edge)</div>
                <div class="formula-content">House Edge = 1 - (P(Win) &times; Payout)</div>
                <div class="formula-content">House Edge = 1 - (0.0204 &times; 10) &approx; <span style="color:#e74c3c;">79.6%</span></div>
            </div>
            <p style="margin-top: 1rem; font-size: 0.95rem; color:#bdc3c7;">Слоты используют математику геометрического распределения ожиданий: чтобы выиграть один раз с вероятностью ~2%, вам в среднем потребуется 49 вращений (много попыток), однако выплата 10:1 не покрывает затраты на 49 попыток.</p>
        `,
        history: "Первый слот 'Liberty Bell' был создан Чарльзом Феем в 1895 году. Он имел три барабана и автоматическую систему выплат. В 1963 году Bally разработала первый полностью электромеханический слот 'Money Honey'.",
        howItWorks: `
            <div class="beautiful-formula">
                <div class="formula-title">🔧 Алгоритм игры (шаг за шагом)</div>
                <div class="formula-content">1. Вы делаете ставку и нажимаете «Вращать барабаны».</div>
                <div class="formula-content">2. Система генерирует случайное число (Math.random()). Если оно < 7/343 ≈ 0.0204 — это ДЖЕКПОТ.</div>
                <div class="formula-content">3. При джекпоте: выбирается случайный символ из 7, и все 3 барабана показывают его (например, 💎💎💎).</div>
                <div class="formula-content">4. При проигрыше: генерируются 3 случайных символа. Если все совпали — перегенерация (чтобы не показать ложный джекпот).</div>
                <div class="formula-content">5. Джекпот платит ×10 от ставки — ставка $50 → выигрыш $500. Проигрыш = полная потеря ставки.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 1: Комбинаторика (подсчёт комбинаций)</div>
                <div class="formula-content"><strong>Что это:</strong> Раздел математики, считающий количество возможных комбинаций. Для слотов: каждый из 3 барабанов может показать 1 из 7 символов.</div>
                <div class="formula-content"><strong>Формула:</strong> Всего комбинаций = n^k = 7³ = 7 × 7 × 7 = 343 (где n = число символов, k = число барабанов).</div>
                <div class="formula-content"><strong>Выигрышные комбинации:</strong> Только когда ВСЕ 3 барабана совпадают: 🍒🍒🍒, 🍓🍓🍓, 🍇🍇🍇, 🎁🎁🎁, ⭐⭐⭐, 💎💎💎, 👑👑👑 — итого 7 комбинаций.</div>
                <div class="formula-content"><strong>P(Джекпот):</strong> 7 / 343 = 1/49 ≈ <span style="color:#2ecc71;">2.04%</span>. Это значит: в среднем 1 выигрыш на каждые 49 вращений.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 2: Геометрическое распределение</div>
                <div class="formula-content"><strong>Что это:</strong> Распределение, описывающее «сколько попыток нужно до первого успеха». Если P(успеха) = p, то среднее число попыток = 1/p.</div>
                <div class="formula-content"><strong>В игре:</strong> Среднее число вращений до первого джекпота = 1 / (1/49) = 49 вращений. За 49 вращений по $1 вы потратите $49.</div>
                <div class="formula-content"><strong>Но выплата:</strong> Джекпот = ×10. Т.е. выиграете $10, потратив $49. Чистый убыток = $39 на каждый цикл из 49 вращений.</div>
                <div class="formula-content"><strong>P(k попыток до победы):</strong> P(X = k) = (1 − p)^(k−1) × p. P(победить за 1 вращение) = 2.04%. P(не выиграть за 50 вращений) = (48/49)^50 ≈ 36%.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 3: House Edge (Преимущество казино)</div>
                <div class="formula-content"><strong>Формула:</strong> HE = 1 − (P(Win) × Payout) = 1 − (1/49 × 10) = 1 − 0.204 = <span style="color:#e74c3c;">79.6%</span></div>
                <div class="formula-content"><strong>Что это значит:</strong> Из каждых $100 поставленных в слоты, казино забирает в среднем $79.60. Это САМОЕ высокое преимущество среди всех игр на сайте.</div>
                <div class="formula-content"><strong>Почему слоты так популярны:</strong> Несмотря на ужасную математику, слоты привлекают яркими эффектами и надеждой на джекпот (×10). Но математика беспощадна — на дистанции вы теряете ~80% вложений.</div>
                <div class="formula-content"><strong>Когда работает:</strong> Каждое вращение — независимое событие. Предыдущие результаты НЕ влияют на следующие. Если вы проиграли 48 раз подряд, шанс следующего джекпота всё ещё 2.04%, а не больше.</div>
            </div>
        `
    },
    wheel: {
        title: "Колесо фортуны",
        rules: `
            <ul style="color: #ecf0f1; font-size: 1.05rem;">
                <li><strong>Цель:</strong> Угадать выигрышный сектор.</li>
                <li><strong>Механика:</strong> Ставка на один из 4 секторов (Классическое разделение).</li>
                <li><strong>Выплата:</strong> 4 к 1.</li>
            </ul>
        `,
        description: "Простая и зрелищная игра, часто используемая в телешоу и на ярмарках. В казино известна как 'Big Six Wheel'.",
        theory: `
            <p><strong>Биномиальное распределение:</strong></p>
            <p style="margin-bottom: 1rem; font-size: 0.9rem;">В нашей упрощенной версии (4 сектора) это эквивалентно бросанию кубика с 4 гранями.</p>
            <div class="beautiful-formula">
                <div class="formula-title">Вероятность и матожидание</div>
                <div class="formula-content">P(Win) = 1/4 = 25%</div>
                <div class="formula-content">Выплата (Payout) = 3 к 1 (т.е. +3 за победу, -1 за проигрыш)</div>
                <div class="formula-content">E(X) = (0.25 &times; 3) - (0.75 &times; 1) = 0</div>
            </div>
            <p style="margin-top: 1rem; font-size: 0.95rem; color:#bdc3c7;">В данной реализации это 'честная' игра с нулевым преимуществом казино. В реальном казино сектора распределены неравномерно (например, 24 шанса на $1 и только 1 шанс на Joker $50), создавая преимущество до 24%!</p>
        `,
        history: "Происхождение уходит корнями в древние колесницы и колеса, использовавшиеся для жребия. Современный вид игра приобрела в американских казино в конце 19 века.",
        howItWorks: `
            <div class="beautiful-formula">
                <div class="formula-title">🔧 Алгоритм игры (шаг за шагом)</div>
                <div class="formula-content">1. Вы делаете ставку и выбираете один из 4 секторов (🍀 Клевер, ⭐ Звезда, 💎 Алмаз, ❤️ Сердце).</div>
                <div class="formula-content">2. Система вызывает Math.random() и проверяет: если число < 0.25 — вы выиграли (ваш сектор совпал).</div>
                <div class="formula-content">3. При выигрыше: на колесе отображается ваш символ. При проигрыше: отображается случайный ДРУГОЙ символ.</div>
                <div class="formula-content">4. Выигрыш = ставка × 4 (включая возврат ставки). Проигрыш = полная потеря ставки.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 1: Классическая вероятность Лапласа</div>
                <div class="formula-content"><strong>Определение:</strong> P(события) = число благоприятных исходов / общее число равновероятных исходов.</div>
                <div class="formula-content"><strong>В игре:</strong> P(угадать сектор) = 1 благоприятный / 4 возможных = 1/4 = 25%. Каждый сектор занимает ровно 1/4 площади колеса.</div>
                <div class="formula-content"><strong>Почему это честно:</strong> Все 4 сектора равны по размеру и вероятности. В реальном казино Big Six Wheel сектора НЕРАВНЫЕ — например, 24 позиции для $1 и 1 для Joker $50, создавая House Edge до 24%.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 2: Математическое ожидание</div>
                <div class="formula-content"><strong>Формула:</strong> E(X) = P(win) × Чистая_прибыль − P(lose) × Ставка</div>
                <div class="formula-content"><strong>Расчёт:</strong> E(X) = (1/4 × $3) − (3/4 × $1) = $0.75 − $0.75 = <span style="color:#2ecc71;">$0 (честная игра)</span></div>
                <div class="formula-content"><strong>Что это значит:</strong> На длинной дистанции ваш баланс не должен ни расти, ни падать. Это «справедливая» игра с нулевым преимуществом казино (House Edge = 0%).</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 3: Биномиальное распределение</div>
                <div class="formula-content"><strong>Что это:</strong> Описывает вероятность получить ровно k успехов из n независимых попыток, каждая с вероятностью p.</div>
                <div class="formula-content"><strong>Формула:</strong> P(X = k) = C(n, k) × p^k × (1 − p)^(n − k), где C(n, k) = n! / (k! × (n − k)!)</div>
                <div class="formula-content"><strong>Пример:</strong> Вероятность угадать 3 раза из 10: P = C(10,3) × 0.25³ × 0.75⁷ = 120 × 0.0156 × 0.1335 ≈ <span style="color:#f1c40f;">25.0%</span></div>
                <div class="formula-content"><strong>Когда работает:</strong> При КАЖДОМ вращении. Каждая игра — независимое испытание Бернулли (p = 0.25). Биномиальное распределение позволяет предсказать вероятность любой серии (например, «выиграть 5 из 20 игр»).</div>
            </div>
        `
    },
    dice: {
        title: "Крэпс",
        rules: `
            <ul style="color: #ecf0f1; font-size: 1.05rem;">
                <li><strong>Цель:</strong> Угадать исход броска двух кубиков.</li>
                <li><strong>Ставки:</strong> Четное или Нечетное.</li>
                <li><strong>Механика:</strong> Бросаются два шестигранных кубика, сумма чисел определяет результат.</li>
                <li><strong>Выплата:</strong> 2 к 1. (Прибыль 1 к 1)</li>
            </ul>
        `,
        description: "Крэпс — одна из самых динамичных и шумных игр в казино. Исторически кости использовались для предсказания будущего и азартных игр тысячи лет.",
        theory: `
            <p><strong>Треугольное распределение суммы двух кубиков:</strong></p>
            <p style="margin-bottom: 1rem; font-size: 0.9rem;">При броске 2 кубиков сумма всегда распределена неравномерно, образуя треугольник (пик вероятности на 7).</p>
            <div class="beautiful-formula">
                <div class="formula-title">Формула вероятности чет/нечет</div>
                <div class="formula-content">Всего исходов: 6 &times; 6 = 36</div>
                <div class="formula-content">P(Четное) = 18/36 = <span style="color:#f39c12;">50%</span></div>
                <div class="formula-content">P(Нечетное) = 18/36 = <span style="color:#f39c12;">50%</span></div>
            </div>
            <p style="margin-top: 1rem; font-size: 0.95rem; color:#bdc3c7;">Однако, в реальном Крэпсе ставки сложнее (Pass Line, Don't Pass), и казино внедряет свои правила (например, при выпадении 12 ставка Don't Pass - возврат вместо выигрыша), что рождает <span style="color:#e74c3c;">House Edge 1.36%</span>.</p>
        `,
        history: "Игра развилась из древней английской игры Hazard. В Новый Орлеан ее привез Бернар де Мариньи в начале 19 века, где она упростилась и получила название 'Crapaud' (жаба), позже превратившееся в Craps.",
        howItWorks: `
            <div class="beautiful-formula">
                <div class="formula-title">🔧 Алгоритм игры (шаг за шагом)</div>
                <div class="formula-content">1. Вы выбираете ставку: «Меньше 7» / «Больше 7» / «Ровно 7».</div>
                <div class="formula-content">2. Система определяет результат через чистую вероятность: генерируется Math.random() и сравнивается с P(< 7) = 15/36, P(> 7) = 15/36, P(= 7) = 6/36.</div>
                <div class="formula-content">3. После определения win/lose генерируется подходящая сумма, затем подбирается пара кубиков, дающая эту сумму.</div>
                <div class="formula-content">4. Анимация показывает серию случайных бросков, а затем — финальный результат.</div>
                <div class="formula-content">5. Выплата: «Больше/Меньше 7» → ×2.4 | «Ровно 7» → ×5.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 1: Свёртка дискретных распределений</div>
                <div class="formula-content"><strong>Что это:</strong> Когда складываются две независимые случайные величины (два кубика), результирующее распределение — это свёртка исходных. Каждый кубик: P(1) = P(2) = ... = P(6) = 1/6.</div>
                <div class="formula-content"><strong>В игре:</strong> Два кубика (6 граней каждый) создают 6 × 6 = 36 равновероятных пар. Сумма пары — от 2 до 12.</div>
                <div class="formula-content"><strong>Треугольное распределение:</strong> Число 7 имеет 6 комбинаций: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). Число 2 — всего 1: (1,1). Число 12 — тоже 1: (6,6). Это создаёт «треугольник» с пиком на 7.</div>
                <div class="formula-content"><strong>Полная таблица:</strong> Сумма 2: 1/36 | 3: 2/36 | 4: 3/36 | 5: 4/36 | 6: 5/36 | 7: 6/36 | 8: 5/36 | 9: 4/36 | 10: 3/36 | 11: 2/36 | 12: 1/36.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 2: Матожидание для каждого типа ставки</div>
                <div class="formula-content"><strong>Ставка «Меньше 7»:</strong> P = 15/36, Payout = ×2.4. E = (15/36 × $1.40) − (21/36 × $1) = $0.583 − $0.583 = <span style="color:#2ecc71;">$0</span> — справедливая ставка.</div>
                <div class="formula-content"><strong>Ставка «Больше 7»:</strong> P = 15/36, Payout = ×2.4. Идентичная математика → E = <span style="color:#2ecc71;">$0</span> — справедливая ставка.</div>
                <div class="formula-content"><strong>Ставка «Ровно 7»:</strong> P = 6/36 = 1/6, Payout = ×5. E = (1/6 × $4) − (5/6 × $1) = $0.667 − $0.833 = <span style="color:#e74c3c;">−$0.167</span> — НЕвыгодная ставка! House Edge ≈ 16.7%.</div>
                <div class="formula-content"><strong>Вывод:</strong> Ставки «Больше/Меньше» — честные (EV=0). Ставка «Ровно 7» — ловушка с преимуществом казино 16.7%!</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 3: Закон больших чисел</div>
                <div class="formula-content"><strong>Когда работает:</strong> Свёртка применяется при КАЖДОМ броске двух кубиков. Каждый бросок — независимый эксперимент. Предыдущие броски НЕ влияют на следующие.</div>
                <div class="formula-content"><strong>Практический пример:</strong> 100 ставок по $10 на «Ровно 7»: ожидаемый проигрыш = 100 × $10 × 0.167 = <span style="color:#e74c3c;">$167</span>.</div>
                <div class="formula-content"><strong>100 ставок по $10 на «Меньше 7»:</strong> ожидаемый результат = $0 (плюс-минус дисперсия). На длинной дистанции — нулевой эффект.</div>
            </div>
        `
    },
    coin: {
        title: "Орел и решка",
        rules: `
            <ul style="color: #ecf0f1; font-size: 1.05rem;">
                <li><strong>Цель:</strong> Угадать сторону монеты.</li>
                <li><strong>Шансы:</strong> Классические 50/50.</li>
                <li><strong>Выплата:</strong> Гарантирует прибыль 1 к 1.</li>
            </ul>
        `,
        description: "Самая древняя и простая азартная игра. Используется нами для демонстрации базовых принципов вероятности.",
        theory: `
            <p><strong>Независимые события (Схема Бернулли):</strong></p>
            <p style="margin-bottom: 1rem; font-size: 0.9rem;">Каждый бросок абсолютно не зависит от предыдущего. Монета не имеет памяти.</p>
            <div class="beautiful-formula">
                <div class="formula-title">Формула вероятности серий (Теорема умножения)</div>
                <div class="formula-content">P(Успех) = 0.5</div>
                <div class="formula-content">P(n успехов подряд) = (0.5)<sup>n</sup></div>
                <div class="formula-content">P(О-О-О-О-О) = 0.5<sup>5</sup> = 1/32 &approx; <span style="color:#f39c12;">3.1%</span></div>
            </div>
            <p style="margin-top: 1rem; font-size: 0.95rem; color:#bdc3c7;">Ошибочное мнение, что после серии из 5 Орлов шанс выпадения Решки выше, называется <strong>«Ошибкой игрока» (Gambler's Fallacy)</strong>.</p>
        `,
        history: "Игра известна с времен Древнего Рима ('Navia aut caput' - Корабль или Голова). Встречается во всех культурах мира.",
        howItWorks: `
            <div class="beautiful-formula">
                <div class="formula-title">🔧 Алгоритм игры (шаг за шагом)</div>
                <div class="formula-content">1. Вы выбираете Орел (🟡) или Решку (🟠) и делаете ставку.</div>
                <div class="formula-content">2. Генератор вызывает Math.random(). Если число < 0.5 — Орёл, ≥ 0.5 — Решка. Ровно 50/50.</div>
                <div class="formula-content">3. Если угадали — баланс увеличивается на ставку ×2 (возврат ставки + чистая прибыль). Если нет — ставка потеряна.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 1: Схема Бернулли</div>
                <div class="formula-content"><strong>Что это:</strong> Последовательность n независимых экспериментов, каждый с двумя исходами (успех p = 0.5, неудача q = 0.5). Названа в честь Якоба Бернулли (1713).</div>
                <div class="formula-content"><strong>В игре:</strong> Каждый бросок монеты — это один эксперимент Бернулли. Результат не зависит от предыдущих бросков. Монета не имеет «памяти».</div>
                <div class="formula-content"><strong>Матожидание:</strong> E(X) = P(win) × $1 − P(lose) × $1 = 0.5 × $1 − 0.5 × $1 = <span style="color:#2ecc71;">$0</span>. Абсолютно честная игра. House Edge = 0%.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 2: Теорема умножения (Серии)</div>
                <div class="formula-content"><strong>Формула:</strong> P(n одинаковых подряд) = p^n = (1/2)^n. Это следствие независимости — вероятности перемножаются.</div>
                <div class="formula-content"><strong>Примеры:</strong> P(3 орла подряд) = (1/2)³ = 1/8 = 12.5%. P(5 подряд) = 1/32 = 3.1%. P(10 подряд) = 1/1024 ≈ 0.098%. P(20 подряд) = 1/1 048 576 ≈ 0.0001%.</div>
                <div class="formula-content"><strong>Когда работает:</strong> Формула работает ПЕРЕД началом серии. Если вы УЖЕ бросили 9 орлов, шанс 10-го орла = 50%, а не 0.098%. Это ключевое различие!</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 3: Ошибка игрока (Gambler's Fallacy)</div>
                <div class="formula-content"><strong>Заблуждение:</strong> «Выпало 10 орлов подряд — значит СЕЙЧАС точно будет решка!» Это ЛОЖЬ. P(решка после 10 орлов) = всё ещё <span style="color:#f1c40f;">50%</span>.</div>
                <div class="formula-content"><strong>Почему люди ошибаются:</strong> Мозг путает P(серия из 11 орлов С НУЛЯ) = 0.049% и P(ещё 1 орёл ПОСЛЕ 10) = 50%. Первое — маловероятно, второе — обычный бросок.</div>
                <div class="formula-content"><strong>В казино:</strong> Именно эта ошибка заставляет игроков увеличивать ставки после серии проигрышей (стратегия Мартингейла), что приводит к катастрофическим потерям.</div>
                <div class="formula-content"><strong>Когда работает:</strong> Всегда. При КАЖДОМ отдельном броске. Это фундамент всей теории вероятностей — опыт Бернулли.</div>
            </div>
        `
    },
    blackjack: {
        title: "Блэкджек",
        rules: `
            <ul style="color: #ecf0f1; font-size: 1.05rem;">
                <li><strong>Цель:</strong> Набрать очков больше, чем у дилера, но не более 21.</li>
                <li><strong>Значения карт:</strong> 2-10 - номинал, Картинки - 10, Туз - 1 или 11.</li>
                <li><strong>Блэкджек:</strong> Туз + 10 (или картинка) с первых двух карт. Выплата 3:2.</li>
                <li><strong>В симуляторе:</strong> Упрощенная механика с автоматическим дилером, без удвоений и сплитов. Но вероятности реальны.</li>
            </ul>
        `,
        description: "Самая интеллектуальная игра в казино, где навыки игрока реально влияют на результат. При использовании 'базовой стратегии' преимущество казино минимально.",
        theory: `
            <p><strong>Зависимые события и Условная вероятность:</strong></p>
            <p style="margin-bottom: 1rem; font-size: 0.9rem;">В отличие от рулетки, карты не возвращаются в колоду сразу (если не используется бесконечный шуз), поэтому вероятности меняются. Это называется условной вероятностью <em>P(A|B)</em>.</p>
            <div class="beautiful-formula">
                <div class="formula-title">Вероятность Блэкджека (с первой раздачи)</div>
                <div class="formula-content">P(Туз из колоды) = 4/52</div>
                <div class="formula-content">P(Десятка из оставшихся) = 16/51</div>
                <div class="formula-content">P(Блэкджек) = 2 &times; (4/52 &times; 16/51) &approx; <span style="color:#2ecc71;">4.8%</span></div>
            </div>
            <p style="margin-top: 1rem; font-size: 0.95rem; color:#bdc3c7;">Математически доказано, что правильная («Базовая») стратегия минимизирует математическое ожидание потерь до сверхмалых 0.5% (House Edge). А подсчет карт по системе Hi-Lo позволяет перевесить матожидание в сторону игрока на +1%.</p>
        `,
        history: "Происходит от французской игры 'Vingt-et-Un' (21), популярной в 17 веке. Название 'Blackjack' появилось в США, когда казино предлагали бонусную выплату за Туза пик и Валета пик (Black Jack).",
        howItWorks: `
            <div class="beautiful-formula">
                <div class="formula-title">🔧 Алгоритм игры (шаг за шагом)</div>
                <div class="formula-content">1. Вы делаете ставку и нажимаете «Раздать карты».</div>
                <div class="formula-content">2. Колода из 52 карт перемешивается (массив сортируется случайно). Вам и дилеру раздаётся по 2 карты.</div>
                <div class="formula-content">3. Вы видите свои карты и одну карту дилера. Решаете: «Взять» (Hit) или «Хватит» (Stand).</div>
                <div class="formula-content">4. Если сумма ваших карт > 21 — перебор (bust), мгновенный проигрыш.</div>
                <div class="formula-content">5. Дилер открывает карты и обязан брать карты до суммы ≥17 (жёстко фиксированный алгоритм, без выбора).</div>
                <div class="formula-content">6. Сравниваем суммы: выше без перебора = победа. Одинаково = ничья (возврат ставки). Блэкджек (21 с двух карт) платит ×2.5.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 1: Условная вероятность P(A|B)</div>
                <div class="formula-content"><strong>Определение:</strong> P(A|B) = P(A ∩ B) / P(B) — вероятность события A при условии, что событие B уже произошло.</div>
                <div class="formula-content"><strong>В игре:</strong> Карты вытаскиваются БЕЗ возврата. После каждой карты вероятности МЕНЯЮТСЯ. Если первая карта — Туз (P = 4/52), то P(десятки следующей) = 16/51 (а не 16/52!), потому что колода уменьшилась на 1 карту.</div>
                <div class="formula-content"><strong>P(Блэкджек):</strong> Туз первым: 4/52. Затем десятка: 16/51. ИЛИ десятка первой, затем Туз. Итого: 2 × (4/52 × 16/51) = 128/2652 ≈ <span style="color:#2ecc71;">4.83%</span>.</div>
                <div class="formula-content"><strong>Отличие от рулетки:</strong> В рулетке каждое вращение — НЕЗАВИСИМОЕ событие. В блэкджеке — ЗАВИСИМОЕ. Это единственная игра, где память о прошлом математически полезна.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 2: Формула Байеса</div>
                <div class="formula-content"><strong>Формула:</strong> P(A|B) = P(B|A) × P(A) / P(B) — позволяет «обновлять» вероятности по мере получения новой информации.</div>
                <div class="formula-content"><strong>Как применяется:</strong> После каждой вытащенной карты формула Байеса пересчитывает вероятности оставшихся карт. Например, если из колоды вышли 3 десятки, P(следующая — десятка) = 13/49 вместо 16/52.</div>
                <div class="formula-content"><strong>Когда работает:</strong> После КАЖДОЙ вытянутой карты. Это непрерывный процесс обновления знаний — фундамент подсчёта карт.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 3: Базовая стратегия + House Edge</div>
                <div class="formula-content"><strong>Базовая стратегия:</strong> Таблица оптимальных решений (Hit/Stand/Double/Split) для каждой комбинации «ваши карты + открытая карта дилера». Рассчитана компьютером через миллионы симуляций.</div>
                <div class="formula-content"><strong>House Edge:</strong> Без стратегии = 2–5%. С базовой стратегией = <span style="color:#e74c3c;">0.5%</span> — самое НИЗКОЕ преимущество казино из ВСЕХ игр! На каждый $1 вы теряете лишь 0.5 цента.</div>
                <div class="formula-content"><strong>Подсчёт карт (Hi-Lo):</strong> Низкие карты (2-6) = +1, средние (7-9) = 0, высокие (10-A) = −1. Высокий «running count» = много десяток в колоде = выгодно для игрока (больше блэкджеков).</div>
                <div class="formula-content"><strong>Когда работает:</strong> Условная вероятность применяется после КАЖДОЙ карты. Блэкджек — единственная игра казино, где преимущество можно математически перевернуть в пользу игрока (+1% с подсчётом карт).</div>
            </div>
        `
    },
    rps: {
        title: "Камень, Ножницы, Бумага",
        rules: `
            <ul style="color: #ecf0f1; font-size: 1.05rem;">
                <li><strong>Цель:</strong> Победить компьютер в классической игре.</li>
                <li><strong>Правила:</strong>
                    <ul style="margin-top:0.5rem; color:#bdc3c7;">
                        <li>Камень бьет Ножницы</li>
                        <li>Ножницы бьют Бумагу</li>
                        <li>Бумага бьет Камень</li>
                    </ul>
                </li>
                <li><strong>Выплата:</strong> 2 к 1 при победе. При ничьей ставка возвращается.</li>
            </ul>
        `,
        description: "Древняя игра руками, известная во многих культурах. Часто используется как способ жеребьевки.",
        theory: `
            <p><strong>Равновероятные исходы и Теория Игр:</strong></p>
            <p style="margin-bottom: 1rem; font-size: 0.9rem;">Если выбор противника (бота) абсолютно случаен (вероятность 1/3 для каждого варианта), матожидание равно 0.</p>
            <div class="beautiful-formula">
                <div class="formula-title">Матрица равновесий</div>
                <div class="formula-content">P(Победа) = 33.3%, P(Ничья) = 33.3%, P(Поражение) = 33.3%</div>
                <div class="formula-content">Равновесие Нэша: Оптимальная (смешанная) стратегия &mdash; выбирать каждый вариант с вероятностью ровно 1/3.</div>
            </div>
            <p style="margin-top: 1rem; font-size: 0.95rem; color:#bdc3c7;">Любое отклонение игроком от вероятности 1/3 для одного из вариантов позволяет оппоненту подстроиться и получить математическое преимущество. Это классический пример равновесия Нэша в игре с нулевой суммой.</p>
        `,
        history: "Игра возникла в Китае во времена династии Хань (206 г. до н.э. — 220 г. н.э.). В Европу попала только в 20 веке.",
        howItWorks: `
            <div class="beautiful-formula">
                <div class="formula-title">🔧 Алгоритм игры (шаг за шагом)</div>
                <div class="formula-content">1. Вы выбираете 🗿 Камень, ✂️ Ножницы или 📄 Бумагу и делаете ставку.</div>
                <div class="formula-content">2. Бот генерирует Math.floor(Math.random() * 3): 0 = Камень, 1 = Ножницы, 2 = Бумага. Каждый вариант с P = 1/3.</div>
                <div class="formula-content">3. Сравниваются выборы по циклическому правилу: Камень → Ножницы → Бумага → Камень. Совпадение = ничья.</div>
                <div class="formula-content">4. Победа → ставка ×2 (чистая прибыль = ставка). Ничья → возврат ставки. Поражение → потеря ставки.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 1: Классическая вероятность (3 равных исхода)</div>
                <div class="formula-content"><strong>Что это:</strong> При честной случайной генерации каждый из 3 вариантов бота равновероятен. P(Камень) = P(Ножницы) = P(Бумага) = 1/3 ≈ 33.33%.</div>
                <div class="formula-content"><strong>Исходы:</strong> 9 возможных комбинаций (3 ваших × 3 бота). Из них 3 победных + 3 ничейных + 3 проигрышных. Поэтому P(win) = P(draw) = P(lose) = 3/9 = 1/3.</div>
                <div class="formula-content"><strong>Матожидание:</strong> E(X) = (1/3 × $1) + (1/3 × $0) − (1/3 × $1) = $0.333 + $0 − $0.333 = <span style="color:#2ecc71;">$0 (честная игра)</span>. House Edge = 0%.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 2: Равновесие Нэша (Теория Игр)</div>
                <div class="formula-content"><strong>Что это:</strong> Концепция Джона Нэша (нобелевская премия 1994). Равновесие — это набор стратегий, при котором ни один игрок не может улучшить свой результат, изменив только СВОЮ стратегию.</div>
                <div class="formula-content"><strong>В КНБ:</strong> Оптимальная «смешанная стратегия» — выбирать каждый вариант ровно с P = 1/3. Любое отклонение (например, Камень в 50% случаев) создаёт уязвимость: противник может использовать Бумагу чаще и выигрывать.</div>
                <div class="formula-content"><strong>Игра с нулевой суммой:</strong> Выигрыш одного = проигрыш другого. Сумма всех выигрышей и проигрышей = 0. Это фундаментальная модель конкурентных ситуаций — от покера до рыночного ценообразования.</div>
            </div>
            <div class="beautiful-formula" style="margin-top:1rem;">
                <div class="formula-title">📐 Формула 3: Психологические паттерны vs Математика</div>
                <div class="formula-content"><strong>Бот vs Человек:</strong> Наш бот играет ИДЕАЛЬНО по Нэшу (P = 1/3 для каждого варианта). Против такого бота невозможно выиграть на дистанции — никакая стратегия не даст преимущества.</div>
                <div class="formula-content"><strong>Человек vs Человек:</strong> Люди НЕ умеют генерировать случайные числа. Исследования показывают: мужчины чаще начинают с Камня (~38%), а после проигрыша — переключаются на то, что побило бы их предыдущий выбор.</div>
                <div class="formula-content"><strong>Почему паттерны опасны:</strong> Если вы играете Камень в 50% случаев, умный противник будет играть Бумагу в 100% случаев и выиграет ≈50% ставок (вместо 33%). Отклонение от 1/3 ВСЕГДА невыгодно!</div>
                <div class="formula-content"><strong>Когда работает:</strong> Равновесие Нэша работает при КАЖДОМ раунде. Оно описывает оптимальное поведение в ЛЮБОЙ конкурентной ситуации с несколькими стратегиями.</div>
            </div>
        `
    }
};

// ===== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК =====
function switchSection(sectionId, clickedElement) {
    const sections = document.querySelectorAll('.section');
    const buttons = document.querySelectorAll('.nav-btn');
    const targetSection = document.getElementById(sectionId);

    // Проверяем, что целевая секция существует
    if (!targetSection) {
        console.error('Секция не найдена:', sectionId);
        return;
    }

    // Если уже активна эта секция, ничего не делаем
    if (targetSection.classList.contains('active')) {
        return;
    }

    // Обновляем кнопки навигации
    buttons.forEach(btn => btn.classList.remove('active'));
    if (clickedElement) {
        clickedElement.classList.add('active');
    } else {
        // Находим кнопку по атрибуту onclick
        buttons.forEach(btn => {
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(sectionId)) {
                btn.classList.add('active');
            }
        });
    }

    // Получаем текущую активную секцию
    const activeSection = document.querySelector('.section.active');

    // Плавное переключение с анимацией
    if (activeSection && activeSection !== targetSection) {
        // Добавляем класс для анимации выхода
        activeSection.classList.add('section-exiting');

        // После завершения анимации выхода скрываем старую секцию и показываем новую
        setTimeout(() => {
            activeSection.classList.remove('active', 'section-exiting');
            activeSection.style.display = 'none';

            // Показываем новую секцию
            targetSection.style.display = 'block';
            targetSection.classList.add('active');

            // Запускаем анимацию появления
            requestAnimationFrame(() => {
                targetSection.classList.add('section-entering');
                setTimeout(() => {
                    targetSection.classList.remove('section-entering');
                }, 500);
            });
        }, 300);
    } else {
        // Если нет активной секции, просто показываем целевую
        sections.forEach(s => {
            s.classList.remove('active', 'section-exiting', 'section-entering');
            s.style.display = 'none';
        });

        targetSection.style.display = 'block';
        targetSection.classList.add('active');

        requestAnimationFrame(() => {
            targetSection.classList.add('section-entering');
            setTimeout(() => {
                targetSection.classList.remove('section-entering');
            }, 500);
        });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchHomeTab(tabId) {
    // Скрываем все подвкладки
    document.querySelectorAll('.home-subtab').forEach(el => el.classList.remove('active'));
    // Убираем активность с кнопок
    document.querySelectorAll('.home-tab-btn').forEach(btn => btn.classList.remove('active'));

    // Показываем нужную подвкладку
    const targetTab = document.getElementById(`home-sub-${tabId}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Активируем кнопку
    const buttons = document.querySelectorAll('.home-tab-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
        }
    });
}

function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    const toggleBtn = document.querySelector('.menu-toggle');
    if (navMenu) {
        navMenu.classList.toggle('active');
        if (toggleBtn) {
            toggleBtn.textContent = navMenu.classList.contains('active') ? '✕ Закрыть' : '☰ Меню';
        }
    }
}

let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', e => {
    touchEndY = e.changedTouches[0].screenY;
    if (touchStartY - touchEndY > 48) {
        const navMenu = document.getElementById('navMenu');
        const toggleBtn = document.querySelector('.menu-toggle');
        // Плавное скрытие через снятие класса (CSS transition отработает)
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (toggleBtn) toggleBtn.textContent = '☰ Меню';
        }
    }
}, { passive: true });

// ===== ОТКРЫТИЕ ИГРЫ =====
function openGame(game) {
    currentGame = game;
    const gameArea = document.getElementById('gameArea');
    const modal = document.getElementById('gameModal');

    if (!gameArea || !modal) return;

    switch (game) {
        case 'roulette':
            gameArea.innerHTML = createRouletteGame();
            break;
        case 'slots':
            gameArea.innerHTML = createSlotsGame();
            break;
        case 'wheel':
            gameArea.innerHTML = createWheelGame();
            break;
        case 'dice':
            gameArea.innerHTML = createDiceGame();
            break;
        case 'coin':
            gameArea.innerHTML = createCoinGame();
            break;
        case 'blackjack':
            gameArea.innerHTML = createBlackjackGame();
            break;
        case 'rps':
            gameArea.innerHTML = createRPSGame();
            break;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Анимация появления модального окна
    setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.animation = 'modalSlideIn 0.4s ease';
        }
    }, 10);
}

function closeGame() {
    const modal = document.getElementById('gameModal');
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.animation = 'fadeOut 0.3s ease';
        }
        setTimeout(() => {
            modal.classList.remove('active');
            document.body.style.overflow = '';

            // Explicitly reset Blackjack state
            if (currentGame === 'blackjack') {
                bjGameActive = false;
                bjPlayerHand = [];
                bjDealerHand = [];
                bjBet = 0;
                bjDeck = [];
                // Reset UI inside modal if needed, though openGame recreates it.
            }
        }, 300);
    }
}

// Закрытие по клику вне модального окна
window.addEventListener('click', (e) => {
    const modal = document.getElementById('gameModal');
    const detailsModal = document.getElementById('detailsModal');
    if (e.target === modal) {
        closeGame();
    }
    if (e.target === detailsModal) {
        closeGameDetails();
    }
});

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeGame();
        closeGameDetails();
    }
});

// ===== СБРОС БАЛАНСА =====
function resetBalance() {
    balance = 3000;
    gameStats.totalBets = 0;
    gameStats.totalWins = 0;
    gameStats.winCount = 0;
    gameStats.loseCount = 0;

    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;

    updateGlobalBalance();

    // Animate global balance
    const navBal = document.getElementById('nav-global-balance');
    if (navBal) {
        navBal.style.animation = 'none';
        void navBal.offsetWidth;
        navBal.style.animation = 'winPulse 0.5s ease';
    }

    updateStats();
    showToast('Баланс сброшен до $3000!');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `✅ ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 3000);
}

// ===== ДЕТАЛИ ИГРЫ =====
function openGameDetails(gameId) {
    const data = gameDetailsData[gameId];
    if (!data) return;

    const detailsArea = document.getElementById('detailsArea');
    const modal = document.getElementById('detailsModal');

    if (!detailsArea || !modal) return;

    detailsArea.innerHTML = `
        <h2>${data.title}</h2>
        <div class="tabs-header">
            <button class="tab-btn active" onclick="switchTab('rules')">📜 Правила</button>
            <button class="tab-btn" onclick="switchTab('description')">ℹ️ Описание</button>
            <button class="tab-btn" onclick="switchTab('howitworks')">⚙️ Как это работает</button>
            <button class="tab-btn" onclick="switchTab('theory')">📊 Теория</button>
            <button class="tab-btn" onclick="switchTab('history')">🕰️ История</button>
        </div>

        <div id="tab-rules" class="tab-content active details-block">
            <h4>Правила игры:</h4>
            ${data.rules}
        </div>

        <div id="tab-description" class="tab-content details-block">
            <h4>Об игре:</h4>
            <p>${data.description}</p>
        </div>

        <div id="tab-howitworks" class="tab-content details-block">
            <h4>⚙️ Как это работает:</h4>
            ${data.howItWorks || '<p>Раздел в разработке.</p>'}
        </div>

        <div id="tab-theory" class="tab-content details-block">
            <h4>Как работает вероятность:</h4>
            ${data.theory}
        </div>

        <div id="tab-history" class="tab-content details-block">
            <h4>Историческая справка:</h4>
            <p>${data.history}</p>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeGameDetails() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function switchTab(tabId) {
    // Скрываем все табы
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    // Убираем активность с кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Показываем нужный таб
    document.getElementById(`tab-${tabId}`).classList.add('active');
    // Активируем кнопку (находим по onclick)
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
        }
    });
}



// ===== РУЛЕТКА =====
function createRouletteGame() {
    return `
        <h2>🎡 Рулетка</h2>
        <div class="beautiful-formula">
            <div class="formula-title">Равномерное дискретное распределение</div>
            <div class="formula-content">P(красное/черное/четное/нечетное) = 18/37 &approx; <span style="color: #2ecc71;">48.65%</span></div>
            <div class="formula-content">P(зеро) = 1/37 &approx; <span style="color: #f1c40f;">2.70%</span></div>
            <div class="formula-content">E(X) = (18/37 × 1) − (19/37 × 1) = <span style="color:#e74c3c;">−2.7%</span></div>
        </div>
       
        <div class="input-group" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 150px;">
                <label>Размер ставки ($)</label>
                <input type="number" id="bet-amount" min="1" max="100000" value="50">
            </div>
            <div style="flex: 1; min-width: 150px;">
                <label>Итераций симуляции (1-200)</label>
                <input type="number" id="roulette-sim-iters" min="1" max="200" value="100">
            </div>
            <div style="flex: 0 0 auto; min-width: 150px;">
                <button class="btn-play" style="width: 100%; height: 46px; background: #9b59b6;" onclick="runSimulation('roulette')">🚀 Симуляция</button>
            </div>
        </div>

        <div class="game-buttons" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 0.5rem;">
            <button class="btn-play" style="background: #e74c3c;" onclick="playRoulette('red')">🔴 Красное</button>
            <button class="btn-play" style="background: #27ae60;" onclick="playRoulette('zero')">🟢 Зеро (0)</button>
            <button class="btn-play" style="background: #1a252f;" onclick="playRoulette('black')">⚫ Черное</button>
        </div>
        <div class="game-buttons" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <button class="btn-play" style="background: linear-gradient(135deg, #2980b9, #2c3e50);" onclick="playRoulette('even')">🔢 Четное</button>
            <button class="btn-play" style="background: linear-gradient(135deg, #8e44ad, #2c3e50);" onclick="playRoulette('odd')">🔢 Нечетное</button>
        </div>

        <div style="margin-top: 1rem;">
            <button class="btn-reset" onclick="resetCasinoBalance()" style="width: 100%;">💳 Установить баланс (Депозит)</button>
        </div>

        <div id="roulette-display" class="game-display">
            <div id="roulette-anim" class="game-anim-text">Вращайте колесо!</div>
        </div>

        <div id="result"></div>
        <div style="text-align: center; color: #f39c12; font-weight: bold; font-size: 1.2rem; margin: 1rem 0; padding: 1rem; background: rgba(243, 156, 18, 0.1); border-radius: 8px;">
            💰 Баланс: $<span id="balance-display">${balance}</span>
        </div>

        <div id="roulette-stats" class="statistics"></div>
    `;
}

function playRoulette(color) {
    const betInput = document.getElementById('bet-amount');
    if (!betInput) return;

    const bet = parseInt(betInput.value);
    if (balance <= 0) {
        showAlert('У вас нулевой баланс! Пожалуйста, пополните депозит.');
        openDepositModal();
        return;
    }
    if (bet < 1 || balance < bet) {
        showAlert('Некорректная ставка или недостаточно средств!');
        return;
    }

    balance -= bet;
    gameStats.totalBets += bet;
    updateGlobalBalance();
    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;

    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.className = '';
        resultDiv.textContent = '🎲 Вращение рулетки...';
        resultDiv.style.display = 'block';
    }

    const animDisplay = document.getElementById('roulette-anim');
    if (animDisplay) {
        animDisplay.innerHTML = '';
        animDisplay.style.transform = '';
    }

    let spins = 0;
    const maxSpins = 20;
    const interval = setInterval(() => {
        const tempNum = Math.floor(Math.random() * 37);
        const isLight = document.body.classList.contains('light-theme');
        // На зеленом сукне темные цвета плохо видно, используем яркий белый для "черных" цифр в светлой теме
        const blackCol = isLight ? '#ffffff' : '#bdc3c7';
        const tempColor = tempNum === 0 ? '#4ade80' : (tempNum % 2 === 0 ? blackCol : '#f87171');

        animDisplay.innerHTML = `<span style="color: ${tempColor} !important; font-size: 3rem; display: inline-block; transform: scale(${1 + Math.random() * 0.2}); opacity: 0.9;">${tempNum}</span>`;
        spins++;

        if (spins >= maxSpins) {
            clearInterval(interval);
            finishRoulette(color, bet);
        }
    }, 100);
}

function finishRoulette(color, bet) {
    // Чистая вероятность
    let won = false;
    let payout = 2; // для шансов 1:1, прибыль bet (всего bet * 2 возвращается)

    if (color === 'zero') { won = Math.random() < 1 / 37; payout = 36; }
    else { won = Math.random() < 18 / 37; }

    let number = 0;
    if (won) {
        if (color === 'zero') number = 0;
        else if (color === 'red') number = Math.floor(Math.random() * 18) * 2 + 1; // Нечетные (Красное) (Условно)
        else if (color === 'black') number = Math.floor(Math.random() * 18) * 2 + 2; // Четные (Черное) (Условно)
        else if (color === 'even') number = Math.floor(Math.random() * 18) * 2 + 2; // Четные
        else if (color === 'odd') number = Math.floor(Math.random() * 18) * 2 + 1; // Нечетные
    } else {
        if (color === 'zero') number = Math.floor(Math.random() * 36) + 1; // 1-36
        else if (color === 'red') number = Math.random() < 1 / 19 ? 0 : Math.floor(Math.random() * 18) * 2 + 2; // 0 или Четные
        else if (color === 'black') number = Math.random() < 1 / 19 ? 0 : Math.floor(Math.random() * 18) * 2 + 1; // 0 или Нечетные
        else if (color === 'even') number = Math.random() < 1 / 19 ? 0 : Math.floor(Math.random() * 18) * 2 + 1; // 0 или Нечетные
        else if (color === 'odd') number = Math.random() < 1 / 19 ? 0 : Math.floor(Math.random() * 18) * 2 + 2; // 0 или Четные
    }

    let resultColor = 'black';
    if (number === 0) resultColor = 'zero';
    else if (number % 2 !== 0) resultColor = 'red';

    const resultDiv = document.getElementById('result');
    const animDisplay = document.getElementById('roulette-anim');

    let colorClass = 'val-black';
    if (number === 0) colorClass = 'val-green';
    else if (number % 2 !== 0) colorClass = 'val-red';

    if (animDisplay) {
        animDisplay.innerHTML = `<div class="roulette-result-val ${colorClass}">
            <span style="font-size: 3rem; font-weight: bold;">${number}</span>
        </div>`;
    }

    if (!resultDiv) return;

    let chosenText = '';
    if (color === 'zero') chosenText = 'Зеро';
    else if (color === 'red') chosenText = 'Красное';
    else if (color === 'black') chosenText = 'Черное';
    else if (color === 'even') chosenText = 'Четное';
    else if (color === 'odd') chosenText = 'Нечетное';

    let actualText = ' (' + (resultColor === 'zero' ? 'Зеро' : (resultColor === 'black' ? 'Черное' : 'Красное')) + ')';

    if (won) {
        const win = bet * payout;
        balance += win;
        gameStats.totalWins += win;
        gameStats.winCount++;
        resultDiv.className = 'result-message win';
        resultDiv.textContent = `✅ ВЫИГРЫШ! (+$${win - bet}) Выпало: ${number}${actualText} | Ставка: ${chosenText}`;
        playWinSound();
        recordBet('roulette', bet, 'win', win);
    } else {
        gameStats.loseCount++;
        resultDiv.className = 'result-message lose';
        resultDiv.textContent = `❌ ПРОИГРЫШ! (-$${bet}) Выпало: ${number}${actualText} | Ставка: ${chosenText}`;
        playLoseSound();
        recordBet('roulette', bet, 'lose', 0);
    }

    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;
    updateGlobalBalance();
    updateStats();
}


// ===== СЛОТЫ (Без изменений) =====
function createSlotsGame() {
    return `
        <h2>🎰 Слот-машина</h2>
        <div class="beautiful-formula">
            <div class="formula-title">Комбинаторика</div>
            <div class="formula-content">P(3 одинаковых) = 7/7³ = 7/343 = 1/49 &approx; <span style="color: #2ecc71;">2.04%</span></div>
            <div class="formula-content">House Edge = 1 − (1/49 × 10) &approx; <span style="color: #e74c3c;">79.6%</span></div>
        </div>
        
        <div class="input-group" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 150px;">
                <label>Размер ставки ($)</label>
                <input type="number" id="slot-bet" min="1" max="100000" value="50">
            </div>
            <div style="flex: 1; min-width: 150px;">
                <label>Итераций симуляции (1-200)</label>
                <input type="number" id="slots-sim-iters" min="1" max="200" value="100">
            </div>
            <div style="flex: 0 0 auto; min-width: 150px;">
                <button class="btn-play" style="width: 100%; height: 46px; background: #9b59b6;" onclick="runSimulation('slots')">🚀 Симуляция</button>
            </div>
        </div>

        <div class="game-buttons grid-1">
            <button class="btn-play" onclick="playSlots()">🎰 Вращать барабаны</button>
        </div>

        <div id="slot-display" class="game-display">
            <div>
                <span id="reel1" class="game-anim-text" style="padding:0 5px;">❓</span> 
                <span id="reel2" class="game-anim-text" style="padding:0 5px;">❓</span> 
                <span id="reel3" class="game-anim-text" style="padding:0 5px;">❓</span>
            </div>
        </div>

        <div style="margin-top: 1rem;">
            <button class="btn-reset" onclick="resetCasinoBalance()" style="width: 100%;">💳 Установить баланс (Депозит)</button>
        </div>

        <div id="slot-result"></div>
        <div style="text-align: center; color: #f39c12; font-weight: bold; font-size: 1.2rem; margin: 1rem 0; padding: 1rem; background: rgba(243, 156, 18, 0.1); border-radius: 8px;">
            💰 Баланс: $<span id="balance-display">${balance}</span>
        </div>
        <div id="slot-stats" class="statistics"></div>
    `;
}

function playSlots() {
    const betInput = document.getElementById('slot-bet');
    if (!betInput) return;

    const bet = parseInt(betInput.value);
    if (balance <= 0) {
        showAlert('У вас нулевой баланс! Пожалуйста, пополните депозит.');
        openDepositModal();
        return;
    }
    if (bet < 1 || balance < bet) {
        showAlert('Некорректная ставка или недостаточно средств!');
        return;
    }

    balance -= bet;
    gameStats.totalBets += bet;
    updateGlobalBalance();
    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;

    // Reset result message to spinning state
    const resultDiv = document.getElementById('slot-result');
    if (resultDiv) {
        resultDiv.className = '';
        resultDiv.textContent = '🎰 Вращение барабанов...';
        resultDiv.style.display = 'block';
    }

    const slotDisplay = document.getElementById('slot-display');
    if (slotDisplay) slotDisplay.style.animation = 'none';

    // Анимация вращения
    const reels = ['reel1', 'reel2', 'reel3'];
    const symbols = ['🍒', '🍓', '🍇', '🎁', '⭐', '💎', '👑'];

    reels.forEach((reelId, index) => {
        const reel = document.getElementById(reelId);
        if (reel) {
            reel.style.animation = 'spin 0.3s ease';
            let spins = 0;
            const spinInterval = setInterval(() => {
                reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                spins++;
                if (spins > 10) {
                    clearInterval(spinInterval);
                    reel.style.animation = '';
                }
            }, 50);
        }
    });

    setTimeout(() => {
        // Чистая вероятность (7/343)
        const won = Math.random() < (7 / 343);
        let finalReels = [];
        if (won) {
            const sym = symbols[Math.floor(Math.random() * symbols.length)];
            finalReels = [sym, sym, sym];
        } else {
            do {
                finalReels = [
                    symbols[Math.floor(Math.random() * symbols.length)],
                    symbols[Math.floor(Math.random() * symbols.length)],
                    symbols[Math.floor(Math.random() * symbols.length)]
                ];
            } while (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]);
        }

        document.getElementById('reel1').textContent = finalReels[0];
        document.getElementById('reel2').textContent = finalReels[1];
        document.getElementById('reel3').textContent = finalReels[2];
        const balanceDisplay = document.getElementById('balance-display');
        if (balanceDisplay) balanceDisplay.textContent = balance;
        updateGlobalBalance();

        const resultDiv = document.getElementById('slot-result');
        const slotDisplay = document.getElementById('slot-display');

        // Clear previous animations to allow reflow
        slotDisplay.style.animation = 'none';

        // Force reflow
        void slotDisplay.offsetWidth;

        if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
            const win = bet * 10;
            balance += win;
            gameStats.totalWins += win;
            gameStats.winCount++;
            resultDiv.className = 'result-message win';
            resultDiv.textContent = `✅ ДЖЕКПОТ! (+$${win})`;
            playWinSound();
            slotDisplay.style.animation = 'winPulse 0.6s ease';
            recordBet('slots', bet, 'win', win);
        } else {
            gameStats.loseCount++;
            resultDiv.className = 'result-message lose';
            resultDiv.textContent = `❌ Не повезло (-$${bet})`;
            slotDisplay.style.animation = 'shake 0.5s ease';
            playLoseSound();
            recordBet('slots', bet, 'lose', 0);
        }

        updateStats();
    }, 1000);
}

// ===== КОЛЕСО (Добавлен Клевер) =====
function createWheelGame() {
    return `
        <h2>🎪 Колесо фортуны</h2>
        <div class="beautiful-formula">
            <div class="formula-title">📐 Биномиальное распределение (Справедливая игра)</div>
            <div class="formula-content">P(угадать сектор) = 1/4 = <span style="color: #2ecc71;">25%</span></div>
            <div class="formula-content">Выплата: <span style="color: #f1c40f;">4 к 1</span> (ставка ×4 при победе)</div>
            <div class="formula-content">E(X) = (1/4 × 3) − (3/4 × 1) = <span style="color:#2ecc71;">0 (честная игра)</span></div>
        </div>
        
        <div class="input-group" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 150px;">
                <label>Размер ставки ($)</label>
                <input type="number" id="wheel-bet" min="1" max="100000" value="50">
            </div>
            <div style="flex: 1; min-width: 150px;">
                <label>Итераций симуляции (1-200)</label>
                <input type="number" id="wheel-sim-iters" min="1" max="200" value="100">
            </div>
            <div style="flex: 0 0 auto; min-width: 150px;">
                <button class="btn-play" style="width: 100%; height: 46px; background: #9b59b6;" onclick="runSimulation('wheel')">🚀 Симуляция</button>
            </div>
        </div>

        <div class="game-buttons grid-2">
            <button class="btn-play" onclick="playWheel('star')">⭐ Звезда</button>
            <button class="btn-play" onclick="playWheel('heart')">❤️ Сердце</button>
            <button class="btn-play" onclick="playWheel('diamond')">💎 Алмаз</button>
            <button class="btn-play" onclick="playWheel('clover')">🍀 Клевер</button>
        </div>

        <div style="margin-top: 1rem;">
            <button class="btn-reset" onclick="resetCasinoBalance()" style="width: 100%;">💳 Установить баланс (Депозит)</button>
        </div>

        <div id="wheel-display" class="game-display">
            <div id="wheel-anim" class="game-anim-huge">🎪</div>
        </div>

        <div id="wheel-result"></div>
        <div style="text-align: center; color: #f39c12; font-weight: bold; font-size: 1.2rem; margin: 1rem 0; padding: 1rem; background: rgba(243, 156, 18, 0.1); border-radius: 8px;">
            💰 Баланс: $<span id="balance-display">${balance}</span>
        </div>
        <div id="wheel-stats" class="statistics"></div>
    `;
}

function playWheel(choice) {
    const betInput = document.getElementById('wheel-bet');
    if (!betInput) return;

    const bet = parseInt(betInput.value);
    if (balance <= 0) {
        showAlert('У вас нулевой баланс! Пожалуйста, пополните депозит.');
        openDepositModal();
        return;
    }
    if (bet < 1 || balance < bet) {
        showAlert('Некорректная ставка или недостаточно средств!');
        return;
    }

    balance -= bet;
    gameStats.totalBets += bet;
    updateGlobalBalance();
    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;

    const resultDiv = document.getElementById('wheel-result');
    if (resultDiv) {
        resultDiv.className = '';
        resultDiv.textContent = '🎪 Колесо вращается...';
        resultDiv.style.display = 'block';
    }

    // Дисплей
    let animDisplay = document.getElementById('wheel-anim');
    if (!animDisplay) return;

    // Анимация вращения (добавлен КЛЕВЕР)
    const symbols = ['⭐', '❤️', '💎', '🍀'];
    let spinCount = 0;
    const interval = setInterval(() => {
        animDisplay.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        animDisplay.style.animation = 'spin 0.2s linear infinite';
        spinCount++;
        if (spinCount > 15) {
            clearInterval(interval);
            animDisplay.style.animation = '';
            finishWheel(bet, choice, symbols);
        }
    }, 100);
}

function finishWheel(bet, choice, symbols) {
    // Чистая вероятность (25%)
    const choiceMap = { 'star': '⭐', 'heart': '❤️', 'diamond': '💎', 'clover': '🍀' };
    const targetSymbol = choiceMap[choice];
    const won = Math.random() < 0.25;

    let resultSymbol = '';
    if (won) {
        resultSymbol = targetSymbol;
    } else {
        const others = symbols.filter(s => s !== targetSymbol);
        resultSymbol = others[Math.floor(Math.random() * others.length)];
    }

    const resultDiv = document.getElementById('wheel-result');
    const animDisplay = document.getElementById('wheel-anim');

    if (animDisplay) {
        animDisplay.textContent = resultSymbol;
        animDisplay.style.animation = 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }

    if (won) {
        const win = bet * 4;
        balance += win;
        gameStats.totalWins += win;
        gameStats.winCount++;
        resultDiv.className = 'result-message win';
        resultDiv.textContent = `✅ ВЫИГРЫШ! (+$${win}) Выпал символ: ${resultSymbol}`;
        playWinSound();
        recordBet('wheel', bet, 'win', win);
    } else {
        gameStats.loseCount++;
        resultDiv.className = 'result-message lose';
        resultDiv.textContent = `❌ ПРОИГРЫШ! (-$${bet}) Выпал символ: ${resultSymbol}`;
        playLoseSound();
        recordBet('wheel', bet, 'lose', 0);
    }
    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;
    updateGlobalBalance();
    updateStats();
}

// ===== КОСТИ (Переработано: БОЛЬШЕ/МЕНЬШЕ 7) =====
function createDiceGame() {
    return `
        <h2>🎲 Крэпс</h2>
        <div class="beautiful-formula">
            <div class="formula-title">📐 Свёртка дискретных распределений (Сумма двух кубиков)</div>
            <div class="formula-content">P(Сумма < 7) = 15/36 &approx; <span style="color: #2ecc71;">41.67%</span> → Выплата: ×2.4</div>
            <div class="formula-content">P(Сумма > 7) = 15/36 &approx; <span style="color: #2ecc71;">41.67%</span> → Выплата: ×2.4</div>
            <div class="formula-content">P(Сумма = 7) = 6/36 &approx; <span style="color: #f1c40f;">16.67%</span> → Выплата: ×5</div>
        </div>
        
        <div class="input-group" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 150px;">
                <label>Размер ставки ($)</label>
                <input type="number" id="dice-bet" min="1" max="100000" value="50">
            </div>
            <div style="flex: 1; min-width: 150px;">
                <label>Итераций симуляции (1-200)</label>
                <input type="number" id="dice-sim-iters" min="1" max="200" value="100">
            </div>
            <div style="flex: 0 0 auto; min-width: 150px;">
                <button class="btn-play" style="width: 100%; height: 46px; background: #9b59b6;" onclick="runSimulation('dice')">🚀 Симуляция</button>
            </div>
        </div>

        <div class="game-buttons grid-3">
            <button class="btn-play" onclick="playDice('under')">📉 Меньше 7</button>
            <button class="btn-play" style="background: #9b59b6;" onclick="playDice('seven')">🎯 Ровно 7</button>
            <button class="btn-play" onclick="playDice('over')">📈 Больше 7</button>
        </div>

        <div class="dice-container">
            <div id="dice1" class="dice-val">🎲</div> 
            <div id="dice2" class="dice-val">🎲</div>
        </div>

        <div style="margin-top: 1rem;">
            <button class="btn-reset" onclick="resetCasinoBalance()" style="width: 100%;">💳 Установить баланс (Депозит)</button>
        </div>

        <div id="dice-result"></div>
        <div style="text-align: center; color: #f39c12; font-weight: bold; font-size: 1.2rem; margin: 1rem 0; padding: 1rem; background: rgba(243, 156, 18, 0.1); border-radius: 8px;">
            💰 Баланс: $<span id="balance-display">${balance}</span>
        </div>
        <div id="dice-stats" class="statistics"></div>
    `;
}

function playDice(choice) {
    const betInput = document.getElementById('dice-bet');
    if (!betInput) return;

    const bet = parseInt(betInput.value);
    if (balance <= 0) {
        showAlert('У вас нулевой баланс! Пожалуйста, пополните депозит.');
        openDepositModal();
        return;
    }
    if (bet < 1 || balance < bet) {
        showAlert('Некорректная ставка или недостаточно средств!');
        return;
    }

    balance -= bet;
    gameStats.totalBets += bet;
    updateGlobalBalance();
    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;

    const dice1 = document.getElementById('dice1');
    const dice2 = document.getElementById('dice2');

    // Чистые вероятности для костей
    let won = false;
    if (choice === 'under') { won = Math.random() < 15 / 36; }
    else if (choice === 'over') { won = Math.random() < 15 / 36; }
    else if (choice === 'seven') { won = Math.random() < 6 / 36; }

    let finalSum = 0;
    if (won) {
        if (choice === 'under') finalSum = Math.floor(Math.random() * 5) + 2; // 2..6
        if (choice === 'over') finalSum = Math.floor(Math.random() * 5) + 8; // 8..12
        if (choice === 'seven') finalSum = 7;
    } else {
        if (choice === 'under') finalSum = Math.random() < 6 / 21 ? 7 : Math.floor(Math.random() * 5) + 8; // 7 or over
        if (choice === 'over') finalSum = Math.random() < 6 / 21 ? 7 : Math.floor(Math.random() * 5) + 2; // 7 or under
        if (choice === 'seven') {
            do { finalSum = Math.floor(Math.random() * 11) + 2; } while (finalSum === 7);
        }
    }

    const possibleSplits = [];
    for (let i = 1; i <= 6; i++) {
        for (let j = 1; j <= 6; j++) {
            if (i + j === finalSum) possibleSplits.push([i, j]);
        }
    }
    const split = possibleSplits[Math.floor(Math.random() * possibleSplits.length)];
    const finalD1 = split[0];
    const finalD2 = split[1];

    let rolls = 0;
    const maxRolls = 15;
    let animationStopped = false;

    // Animation loop
    function rollDiceAnim() {
        if (animationStopped || rolls >= maxRolls) return;

        const val1 = Math.floor(Math.random() * 6) + 1;
        const val2 = Math.floor(Math.random() * 6) + 1;

        dice1.textContent = val1;
        dice2.textContent = val2;

        dice1.style.transform = `rotate(${Math.random() * 360}deg) scale(1.1)`;
        dice2.style.transform = `rotate(${Math.random() * 360}deg) scale(1.1)`;

        rolls++;
        if (rolls < maxRolls) {
            requestAnimationFrame(() => setTimeout(rollDiceAnim, 60));
        }
    }
    rollDiceAnim();

    setTimeout(() => {
        // Stop animation
        animationStopped = true;

        // Set FINAL values
        dice1.textContent = finalD1;
        dice2.textContent = finalD2;

        // Reset transformation
        dice1.style.transform = 'rotate(0deg) scale(1)';
        dice2.style.transform = 'rotate(0deg) scale(1)';
        dice1.style.transition = 'all 0.3s ease';
        dice2.style.transition = 'all 0.3s ease';

        const resultDiv = document.getElementById('dice-result');

        let won = false;
        let payout = 0;

        if (choice === 'under' && finalSum < 7) { won = true; payout = 2.4; }
        if (choice === 'over' && finalSum > 7) { won = true; payout = 2.4; }
        if (choice === 'seven' && finalSum === 7) { won = true; payout = 5; }

        if (won) {
            const win = Math.floor(bet * payout);
            balance += win;
            gameStats.totalWins += win;
            gameStats.winCount++;
            resultDiv.className = 'result-message win';
            resultDiv.textContent = `✅ ВЫИГРЫШ! Сумма: ${finalSum} (+$${win})`;
            playWinSound();
            recordBet('dice', bet, 'win', win);
        } else {
            gameStats.loseCount++;
            resultDiv.className = 'result-message lose';
            resultDiv.textContent = `❌ ПРОИГРЫШ! Сумма: ${finalSum} (-$${bet})`;
            playLoseSound();
            recordBet('dice', bet, 'lose', 0);
        }

        const balanceDisplay = document.getElementById('balance-display');
        if (balanceDisplay) balanceDisplay.textContent = balance;
        updateGlobalBalance();
        updateStats();
    }, 1050);
}

// ===== МОНЕТА  =====
function createCoinGame() {
    return `
        <h2>🟡 Орел и 🟠 Решка</h2>
        <div class="beautiful-formula">
            <div class="formula-title">📐 Схема Бернулли (Независимые испытания)</div>
            <div class="formula-content">P(Орел) = P(Решка) = 1/2 = <span style="color: #2ecc71;">50%</span></div>
            <div class="formula-content">Выплата: <span style="color: #f1c40f;">2 к 1</span> (ставка удваивается при победе)</div>
            <div class="formula-content">E(X) = (0.5 × 1) − (0.5 × 1) = <span style="color:#2ecc71;">0 (честная игра)</span></div>
        </div>
        
        <div class="input-group" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 150px;">
                <label>Размер ставки ($)</label>
                <input type="number" id="coin-bet" min="1" max="100000" value="50">
            </div>
            <div style="flex: 1; min-width: 150px;">
                <label>Итераций симуляции (1-200)</label>
                <input type="number" id="coin-sim-iters" min="1" max="200" value="100">
            </div>
            <div style="flex: 0 0 auto; min-width: 150px;">
                <button class="btn-play" style="width: 100%; height: 46px; background: #9b59b6;" onclick="runSimulation('coin')">🚀 Симуляция</button>
            </div>
        </div>

        <div class="game-buttons">
            <button class="btn-play" onclick="playCoin('heads')">🟡 Орел</button>
            <button class="btn-play" onclick="playCoin('tails')">🟠 Решка</button>
        </div>

        <div id="coin-display" class="game-display">
            <div id="coin-visual" class="coin-visual">🟡</div>
        </div>

        <div style="margin-top: 1rem;">
            <button class="btn-reset" onclick="resetCasinoBalance()" style="width: 100%;">💳 Установить баланс (Депозит)</button>
        </div>

        <div id="coin-result"></div>
        <div style="text-align: center; color: #f39c12; font-weight: bold; font-size: 1.2rem; margin: 1rem 0; padding: 1rem; background: rgba(243, 156, 18, 0.1); border-radius: 8px;">
            💰 Баланс: $<span id="balance-display">${balance}</span>
        </div>
        <div id="coin-stats" class="statistics"></div>
    `;
}

function playCoin(choice) {
    const betInput = document.getElementById('coin-bet');
    if (!betInput) return;

    const bet = parseInt(betInput.value);
    if (balance <= 0) {
        showAlert('У вас нулевой баланс! Пожалуйста, пополните депозит.');
        openDepositModal();
        return;
    }
    if (bet < 1 || balance < bet) {
        showAlert('Некорректная ставка или недостаточно средств!');
        return;
    }

    balance -= bet;
    gameStats.totalBets += bet;
    updateGlobalBalance();
    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;

    const coinVisual = document.getElementById('coin-visual');
    const resultDiv = document.getElementById('coin-result');

    // Сброс результата
    if (resultDiv) {
        resultDiv.style.display = 'none';
    }

    // Анимация подбрасывания
    let flips = 0;
    const flipInterval = setInterval(() => {
        coinVisual.textContent = flips % 2 === 0 ? '🟡' : '🟠';
        flips++;
    }, 100);

    setTimeout(() => {
        clearInterval(flipInterval);
        // Идеальные 50/50 по вероятности
        const won = Math.random() < 0.5;
        const result = won ? choice : (choice === 'heads' ? 'tails' : 'heads');

        // Показываем финальный результат
        coinVisual.textContent = result === 'heads' ? '🟡' : '🟠';

        if (choice === result) {
            const win = bet * 2;
            balance += win;
            gameStats.totalWins += win;
            gameStats.winCount++;
            resultDiv.className = 'result-message win';
            resultDiv.style.display = 'block';
            resultDiv.textContent = `✅ ВЫИГРЫШ! Выпал: ${result === 'heads' ? 'Орел 🟡' : 'Решка 🟠'} (+$${win})`;
            playWinSound();
            recordBet('coin', bet, 'win', win);
        } else {
            gameStats.loseCount++;
            resultDiv.className = 'result-message lose';
            resultDiv.style.display = 'block';
            resultDiv.textContent = `❌ ПРОИГРЫШ! Выпал: ${result === 'heads' ? 'Орел 🟡' : 'Решка 🟠'} (-$${bet})`;
            playLoseSound();
            recordBet('coin', bet, 'lose', 0);
        }

        const balanceDisplay = document.getElementById('balance-display');
        if (balanceDisplay) balanceDisplay.textContent = balance;
        updateGlobalBalance();
        updateStats();
    }, 1500);
}


// ===== БЛЭКДЖЕК (ПОЛНАЯ СИМУЛЯЦИЯ) =====
let bjDeck = [];
let bjPlayerHand = [];
let bjDealerHand = [];
let bjGameActive = false;
let bjBet = 0;

function createBlackjackGame() {
    return `
        <h2>🃏 Блэкджек</h2>
        <div class="beautiful-formula">
            <div class="formula-title">📐 Условная вероятность P(A|B)</div>
            <div class="formula-content">P(Блэкджек) = 2 × (4/52 × 16/51) &approx; <span style="color: #2ecc71;">4.83%</span></div>
            <div class="formula-content">Выплата за Блэкджек: <span style="color: #f1c40f;">3:2</span> | Обычная победа: <span style="color: #f1c40f;">1:1</span></div>
            <div class="formula-content">House Edge (Базовая стратегия) = <span style="color:#e74c3c;">0.5%</span></div>
        </div>
        
        <div class="input-group" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 150px;">
                <label>Размер ставки ($)</label>
                <input type="number" id="bj-bet" min="1" max="100000" value="50">
            </div>
            <div style="flex: 1; min-width: 150px;">
                <label>Итераций симуляции (1-200)</label>
                <input type="number" id="blackjack-sim-iters" min="1" max="200" value="100">
            </div>
            <div style="flex: 0 0 auto; min-width: 150px;">
                <button class="btn-play" style="width: 100%; height: 46px; background: #9b59b6;" onclick="runSimulation('blackjack')">🚀 Симуляция</button>
            </div>
        </div>

        <div id="bj-controls" class="game-buttons grid-1">
            <button class="btn-play" onclick="startBlackjack()">🃏 Раздать карты</button>
        </div>

        <div id="bj-actions" class="game-buttons grid-2" style="display: none; margin-top: 10px;">
            <button class="btn-play" style="background: #27ae60;" onclick="bjHit()">👊 Взять</button>
            <button class="btn-play" style="background: #c0392b;" onclick="bjStand()">🛑 Хватит</button>
        </div>

        <div id="bj-display" class="bj-table">
            <div class="bj-hand-container">
                <div style="margin-bottom: 10px; color: #facc15; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">👤 ВЫ</div>
                <div id="player-cards" class="bj-cards-area"></div>
                <div id="player-sum" style="margin-top: 5px; font-weight: bold; font-size: 1.2rem; color: #ffffff !important; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">0</div>
            </div>
            
            <div style="width: 2px; background: rgba(255,255,255,0.1);"></div>

            <div class="bj-hand-container">
                <div style="margin-bottom: 10px; color: #facc15; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">🎰 ДИЛЕР</div>
                <div id="dealer-cards" class="bj-cards-area"></div>
                <div id="dealer-sum" style="margin-top: 5px; font-weight: bold; font-size: 1.2rem; color: #ffffff !important; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">0</div>
            </div>
        </div>

        <div style="margin-top: 1rem;">
            <button class="btn-reset" onclick="resetCasinoBalance()" style="width: 100%;">💳 Установить баланс (Депозит)</button>
        </div>

        <div id="bj-result"></div>
        <div style="text-align: center; color: #f39c12; font-weight: bold; font-size: 1.2rem; margin: 1rem 0; padding: 1rem; background: rgba(243, 156, 18, 0.1); border-radius: 8px;">
            💰 Баланс: $<span id="balance-display">${balance}</span>
        </div>
        <div id="bj-stats" class="statistics"></div>
    `;
}

function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    return deck.sort(() => Math.random() - 0.5);
}

function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    if (card.value === 'A') return 11;
    return parseInt(card.value);
}

function calculateHand(hand) {
    let sum = 0;
    let aces = 0;
    for (let card of hand) {
        sum += getCardValue(card);
        if (card.value === 'A') aces++;
    }
    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }
    return sum;
}

function renderCard(card, hidden = false) {
    if (hidden) return `<div class="card-item back"></div>`;

    const colorClass = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
    return `<div class="card-item ${colorClass}">${card.value}${card.suit}</div>`;
}

function updateBJUI(hideDealer = true) {
    const pDiv = document.getElementById('player-cards');
    const dDiv = document.getElementById('dealer-cards');
    const pSum = document.getElementById('player-sum');
    const dSum = document.getElementById('dealer-sum');

    if (!pDiv) return;

    pDiv.innerHTML = bjPlayerHand.map(c => renderCard(c)).join('');
    pSum.textContent = calculateHand(bjPlayerHand);

    dDiv.innerHTML = bjDealerHand.map((c, i) => renderCard(c, i === 1 && hideDealer)).join('');

    if (hideDealer && bjDealerHand.length > 0) {
        dSum.textContent = '?';
    } else {
        dSum.textContent = calculateHand(bjDealerHand);
    }
}

function startBlackjack() {
    const betInput = document.getElementById('bj-bet');
    if (!betInput) return;

    const bet = parseInt(betInput.value);
    if (balance <= 0) {
        showAlert('У вас нулевой баланс! Пожалуйста, пополните депозит.');
        openDepositModal();
        return;
    }
    if (bet < 1 || balance < bet) {
        showAlert('Некорректная ставка или недостаточно средств!');
        return;
    }

    if (bjGameActive) return;

    balance -= bet;
    bjBet = bet;
    gameStats.totalBets += bet;
    updateStats();

    bjDeck = createDeck();
    bjPlayerHand = [bjDeck.pop(), bjDeck.pop()];
    bjDealerHand = [bjDeck.pop(), bjDeck.pop()];
    bjGameActive = true;

    // UI Updates
    document.getElementById('bj-controls').style.display = 'none';
    document.getElementById('bj-actions').style.display = 'grid';
    document.getElementById('bj-result').textContent = '';
    document.getElementById('bj-result').className = '';
    document.getElementById('balance-display').textContent = balance;
    updateGlobalBalance();

    updateBJUI(true);

    // Check Blackjacks
    const pSum = calculateHand(bjPlayerHand);
    if (pSum === 21) {
        bjStand(); // Auto stand on Blackjack
    }
}

function bjHit() {
    if (!bjGameActive) return;

    bjPlayerHand.push(bjDeck.pop());
    updateBJUI(true);

    if (calculateHand(bjPlayerHand) > 21) {
        endBlackjack(false); // Bust
    }
}

function bjStand() {
    if (!bjGameActive) return;

    // Dealer turn
    while (calculateHand(bjDealerHand) < 17) {
        bjDealerHand.push(bjDeck.pop());
    }

    endBlackjack(true);
}

function endBlackjack(playerStood) {
    bjGameActive = false;
    updateBJUI(false); // Show dealer cards

    const pSum = calculateHand(bjPlayerHand);
    const dSum = calculateHand(bjDealerHand);
    const resultDiv = document.getElementById('bj-result');

    document.getElementById('bj-controls').style.display = 'grid';
    document.getElementById('bj-actions').style.display = 'none';

    if (pSum > 21) {
        gameStats.loseCount++;
        resultDiv.className = 'result-message lose';
        resultDiv.textContent = `❌ ПЕРЕБОР! У вас ${pSum}. (-$${bjBet})`;
        playLoseSound();
        recordBet('blackjack', bjBet, 'lose', 0);
    } else if (dSum > 21) {
        const win = bjBet * 2;
        balance += win;
        gameStats.totalWins += win;
        gameStats.winCount++;
        resultDiv.className = 'result-message win';
        resultDiv.textContent = `✅ ПОБЕДА (ДИЛЕР ПЕРЕБРАЛ!) (+$${win})`;
        playWinSound();
        recordBet('blackjack', bjBet, 'win', win);
    } else if (pSum > dSum) {
        let payout = 2;
        if (pSum === 21 && bjPlayerHand.length === 2) payout = 2.5;
        const win = Math.floor(bjBet * payout);
        balance += win;
        gameStats.totalWins += win;
        gameStats.winCount++;
        resultDiv.className = 'result-message win';
        resultDiv.textContent = `✅ ПОБЕДА! ${pSum} > ${dSum} (+$${win})`;
        playWinSound();
        recordBet('blackjack', bjBet, 'win', win);
    } else if (pSum === dSum) {
        balance += bjBet;
        resultDiv.className = 'result-message draw';
        resultDiv.textContent = `🤝 НИЧЬЯ! Возврат ставки.`;
        recordBet('blackjack', bjBet, 'draw', bjBet);
    } else {
        gameStats.loseCount++;
        resultDiv.className = 'result-message lose';
        resultDiv.textContent = `❌ ПРОИГРЫШ! Дилер (${dSum}) > Вы (${pSum}).`;
        playLoseSound();
        recordBet('blackjack', bjBet, 'lose', 0);
    }

    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;
    updateGlobalBalance();
    updateStats();
}

// ===== ОБНОВЛЕНИЕ СТАТИСТИКИ =====
function updateStats() {
    const roi = gameStats.totalBets > 0 ? ((gameStats.totalWins - gameStats.totalBets) / gameStats.totalBets * 100).toFixed(2) : 0;

    const statsElements = document.querySelectorAll('[id$="-stats"]');
    statsElements.forEach(statsDiv => {
        statsDiv.classList.add('show');
        statsDiv.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">💰 Баланс:</span>
                <span class="stat-value">$${balance}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">💸 Всего ставок:</span>
                <span class="stat-value">$${gameStats.totalBets}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">✅ Побед:</span>
                <span class="stat-value">${gameStats.winCount}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">❌ Поражений:</span>
                <span class="stat-value">${gameStats.loseCount}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">📊 Окупаемость инвестиций:</span>
                <span class="stat-value" style="color: ${roi > 0 ? '#27ae60' : '#e74c3c'};">${roi}%</span>
            </div>
        `;
    });
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function showAlert(message) {
    showToast(message);
}

function playWinSound() {
    // Haptic feedback for mobile
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]); // Success pattern
    }
    // const audio = new Audio('win.mp3');
    // audio.play();
}

function playLoseSound() {
    // Haptic feedback for mobile
    if (navigator.vibrate) {
        navigator.vibrate(200); // Simple error buzz
    }
    // const audio = new Audio('lose.mp3');
    // audio.play();
}

// CSS animations moved to styles.css

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Убеждаемся, что все неактивные секции скрыты
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        if (!section.classList.contains('active')) {
            section.style.display = 'none';
        }
    });

    // Убеждаемся, что активная секция видна
    const firstSection = document.querySelector('.section.active');
    if (firstSection) {
        firstSection.style.display = 'block';

        // Добавляем анимацию появления для первой секции
        requestAnimationFrame(() => {
            firstSection.classList.add('section-entering');
            setTimeout(() => {
                firstSection.classList.remove('section-entering');
            }, 500);
        });
    }

    // Плавная анимация появления элементов в активной секции
    setTimeout(() => {
        const elements = firstSection ? firstSection.querySelectorAll('.content-block, .game-card') : [];
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '0';
                el.style.animation = 'fadeInUp 0.6s ease forwards';
            }, index * 50);
        });
    }, 100);
});

// ===== ТАБЫ СЕКЦИИ ВЕРОЯТНОСТИ =====
function switchProbTab(tabId) {
    // Скрываем все контенты
    document.querySelectorAll('.prob-tab-content').forEach(el => el.classList.remove('active'));
    // Убираем активность с кнопок
    document.querySelectorAll('.prob-tab-btn').forEach(btn => btn.classList.remove('active'));

    // Показываем нужный контент
    const target = document.getElementById(`prob-${tabId}`);
    if (target) {
        target.classList.add('active');
    }

    // Активируем нажатую кнопку
    const btns = document.querySelectorAll('.prob-tab-btn');
    btns.forEach(btn => {
        if (btn.getAttribute('onclick').includes(`switchProbTab('${tabId}')`)) {
            btn.classList.add('active');
        }
    });
}

// ===== КАМЕНЬ, НОЖНИЦЫ, БУМАГА =====
function createRPSGame() {
    return `
        <h2>✂️ Камень, Ножницы, Бумага</h2>
        <div class="beautiful-formula">
            <div class="formula-title">📐 Равновесие Нэша (Теория Игр)</div>
            <div class="formula-content">P(Победа) = P(Ничья) = P(Поражение) = 1/3 &approx; <span style="color: #2ecc71;">33.33%</span></div>
            <div class="formula-content">Выплата: <span style="color: #f1c40f;">2 к 1</span> при победе. Возврат ставки при ничьей.</div>
            <div class="formula-content">E(X) = (1/3 × 1) − (1/3 × 1) + (1/3 × 0) = <span style="color:#2ecc71;">0 (честная игра)</span></div>
        </div>
        
        <div class="input-group" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 150px;">
                <label>Размер ставки ($)</label>
                <input type="number" id="rps-bet" min="1" max="100000" value="50">
            </div>
            <div style="flex: 1; min-width: 150px;">
                <label>Итераций симуляции (1-200)</label>
                <input type="number" id="rps-sim-iters" min="1" max="200" value="100">
            </div>
            <div style="flex: 0 0 auto; min-width: 150px;">
                <button class="btn-play" style="width: 100%; height: 46px; background: #9b59b6;" onclick="runSimulation('rps')">🚀 Симуляция</button>
            </div>
        </div>

        <div class="game-buttons grid-3">
            <button class="btn-play" onclick="playRPS('rock')" style="background: linear-gradient(135deg, #7f8c8d, #95a5a6);">🗿 Камень</button>
            <button class="btn-play" onclick="playRPS('scissors')" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">✂️ Ножницы</button>
            <button class="btn-play" onclick="playRPS('paper')" style="background: linear-gradient(135deg, #ecf0f1, #bdc3c7); color: #2c3e50;">📄 Бумага</button>
        </div>

        <div class="game-display rps-display">
            <div id="player-choice" class="rps-choice">❓</div>
            <div style="font-size: 3rem; color: #facc15; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">VS</div>
            <div id="ai-choice" class="rps-choice">❓</div>
        </div>

        <div style="margin-top: 1rem;">
            <button class="btn-reset" onclick="resetCasinoBalance()" style="width: 100%;">💳 Установить баланс (Депозит)</button>
        </div>

        <div id="rps-result"></div>
        <div style="text-align: center; color: #f39c12; font-weight: bold; font-size: 1.2rem; margin: 1rem 0; padding: 1rem; background: rgba(243, 156, 18, 0.1); border-radius: 8px;">
            💰 Баланс: $<span id="balance-display">${balance}</span>
        </div>
        <div id="rps-stats" class="statistics"></div>
    `;
}

function playRPS(playerMove) {
    const betInput = document.getElementById('rps-bet');
    if (!betInput) return;

    const bet = parseInt(betInput.value);
    if (balance <= 0) {
        showAlert('У вас нулевой баланс! Пожалуйста, пополните депозит.');
        openDepositModal();
        return;
    }
    if (bet < 1 || balance < bet) {
        showAlert('Некорректная ставка или недостаточно средств!');
        return;
    }

    balance -= bet;
    gameStats.totalBets += bet;

    // Обновляем дисплеи сразу после ставки
    updateGlobalBalance();
    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;

    // Сброс UI
    document.getElementById('rps-result').style.display = 'none';
    const gameDisplay = document.querySelector('.rps-display');
    if (gameDisplay) gameDisplay.style.animation = ''; // Reset animation
    const playerDiv = document.getElementById('player-choice');
    const aiDiv = document.getElementById('ai-choice');

    // Анимация
    let count = 0;
    const choices = ['🗿', '✂️', '📄'];
    const interval = setInterval(() => {
        playerDiv.textContent = choices[count % 3];
        aiDiv.textContent = choices[(count + 1) % 3];
        count++;
        if (count > 10) {
            clearInterval(interval);
            finishRPS(playerMove, bet);
        }
    }, 100);
}

function finishRPS(playerMove, bet) {
    const icons = { 'rock': '🗿', 'scissors': '✂️', 'paper': '📄' };

    // Чистая вероятность (1/3 на каждое)
    const rand = Math.random();
    let result = '';
    if (rand < 1 / 3) result = 'win';
    else if (rand < 2 / 3) result = 'draw';
    else result = 'lose';

    const winsAgainst = { 'rock': 'scissors', 'scissors': 'paper', 'paper': 'rock' };
    const losesAgainst = { 'rock': 'paper', 'scissors': 'rock', 'paper': 'scissors' };

    let aiMove = '';
    if (result === 'win') aiMove = winsAgainst[playerMove];
    else if (result === 'draw') aiMove = playerMove;
    else aiMove = losesAgainst[playerMove];

    document.getElementById('player-choice').textContent = icons[playerMove];
    document.getElementById('ai-choice').textContent = icons[aiMove];

    const resultDiv = document.getElementById('rps-result');


    if (result === 'win') {
        const win = bet * 2;
        balance += win;
        gameStats.totalWins += win;
        gameStats.winCount++;
        resultDiv.className = 'result-message win';
        resultDiv.style.display = 'block';
        resultDiv.textContent = `✅ ПОБЕДА! (+$${win})`;
        document.querySelector('.rps-display').style.animation = 'winPulse 0.6s ease';
        playWinSound();
        recordBet('rps', bet, 'win', win);
    } else if (result === 'draw') {
        balance += bet;
        resultDiv.className = 'result-message draw';
        resultDiv.style.display = 'block';
        resultDiv.textContent = `🤝 НИЧЬЯ! (Ставка возвращена)`;
        recordBet('rps', bet, 'draw', bet);
    } else {
        gameStats.loseCount++;
        resultDiv.className = 'result-message lose';
        resultDiv.style.display = 'block';
        resultDiv.textContent = `❌ ПОРАЖЕНИЕ! (-$${bet})`;
        document.querySelector('.rps-display').style.animation = 'shake 0.5s ease';
        playLoseSound();
        recordBet('rps', bet, 'lose', 0);
    }


    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;
    updateGlobalBalance();
    updateStats();
}

// ===== BETTING TAB — POISSON-BASED FOOTBALL SIMULATOR =====

// State
let bettingSelectedOutcome = null;
let bettingOddsData = {};

// --- Math: Poisson Distribution ---
function factorial(n) {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function poissonPmf(k, lambda) {
    // P(k; λ) = (λ^k * e^(-λ)) / k!
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

// Build full score matrix (home goals x away goals)
function buildScoreMatrix(xgHome, xgAway, maxGoals) {
    maxGoals = maxGoals || 8;
    const matrix = [];
    for (let h = 0; h <= maxGoals; h++) {
        matrix[h] = [];
        for (let a = 0; a <= maxGoals; a++) {
            matrix[h][a] = poissonPmf(h, xgHome) * poissonPmf(a, xgAway);
        }
    }
    return matrix;
}

// Extract match outcome probabilities from matrix
function calcMatchOdds(matrix) {
    let pHome = 0, pDraw = 0, pAway = 0, pOver25 = 0, pUnder25 = 0;
    const maxG = matrix.length;

    for (let h = 0; h < maxG; h++) {
        for (let a = 0; a < maxG; a++) {
            const p = matrix[h][a];
            if (h > a) pHome += p;
            else if (h === a) pDraw += p;
            else pAway += p;

            if (h + a > 2) pOver25 += p;
            else pUnder25 += p;
        }
    }

    return { pHome, pDraw, pAway, pOver25, pUnder25 };
}

// Convert fair probability to bookmaker coefficient with margin
function applyMargin(fairProb, marginPercent) {
    if (fairProb <= 0) return 99.99;
    const marginFactor = 1 + (marginPercent / 100);
    const adjustedProb = fairProb * marginFactor;
    return Math.max(1.01, 1 / adjustedProb);
}

// Simulate a match using Poisson probability-weighted selection
function simulateMatch(xgHome, xgAway) {
    const maxGoals = 8;
    const matrix = buildScoreMatrix(xgHome, xgAway, maxGoals);

    // Build cumulative distribution of all possible scores
    const outcomes = [];
    let cumulative = 0;
    for (let h = 0; h <= maxGoals; h++) {
        for (let a = 0; a <= maxGoals; a++) {
            cumulative += matrix[h][a];
            outcomes.push({ home: h, away: a, cdf: cumulative });
        }
    }

    // Random selection weighted by Poisson probabilities
    const rand = Math.random() * cumulative;
    for (let i = 0; i < outcomes.length; i++) {
        if (rand <= outcomes[i].cdf) {
            return { home: outcomes[i].home, away: outcomes[i].away };
        }
    }

    // Fallback (should not reach)
    return { home: 0, away: 0 };
}

// --- UI Functions ---

function updateBettingOdds() {
    const xgHome = parseFloat(document.getElementById('xg-home').value);
    const xgAway = parseFloat(document.getElementById('xg-away').value);
    const margin = parseFloat(document.getElementById('betting-margin').value);

    // Update displays
    document.getElementById('xg-home-display').textContent = xgHome.toFixed(2);
    document.getElementById('xg-away-display').textContent = xgAway.toFixed(2);
    document.getElementById('margin-display').textContent = margin.toFixed(1) + '%';

    // Calculate
    const matrix = buildScoreMatrix(xgHome, xgAway);
    const odds = calcMatchOdds(matrix);

    // Store for later
    bettingOddsData = {
        fair: odds,
        coefficients: {
            p1: applyMargin(odds.pHome, margin),
            x: applyMargin(odds.pDraw, margin),
            p2: applyMargin(odds.pAway, margin),
            over: applyMargin(odds.pOver25, margin),
            under: applyMargin(odds.pUnder25, margin)
        }
    };

    // Update UI
    document.getElementById('odds-p1-val').textContent = bettingOddsData.coefficients.p1.toFixed(2);
    document.getElementById('odds-x-val').textContent = bettingOddsData.coefficients.x.toFixed(2);
    document.getElementById('odds-p2-val').textContent = bettingOddsData.coefficients.p2.toFixed(2);
    document.getElementById('odds-over-val').textContent = bettingOddsData.coefficients.over.toFixed(2);
    document.getElementById('odds-under-val').textContent = bettingOddsData.coefficients.under.toFixed(2);

    document.getElementById('odds-p1-prob').textContent = (odds.pHome * 100).toFixed(1) + '%';
    document.getElementById('odds-x-prob').textContent = (odds.pDraw * 100).toFixed(1) + '%';
    document.getElementById('odds-p2-prob').textContent = (odds.pAway * 100).toFixed(1) + '%';
    document.getElementById('odds-over-prob').textContent = (odds.pOver25 * 100).toFixed(1) + '%';
    document.getElementById('odds-under-prob').textContent = (odds.pUnder25 * 100).toFixed(1) + '%';

    // If a bet was selected, update selected info
    if (bettingSelectedOutcome) {
        const labels = { p1: 'П1 (Хозяева)', x: 'Х (Ничья)', p2: 'П2 (Гости)', over: 'Тотал Б 2.5', under: 'Тотал М 2.5' };
        document.getElementById('betting-selected-odds').textContent = bettingOddsData.coefficients[bettingSelectedOutcome].toFixed(2);
    }
}

function placeBet(outcome) {
    // Remove all selected
    document.querySelectorAll('.odds-card').forEach(c => c.classList.remove('selected'));

    // Select new
    const map = { p1: 'odds-p1', x: 'odds-x', p2: 'odds-p2', over: 'odds-over', under: 'odds-under' };
    document.getElementById(map[outcome]).classList.add('selected');

    bettingSelectedOutcome = outcome;

    // Show selected info
    const labels = { p1: 'П1 (Хозяева)', x: 'Х (Ничья)', p2: 'П2 (Гости)', over: 'Тотал Б 2.5', under: 'Тотал М 2.5' };
    const infoDiv = document.getElementById('betting-selected-info');
    infoDiv.style.display = 'block';
    document.getElementById('betting-selected-label').textContent = labels[outcome];
    document.getElementById('betting-selected-odds').textContent = bettingOddsData.coefficients[outcome].toFixed(2);

    // Enable simulate buttons
    document.getElementById('betting-sim-btn').disabled = false;
    const massSimBtn = document.getElementById('betting-mass-sim-btn');
    if (massSimBtn) massSimBtn.disabled = false;
}

function validateBetAmount() {
    const input = document.getElementById('betting-amount');
    let val = parseInt(input.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > balance) val = Math.floor(balance);
    if (balance <= 0) val = 0;
    input.value = val;
}

function runBettingSimulation() {
    if (!bettingSelectedOutcome) return;

    validateBetAmount();
    const betAmount = parseInt(document.getElementById('betting-amount').value);

    if (balance <= 0) {
        showAlert('У вас нулевой баланс! Пожалуйста, пополните депозит.');
        openDepositModal();
        return;
    }
    if (betAmount <= 0 || betAmount > balance) {
        showAlert('Недостаточно средств на балансе!');
        return;
    }

    const btn = document.getElementById('betting-sim-btn');
    btn.disabled = true;

    const xgHome = parseFloat(document.getElementById('xg-home').value);
    const xgAway = parseFloat(document.getElementById('xg-away').value);

    // Hide previous result
    const resultDiv = document.getElementById('betting-match-result');
    resultDiv.style.display = 'none';

    // Score animation
    const scoreHomeEl = document.getElementById('score-home');
    const scoreAwayEl = document.getElementById('score-away');

    // Generate final result using Poisson
    const finalScore = simulateMatch(xgHome, xgAway);

    // Animate score reveal
    let animCount = 0;
    const maxAnim = 18;
    const animInterval = setInterval(() => {
        scoreHomeEl.textContent = Math.floor(Math.random() * 5);
        scoreAwayEl.textContent = Math.floor(Math.random() * 5);
        animCount++;
        if (animCount >= maxAnim) {
            clearInterval(animInterval);

            // Show final score
            scoreHomeEl.textContent = finalScore.home;
            scoreAwayEl.textContent = finalScore.away;
            resultDiv.style.display = 'block';
            resultDiv.style.animation = 'none';
            void resultDiv.offsetWidth; // force reflow
            resultDiv.style.animation = 'bettingScoreReveal 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

            // Determine win/lose
            setTimeout(() => {
                checkBetResult(finalScore);
            }, 600);
        }
    }, 80);
}

function checkBetResult(score) {
    const totalGoals = score.home + score.away;
    let actualOutcome = '';

    if (score.home > score.away) actualOutcome = 'p1';
    else if (score.home === score.away) actualOutcome = 'x';
    else actualOutcome = 'p2';

    const isOver = totalGoals > 2;
    const isUnder = totalGoals <= 2;

    let won = false;
    if (bettingSelectedOutcome === 'p1' && actualOutcome === 'p1') won = true;
    if (bettingSelectedOutcome === 'x' && actualOutcome === 'x') won = true;
    if (bettingSelectedOutcome === 'p2' && actualOutcome === 'p2') won = true;
    if (bettingSelectedOutcome === 'over' && isOver) won = true;
    if (bettingSelectedOutcome === 'under' && isUnder) won = true;

    const coeff = bettingOddsData.coefficients[bettingSelectedOutcome];
    const labels = { p1: 'П1 (Хозяева)', x: 'Х (Ничья)', p2: 'П2 (Гости)', over: 'Тотал Б 2.5', under: 'Тотал М 2.5' };

    const betAmount = parseInt(document.getElementById('betting-amount').value);

    if (won) {
        const winAmount = Math.floor(betAmount * coeff);
        const netProfit = winAmount - betAmount;
        balance += netProfit;
        updateGlobalBalance();
        showInlineNotif('win', `Счёт ${score.home}:${score.away}. Победа! Выплата: $${winAmount} (Чистыми: +$${netProfit})`);
        recordBet('betting', betAmount, 'win', winAmount);
    } else {
        balance -= betAmount;
        updateGlobalBalance();
        showInlineNotif('lose', `Счёт ${score.home}:${score.away}. Ставка проиграла (-$${betAmount}).`);
        recordBet('betting', betAmount, 'lose', 0);
    }

    // Re-enable
    document.getElementById('betting-sim-btn').disabled = false;
}

function showInlineNotif(type, message) {
    const notif = document.getElementById('betting-inline-notif');
    const icon = document.getElementById('betting-inline-icon');
    const text = document.getElementById('betting-inline-text');

    notif.style.display = 'flex';
    notif.className = 'betting-inline-notif show ' + type;

    if (type === 'win') {
        icon.textContent = '🎉';
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    } else {
        icon.textContent = '❌';
        if (navigator.vibrate) navigator.vibrate(200);
    }

    text.textContent = message;

    // Auto dismiss after 8 seconds
    if (notif.hideTimeout) clearTimeout(notif.hideTimeout);
    notif.hideTimeout = setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => { if (!notif.classList.contains('show')) notif.style.display = 'none'; }, 500);
    }, 8000);
}

// Auto-initialize odds when betting section is shown
const originalSwitchSection = switchSection;
switchSection = function (sectionId, clickedElement) {
    originalSwitchSection(sectionId, clickedElement);
    if (sectionId === 'betting') {
        setTimeout(() => {
            updateBettingOdds();
        }, 350);
    }
};

// ===== СИМУЛЯЦИЯ ИГР И ОТРИСОВКА ГРАФИКА =====
let simChartInstance = null;

function runSimulation(gameType) {
    const betInputId = gameType === 'slots' ? 'slot-bet' :
        gameType === 'wheel' ? 'wheel-bet' :
            gameType === 'dice' ? 'dice-bet' :
                gameType === 'coin' ? 'coin-bet' :
                    gameType === 'blackjack' ? 'bj-bet' :
                        gameType === 'rps' ? 'rps-bet' :
                            gameType === 'betting' ? 'betting-amount' : 'bet-amount';
    const betInput = document.getElementById(betInputId);
    if (!betInput) return;
    const bet = parseInt(betInput.value);

    if (balance <= 0) {
        showAlert('У вас нулевой баланс! Пожалуйста, пополните депозит для запуска симуляции.');
        openDepositModal();
        return;
    }

    // Валидация вынесена сюда для удержания баланса в минусе
    if (bet < 1) {
        showAlert('Некорректная ставка!');
        return;
    }

    const itersInput = document.getElementById(gameType + '-sim-iters');
    let iterations = itersInput ? parseInt(itersInput.value) : 100;
    if (iterations < 1) iterations = 1;
    if (iterations > 200) iterations = 200;

    let historyData = [];
    let currentBalance = balance;
    let initialBalance = balance;
    let wins = 0; let losses = 0; let draws = 0;

    for (let i = 1; i <= iterations; i++) {
        currentBalance -= bet;
        let payout = 0;

        switch (gameType) {
            case 'roulette': payout = fastPlayRoulette(bet); break;
            case 'slots': payout = fastPlaySlots(bet); break;
            case 'wheel': payout = fastPlayWheel(bet); break;
            case 'dice': payout = fastPlayDice(bet); break;
            case 'coin': payout = fastPlayCoin(bet); break;
            case 'blackjack': payout = fastPlayBlackjack(bet); break;
            case 'rps': payout = fastPlayRPS(bet); break;
            case 'betting': payout = fastPlayBetting(bet); break;
        }

        currentBalance += payout;

        let resultType = payout > bet ? 'win' : payout === bet ? 'draw' : 'lose';
        if (resultType === 'win') wins++;
        else if (resultType === 'lose') losses++;
        else draws++;

        historyData.push({
            iteration: i,
            balance: currentBalance,
            result: resultType
        });
    }

    balance = currentBalance;
    localStorage.setItem('casinoBalance', balance);
    // update global balance display
    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = Math.floor(balance);
    updateGlobalBalance();

    const totalWager = bet * iterations;
    const profit = currentBalance - initialBalance;
    const totalPayout = totalWager + profit;

    // update game stats
    gameStats.totalBets += totalWager;
    gameStats.totalWins += totalPayout;
    gameStats.winCount += wins;
    gameStats.loseCount += losses;
    gameStats.drawCount += draws;
    updateStats();

    // Записываем всю симуляцию как один пак в историю
    const gameNiceNames = {
        roulette: '🎡 Рулетка', slots: '🎰 Слоты', wheel: '🎪 Колесо',
        dice: '🎲 Кости', coin: '🟡 Монета', blackjack: '🃏 Блэкджек', rps: '✂️ КНБ',
        betting: '⚽ Фут. Ставки'
    };
    const niceName = gameNiceNames[gameType] || gameType;
    betHistory.unshift({
        game: `${niceName} (Симуляция)`,
        iterations: iterations,
        totalWager: totalWager,
        totalPayout: totalPayout,
        netProfit: profit,
        result: profit > 0 ? 'win' : (profit === 0 ? 'draw' : 'lose'),
        balanceAfter: Math.floor(balance),
        timestamp: Date.now()
    });
    if (betHistory.length > 50) betHistory.pop();
    saveBetHistory();
    renderBetHistory();

    showSimulationResult(initialBalance, currentBalance, iterations, bet, historyData, wins, draws, losses);
}

function fastPlayRoulette(bet) {
    // P(красное) = 18/37
    return Math.random() < (18 / 37) ? bet * 2 : 0;
}
function fastPlaySlots(bet) {
    // P(3 одинаковых) = 7/343
    return Math.random() < (7 / 343) ? bet * 10 : 0;
}
function fastPlayWheel(bet) {
    // Шанс 25% (4 символа)
    return Math.random() < 0.25 ? bet * 4 : 0;
}
function fastPlayDice(bet) {
    // Вероятность финальной суммы > 7 = 15 вариантов из 36
    return Math.random() < (15 / 36) ? bet * 2.4 : 0;
}
function fastPlayCoin(bet) {
    // Идеальные 50/50
    return Math.random() < 0.5 ? bet * 2 : 0;
}
function fastPlayBlackjack(bet) {
    // Чистая математика вероятностей классического блэкджека по стратегии
    const rand = Math.random();
    if (rand < 0.048) return bet * 2.5; // Блэкджек (шанс ~4.8%), платит 3:2
    if (rand < 0.4222) return bet * 2;  // Обычная победа (шанс суммарно 42.22%)
    if (rand < 0.5070) return bet;      // Ничья (шанс ~8.48%)
    return 0;                           // Поражение (все остальное)
}
function fastPlayRPS(bet) {
    // Победа 33.3%, Ничья 33.3%, Поражение 33.3%
    const rand = Math.random();
    if (rand < (1 / 3)) return bet * 2; // win
    if (rand < (2 / 3)) return bet;     // draw
    return 0; // lose
}
function fastPlayBetting(bet) {
    if (!bettingSelectedOutcome || !bettingOddsData || !bettingOddsData.fair) return 0;
    const map = {
        'p1': bettingOddsData.fair.pHome,
        'x': bettingOddsData.fair.pDraw,
        'p2': bettingOddsData.fair.pAway,
        'over': bettingOddsData.fair.pOver25,
        'under': bettingOddsData.fair.pUnder25
    };
    if (Math.random() < map[bettingSelectedOutcome]) {
        return bet * bettingOddsData.coefficients[bettingSelectedOutcome];
    }
    return 0;
}

function showSimulationResult(initialBalance, finalBalance, iterations, bet, historyData, wins, draws, losses) {
    const modal = document.getElementById('simModal');
    if (!modal) return;

    const profit = finalBalance - initialBalance;
    const profitClass = profit >= 0 ? 'win' : 'lose';

    const isLight = document.body.classList.contains('light-theme');
    const headerColor = isLight ? '#2c3e50' : '#ecf0f1';
    const subColor = isLight ? '#7f8c8d' : '#bdc3c7';

    document.getElementById('simResultHeader').innerHTML = `
        <h3 style="color: ${headerColor}; margin-bottom: 0.5rem;">Итоги симуляции (${iterations} игр)</h3>
        <p style="color: ${subColor}; margin-bottom: 0.5rem;">Начальный баланс: $${initialBalance} | Итоговый баланс: $${Math.floor(finalBalance)}</p>
        <p style="color: ${subColor}; font-size: 0.9rem; margin-bottom: 1rem;">
            <em>💡 График показывает изменение вашего баланса слева (ось Y) от каждой сыгранной партии снизу (ось X).</em>
        </p>
        <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 10px; font-weight: bold; font-size: 1.1rem;">
            <span style="color: #2ecc71;">✅ Побед: ${wins}</span>
            <span style="color: #e74c3c;">❌ Поражений: ${losses}</span>
            <span style="color: #f1c40f;">🤝 Ничьих: ${draws}</span>
        </div>
        <div class="result-message ${profitClass}" style="display: block; margin-bottom: 20px;">
            ${profit >= 0 ? '✅ Общая прибыль' : '❌ Общий убыток'}: $${Math.floor(Math.abs(profit))}
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Даем браузеру 50мс на отрисовку модального окна (DOM paint) 
    // перед тем как Chart.js начнет вычислять размеры Canvas. 
    // Это предотвращает жесткие фризы при первом запуске симуляций!
    setTimeout(() => {
        createChart(historyData, initialBalance, finalBalance, profit >= 0);
    }, 50);
}

function createChart(historyData, initialBalance, finalBalance, isProfit) {
    const ctx = document.getElementById('simChartCanvas').getContext('2d');

    if (simChartInstance) {
        simChartInstance.destroy();
    }

    const labels = historyData.map(d => d.iteration);
    labels.unshift(0);
    const dataPoints = historyData.map(d => Math.floor(d.balance));
    dataPoints.unshift(Math.floor(initialBalance));

    const isLight = document.body.classList.contains('light-theme');
    const textColor = isLight ? '#2c3e50' : '#ecf0f1';
    const gridColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
    const gridColorSubtle = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';

    let gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, isProfit ? 'rgba(46, 204, 113, 0.5)' : 'rgba(231, 76, 60, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

    const borderColor = isProfit ? '#2ecc71' : '#e74c3c';

    simChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Баланс (Bankroll)',
                data: dataPoints,
                borderColor: borderColor,
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 1,
                fill: true,
                tension: 0.2
            }]
        },
        options: {
            animation: false, // Отключаем медленную анимацию, из-за которой симуляция казалась "зависшей" или лагала
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: gridColor },
                    ticks: { color: textColor },
                    title: {
                        display: false
                    }
                },
                x: {
                    grid: { color: gridColorSubtle },
                    ticks: { color: textColor },
                    title: {
                        display: true,
                        text: 'Сыграно партий (Итерации)',
                        color: textColor,
                        font: { size: 12, weight: 'bold' }
                    }
                }
            },
            plugins: {
                legend: { labels: { color: textColor } },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return 'Баланс: $' + context.raw;
                        }
                    }
                }
            }
        }
    });
}

function closeSimulationDetails() {
    const modal = document.getElementById('simModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}



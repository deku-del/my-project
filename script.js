// ===== ПЕРЕМЕННЫЕ ИГРЫ =====
let balance = 1000;
let currentGame = null;
let gameStats = {
    totalBets: 0,
    totalWins: 0,
    winCount: 0,
    loseCount: 0
};

const gameDetailsData = {
    roulette: {
        title: "Европейская рулетка",
        rules: `
            <ul>
                <li><strong>Цель:</strong> Угадать, в какую из 37 ячеек (0-36) упадет шарик.</li>
                <li><strong>Ставки:</strong> Можно ставить на число, цвет (красное/черное), четное/нечетное, зеро, дюжина</li>
                <li><strong>Зеро (0):</strong> При выпадении 0 все ставки на простые шансы (цвет, четное/нечетное) проигрывают.</li>
                <li><strong>Выплаты:</strong>
                    <ul>
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
            <p><strong>Математическое ожидание:</strong></p>
            <div class="formula">E = (Sum(P_i * X_i)) - Bet</div>
            <p>Для ставки $1 на красное:</p>
            <div class="formula">E = (18/37 * 2) - 1 = 0.973 - 1 = -0.027</div>
            <p>На каждый поставленный $1 игрок теряет в среднем $0.027.</p>
            <p><strong>Распределение:</strong> Равномерное дискретное распределение (каждое число имеет вероятность 1/37).</p>
        `,
        history: "Рулетка была изобретена французским математиком Блезом Паскалем в 17 веке в попытке создать вечный двигатель. Название происходит от французского 'roulette' — маленькое колесо. Европейская версия с одним зеро была представлена братьями Блан в 1843 году в Бад-Хомбурге."
    },
    slots: {
        title: "Слот-машина",
        rules: `
            <ul>
                <li><strong>Цель:</strong> Собрать выигрышную комбинацию символов на линии выплат.</li>
                <li><strong>Механика:</strong> Игрок делает ставку и вращает барабаны. Результат определяется ГСЧ (Генератором Случайных Чисел).</li>
                <li><strong>В нашей версии:</strong> Победа (джекпот) достигается при выпадении трех одинаковых символов.</li>
                <li><strong>Выплата:</strong> 10 к 1.</li>
            </ul>
        `,
        description: "Классический 'однорукий бандит'. Слоты — самая популярная игра в казино, приносящая заведениям более 70% дохода. Современные слоты — это сложные компьютерные программы.",
        theory: `
            <p><strong>Вероятность джекпота (3 одинаковых):</strong></p>
            <p>Всего символов: 7. Всего комбинаций: 7^3 = 343.</p>
            <p>Выигрышных комбинаций (X-X-X): 7.</p>
            <div class="formula">P(Win) = 7/343 = 1/49 ≈ 2.04%</div>
            <p><strong>Преимущество казино:</strong></p>
            <div class="formula">House Edge = 1 - (P(Win) * Payout) = 1 - (0.0204 * 10) ≈ 79.6%</div>
            <p>Это очень высокий показатель (в реальных слотах он обычно 5-15%).</p>
        `,
        history: "Первый слот 'Liberty Bell' был создан Чарльзом Феем в 1895 году. Он имел три барабана и автоматическую систему выплат. В 1963 году Bally разработала первый полностью электромеханический слот 'Money Honey'."
    },
    wheel: {
        title: "Колесо фортуны",
        rules: `
            <ul>
                <li><strong>Цель:</strong> Угадать выигрышный сектор.</li>
                <li><strong>В нашей версии:</strong> Упрощенный вариант с шансом 50/50.</li>
                <li><strong>Выплата:</strong> 2 к 1.</li>
            </ul>
        `,
        description: "Простая и зрелищная игра, часто используемая в телешоу и на ярмарках. В казино известна как 'Big Six Wheel'.",
        theory: `
            <p><strong>Биномиальное распределение:</strong></p>
            <p>В нашей упрощенной версии это эквивалент подбрасывания монеты.</p>
            <div class="formula">P(Win) = 0.5</div>
            <div class="formula">E = (0.5 * 2) - 1 = 0</div>
            <p>В данной реализации это единственная 'честная' игра с нулевым преимуществом казино.</p>
        `,
        history: "Происхождение уходит корнями в древние колесницы и колеса, использовавшиеся для жребия. Современный вид игра приобрела в американских казино в конце 19 века."
    },
    dice: {
        title: "Крэпс",
        rules: `
            <ul>
                <li><strong>Цель:</strong> Угадать исход броска двух кубиков.</li>
                <li><strong>Ставки:</strong> Четное или Нечетное.</li>
                <li><strong>Механика:</strong> Бросаются два шестигранных кубика, сумма чисел определяет результат.</li>
                <li><strong>Выплата:</strong> 2 к 1.</li>
            </ul>
        `,
        description: "Крэпс — одна из самых динамичных и шумных игр в казино. Исторически кости использовались для предсказания будущего и азартных игр тысячи лет.",
        theory: `
            <p><strong>Распределение суммы двух кубиков:</strong></p>
            <p>Количество исходов: 36.</p>
            <ul>
                <li>P(Чет) = 18/36 = 0.5</li>
                <li>P(Нечет) = 18/36 = 0.5</li>
            </ul>
            <p>Распределение вероятностей сумм напоминает треугольник (пик на 7).</p>
        `,
        history: "Игра развилась из древней английской игры Hazard. В Новый Орлеан ее привез Бернар де Мариньи в начале 19 века, где она упростилась и получила название 'Crapaud' (жаба), позже превратившееся в Craps."
    },
    coin: {
        title: "Орел и решка",
        rules: `
            <ul>
                <li><strong>Цель:</strong> Угадать сторону монеты.</li>
                <li><strong>Шансы:</strong> Классические 50/50.</li>
                <li><strong>Выплата:</strong> 2 к 1.</li>
            </ul>
        `,
        description: "Самая древняя и простая азартная игра. Используется нами для демонстрации базовых принципов вероятности.",
        theory: `
            <p><strong>Независимые события:</strong></p>
            <p>Каждый бросок не зависит от предыдущего.</p>
            <p>Последовательность О-О-О-О-О имеет ту же вероятность, что и О-Р-О-Р-Р (1/32).</p>
        `,
        history: "Игра известна с времен Древнего Рима ('Navia aut caput' - Корабль или Голова). Встречается во всех культурах мира."
    },
    blackjack: {
        title: "Блэкджек",
        rules: `
            <ul>
                <li><strong>Цель:</strong> Набрать очков больше, чем у дилера, но не более 21.</li>
                <li><strong>Значения карт:</strong> 2-10 - номинал, Картинки - 10, Туз - 1 или 11.</li>
                <li><strong>Блэкджек:</strong> Туз + 10 (или картинка) с первых двух карт.</li>
            </ul>
        `,
        description: "Самая интеллектуальная игра в казино, где навыки игрока реально влияют на результат. При использовании 'базовой стратегии' преимущество казино минимально.",
        theory: `
            <p><strong>Зависимые события:</strong></p>
            <p>Карты выходят из колоды и вероятности меняются с каждой раздачей. На этом основан 'счет карт'.</p>
            <p>Вероятность перебора (Bust) растет нелинейно с увеличением суммы очков в руке.</p>
        `,
        history: "Происходит от французской игры 'Vingt-et-Un' (21), популярной в 17 веке. Название 'Blackjack' появилось в США, когда казино предлагали бонусную выплату за Туза пик и Валета пик (Black Jack)."
    },
    rps: {
        title: "Камень, Ножницы, Бумага",
        rules: `
            <ul>
                <li><strong>Цель:</strong> Победить компьютер в классической игре.</li>
                <li><strong>Правила:</strong>
                    <ul>
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
            <p><strong>Равновероятные исходы:</strong></p>
            <p>Если выбор противника случаен, вероятность победы, поражения и ничьей равна 1/3.</p>
            <p>В реальности люди не выбирают случайно, что открывает возможности для психологии и теории игр (равновесие Нэша).</p>
        `,
        history: "Игра возникла в Китае во времена династии Хань (206 г. до н.э. — 220 г. н.э.). В Европу попала только в 20 веке."
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
    balance = 1000;
    gameStats.totalBets = 0;
    gameStats.totalWins = 0;
    gameStats.winCount = 0;
    gameStats.loseCount = 0;

    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;

    updateStats();
    showToast('Баланс сброшен до $1000!');
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
        <div class="odds-display">
            <strong>Формула:</strong> P(красное) = 18/37 = <span style="color: #2ecc71;">48.6%</span> | P(зеро) = 1/37 = <span style="color: #f1c40f;">2.7%</span>
        </div>
       
        <div class="input-group">
            <label>Размер ставки ($)</label>
            <input type="number" id="bet-amount" min="10" max="500" value="50">
        </div>

        <div class="game-buttons grid-3">
            <button class="btn-play" onclick="playRoulette('red')">🔴 Красное</button>
            <button class="btn-play" style="background: #27ae60;" onclick="playRoulette('zero')">🟢 Зеро (0)</button>
            <button class="btn-play" onclick="playRoulette('black')">⚫ Черное</button>
        </div>

        <div style="margin-top: 1rem;">
            <button class="btn-reset" onclick="resetBalance()" style="width: 100%;">🔄 Сбросить баланс ($1000)</button>
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
    if (bet < 10 || bet > 500 || balance < bet) {
        showAlert('Некорректная ставка или недостаточно средств!');
        return;
    }

    balance -= bet;
    gameStats.totalBets += bet;

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
        const tempColor = tempNum === 0 ? '#2ecc71' : (tempNum % 2 === 0 ? 'white' : '#e74c3c');

        animDisplay.innerHTML = `<span style="color: ${tempColor}; font-size: 3rem; display: inline-block; transform: scale(${1 + Math.random() * 0.2}); opacity: 0.8;">${tempNum}</span>`;
        spins++;

        if (spins >= maxSpins) {
            clearInterval(interval);
            finishRoulette(color, bet);
        }
    }, 100);
}

function finishRoulette(color, bet) {
    const number = Math.floor(Math.random() * 37);
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

    let won = false;
    let payout = 2; // Default for red/black

    if (color === 'zero' && resultColor === 'zero') {
        won = true;
        payout = 36; // 35:1 for straight up
    } else if (color === resultColor) {
        won = true;
    }

    if (won) {
        const win = bet * payout;
        balance += win;
        gameStats.totalWins += win;
        gameStats.winCount++;
        resultDiv.className = 'result-message win';
        resultDiv.textContent = `✅ ВЫИГРЫШ! (+$${win}) Выпало: ${number} (${resultColor === 'zero' ? 'Зеро' : resultColor === 'black' ? 'Черное' : 'Красное'})`;
        playWinSound();
    } else {
        gameStats.loseCount++;
        resultDiv.className = 'result-message lose';
        resultDiv.textContent = `❌ ПРОИГРЫШ! (-$${bet}) Выпало: ${number} (${resultColor === 'zero' ? 'Зеро' : resultColor === 'black' ? 'Черное' : 'Красное'})`;
        playLoseSound();
    }

    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;
    updateStats();
}

// ===== СЛОТЫ (Без изменений) =====
function createSlotsGame() {
    return `
        <h2>🎰 Слот-машина</h2>
        <div class="odds-display">
            <strong>Формула:</strong> P(3 одинаковых) = 7/343 = <span style="color: #2ecc71;">2%</span> | Казино: <span style="color: #e74c3c;">93%</span>
        </div>
        
        <div class="input-group">
            <label>Размер ставки ($)</label>
            <input type="number" id="slot-bet" min="10" max="500" value="50">
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
            <button class="btn-reset" onclick="resetBalance()" style="width: 100%;">🔄 Сбросить баланс ($1000)</button>
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
    if (bet < 10 || bet > 500 || balance < bet) {
        showAlert('Некорректная ставка или недостаточно средств!');
        return;
    }

    balance -= bet;
    gameStats.totalBets += bet;

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
        const finalReels = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];

        document.getElementById('reel1').textContent = finalReels[0];
        document.getElementById('reel2').textContent = finalReels[1];
        document.getElementById('reel3').textContent = finalReels[2];
        const balanceDisplay = document.getElementById('balance-display');
        if (balanceDisplay) balanceDisplay.textContent = balance;

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
            // Pulse animation for win
            slotDisplay.style.animation = 'winPulse 0.6s ease';
        } else {
            gameStats.loseCount++;
            resultDiv.className = 'result-message lose';
            resultDiv.textContent = `❌ Не повезло (-$${bet})`;
            // Shake animation for loss
            slotDisplay.style.animation = 'shake 0.5s ease';
            playLoseSound();
        }

        updateStats();
    }, 1000);
}

// ===== КОЛЕСО (Добавлен Клевер) =====
function createWheelGame() {
    return `
        <h2>🎪 Колесо фортуны</h2>
        <div class="odds-display">
            <strong>Коэффициенты:</strong> 4 символа, Шанс 25%. Выплата: 4 к 1.
        </div>
        
        <div class="input-group">
            <label>Размер ставки ($)</label>
            <input type="number" id="wheel-bet" min="10" max="500" value="50">
        </div>

        <div class="game-buttons grid-2">
            <button class="btn-play" onclick="playWheel('star')">⭐ Звезда</button>
            <button class="btn-play" onclick="playWheel('heart')">❤️ Сердце</button>
            <button class="btn-play" onclick="playWheel('diamond')">💎 Алмаз</button>
            <button class="btn-play" onclick="playWheel('clover')">🍀 Клевер</button>
        </div>

        <div style="margin-top: 1rem;">
            <button class="btn-reset" onclick="resetBalance()" style="width: 100%;">🔄 Сбросить баланс ($1000)</button>
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
    if (bet < 10 || bet > 500 || balance < bet) {
        showAlert('Некорректная ставка или недостаточно средств!');
        return;
    }

    balance -= bet;
    gameStats.totalBets += bet;

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
    const resultSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const resultDiv = document.getElementById('wheel-result');
    const animDisplay = document.getElementById('wheel-anim');

    // Маппинг для сравнения
    const choiceMap = { 'star': '⭐', 'heart': '❤️', 'diamond': '💎', 'clover': '🍀' };
    const won = choiceMap[choice] === resultSymbol;

    if (animDisplay) {
        animDisplay.textContent = resultSymbol;
        animDisplay.style.animation = 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }

    if (won) {
        const win = bet * 4; // 4 к 1
        balance += win;
        gameStats.totalWins += win;
        gameStats.winCount++;
        resultDiv.className = 'result-message win';
        resultDiv.textContent = `✅ ВЫИГРЫШ! (+$${win}) Выпал символ: ${resultSymbol}`;
        playWinSound();
    } else {
        gameStats.loseCount++;
        resultDiv.className = 'result-message lose';
        resultDiv.textContent = `❌ ПРОИГРЫШ! (-$${bet}) Выпал символ: ${resultSymbol}`;
        playLoseSound();
    }
    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;
    updateStats();
}

// ===== КОСТИ (Переработано: БОЛЬШЕ/МЕНЬШЕ 7) =====
function createDiceGame() {
    return `
        <h2>🎲 Крэпс</h2>
        <div class="odds-display">
            <strong>Ставки:</strong> <7 (Выплата 2.4x) | 7 (Выплата 5x) | >7 (Выплата 2.4x)
        </div>
        
        <div class="input-group">
            <label>Размер ставки ($)</label>
            <input type="number" id="dice-bet" min="10" max="500" value="50">
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
            <button class="btn-reset" onclick="resetBalance()" style="width: 100%;">🔄 Сбросить баланс ($1000)</button>
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
    if (bet < 10 || bet > 500 || balance < bet) {
        showAlert('Некорректная ставка или недостаточно средств!');
        return;
    }

    balance -= bet;
    gameStats.totalBets += bet;

    const dice1 = document.getElementById('dice1');
    const dice2 = document.getElementById('dice2');

    // Generate final result FIRST
    const finalD1 = Math.floor(Math.random() * 6) + 1;
    const finalD2 = Math.floor(Math.random() * 6) + 1;
    const finalSum = finalD1 + finalD2;

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
        } else {
            gameStats.loseCount++;
            resultDiv.className = 'result-message lose';
            resultDiv.textContent = `❌ ПРОИГРЫШ! Сумма: ${finalSum} (-$${bet})`;
            playLoseSound();
        }

        const balanceDisplay = document.getElementById('balance-display');
        if (balanceDisplay) balanceDisplay.textContent = balance;
        updateStats();
    }, 1050);
}

// ===== МОНЕТА  =====
function createCoinGame() {
    return `
        <h2>🟡 Орел и 🟠 Решка</h2>
        <div class="odds-display">
            <strong>Шансы:</strong> Идеальные 50/50. Выплата 2 к 1.
        </div>
        
        <div class="input-group">
            <label>Размер ставки ($)</label>
            <input type="number" id="coin-bet" min="10" max="500" value="50">
        </div>

        <div class="game-buttons">
            <button class="btn-play" onclick="playCoin('heads')">🟡 Орел</button>
            <button class="btn-play" onclick="playCoin('tails')">🟠 Решка</button>
        </div>

        <div id="coin-display" class="game-display">
            <div id="coin-visual" class="coin-visual">🟡</div>
        </div>

        <div style="margin-top: 1rem;">
            <button class="btn-reset" onclick="resetBalance()" style="width: 100%;">🔄 Сбросить баланс ($1000)</button>
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
    if (bet < 10 || bet > 500 || balance < bet) {
        showAlert('Некорректная ставка или недостаточно средств!');
        return;
    }

    balance -= bet;
    gameStats.totalBets += bet;

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
        const result = Math.random() < 0.5 ? 'heads' : 'tails';

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
        } else {
            gameStats.loseCount++;
            resultDiv.className = 'result-message lose';
            resultDiv.style.display = 'block';
            resultDiv.textContent = `❌ ПРОИГРЫШ! Выпал: ${result === 'heads' ? 'Орел 🟡' : 'Решка 🟠'} (-$${bet})`;
            playLoseSound();
        }

        const balanceDisplay = document.getElementById('balance-display');
        if (balanceDisplay) balanceDisplay.textContent = balance;
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
        <div class="odds-display">
            <strong>Стратегия:</strong> Дилер берет карты до 17. Блэкджек платит 3:2.
        </div>
        
        <div class="input-group">
            <label>Размер ставки ($)</label>
            <input type="number" id="bj-bet" min="10" max="500" value="50">
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
                <div style="margin-bottom: 10px; color: #f39c12; font-weight: bold;">👤 ВЫ</div>
                <div id="player-cards" class="bj-cards-area"></div>
                <div id="player-sum" style="margin-top: 5px; font-weight: bold; font-size: 1.2rem;">0</div>
            </div>
            
            <div style="width: 2px; background: rgba(255,255,255,0.1);"></div>

            <div class="bj-hand-container">
                <div style="margin-bottom: 10px; color: #e74c3c; font-weight: bold;">🎰 ДИЛЕР</div>
                <div id="dealer-cards" class="bj-cards-area"></div>
                <div id="dealer-sum" style="margin-top: 5px; font-weight: bold; font-size: 1.2rem;">0</div>
            </div>
        </div>

        <div style="margin-top: 1rem;">
            <button class="btn-reset" onclick="resetBalance()" style="width: 100%;">🔄 Сбросить баланс ($1000)</button>
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
    if (bet < 10 || bet > 500 || balance < bet) {
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
    } else if (dSum > 21) {
        const win = bjBet * 2;
        balance += win;
        gameStats.totalWins += win;
        gameStats.winCount++;
        resultDiv.className = 'result-message win';
        resultDiv.textContent = `✅ ПОБЕДА (ДИЛЕР ПЕРЕБРАЛ!) (+$${win})`;
        playWinSound();
    } else if (pSum > dSum) {
        let payout = 2;
        if (pSum === 21 && bjPlayerHand.length === 2) payout = 2.5; // Blackjack pay
        const win = Math.floor(bjBet * payout);
        balance += win;
        gameStats.totalWins += win;
        gameStats.winCount++;
        resultDiv.className = 'result-message win';
        resultDiv.textContent = `✅ ПОБЕДА! ${pSum} > ${dSum} (+$${win})`;
        playWinSound();
    } else if (pSum === dSum) {
        balance += bjBet;
        resultDiv.className = 'result-message draw';
        resultDiv.textContent = `🤝 НИЧЬЯ! Возврат ставки.`;
    } else {
        gameStats.loseCount++;
        resultDiv.className = 'result-message lose';
        resultDiv.textContent = `❌ ПРОИГРЫШ! Дилер (${dSum}) > Вы (${pSum}).`;
        playLoseSound();
    }

    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;
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
        <div class="odds-display">
            <strong>Вероятности:</strong> Победа 33.3% | Ничья 33.3% | Поражение 33.3%
        </div>
        
        <div class="input-group">
            <label>Размер ставки ($)</label>
            <input type="number" id="rps-bet" min="10" max="500" value="50">
        </div>

        <div class="game-buttons grid-3">
            <button class="btn-play" onclick="playRPS('rock')" style="background: linear-gradient(135deg, #7f8c8d, #95a5a6);">🗿 Камень</button>
            <button class="btn-play" onclick="playRPS('scissors')" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">✂️ Ножницы</button>
            <button class="btn-play" onclick="playRPS('paper')" style="background: linear-gradient(135deg, #ecf0f1, #bdc3c7); color: #2c3e50;">📄 Бумага</button>
        </div>

        <div class="game-display rps-display">
            <div id="player-choice" class="rps-choice">❓</div>
            <div style="font-size: 3rem; color: #e94560;">VS</div>
            <div id="ai-choice" class="rps-choice">❓</div>
        </div>

        <div style="margin-top: 1rem;">
            <button class="btn-reset" onclick="resetBalance()" style="width: 100%;">🔄 Сбросить баланс ($1000)</button>
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
    if (bet < 10 || bet > 500 || balance < bet) {
        showAlert('Некорректная ставка или недостаточно средств!');
        return;
    }

    balance -= bet;
    gameStats.totalBets += bet;

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
    const moves = ['rock', 'scissors', 'paper'];
    const icons = { 'rock': '🗿', 'scissors': '✂️', 'paper': '📄' };
    const aiMove = moves[Math.floor(Math.random() * 3)];

    document.getElementById('player-choice').textContent = icons[playerMove];
    document.getElementById('ai-choice').textContent = icons[aiMove];

    const resultDiv = document.getElementById('rps-result');
    let result = '';

    // Логика победы
    if (playerMove === aiMove) {
        result = 'draw';
    } else if (
        (playerMove === 'rock' && aiMove === 'scissors') ||
        (playerMove === 'scissors' && aiMove === 'paper') ||
        (playerMove === 'paper' && aiMove === 'rock')
    ) {
        result = 'win';
    } else {
        result = 'lose';
    }


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
    } else if (result === 'draw') {
        balance += bet; // Возврат ставки
        resultDiv.className = 'result-message draw';
        resultDiv.style.display = 'block';
        resultDiv.textContent = `🤝 НИЧЬЯ! (Ставка возвращена)`;
    } else {
        gameStats.loseCount++;
        resultDiv.className = 'result-message lose';
        resultDiv.style.display = 'block';
        resultDiv.textContent = `❌ ПОРАЖЕНИЕ! (-$${bet})`;
        document.querySelector('.rps-display').style.animation = 'shake 0.5s ease';
        playLoseSound();
    }


    const balanceDisplay = document.getElementById('balance-display');
    if (balanceDisplay) balanceDisplay.textContent = balance;
    updateStats();
}

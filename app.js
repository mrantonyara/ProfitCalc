document.addEventListener('DOMContentLoaded', () => {
    // Вводы
    const priceInput = document.getElementById('item-price');
    const kaspiGoldBonusInput = document.getElementById('kaspi-gold-bonus');
    const kartaPercentChips = document.querySelectorAll('#karta-percent-chips .chip');
    
    // Рассрочка
    const kaspiPromoToggle = document.getElementById('kaspi-promo-toggle');
    const installmentBonusContainer = document.getElementById('installment-bonus-container');
    const installmentBonusInput = document.getElementById('installment-bonus');
    const monthChips = document.querySelectorAll('#installment-months .chip');
    const depositRadios = document.querySelectorAll('input[name="deposit-type"]');
    
    // Итоги (DOM элементы)
    const valKarta = document.getElementById('val-karta');
    const valInst = document.getElementById('val-inst');
    const valGold = document.getElementById('val-gold');
    const valIron = document.getElementById('val-iron');
    
    const descKarta = document.getElementById('desc-karta');
    const descInst = document.getElementById('desc-inst');
    
    const earlyPayoffBox = document.getElementById('early-payoff-box');
    const payoffMonth = document.getElementById('payoff-month');

    // Состояние калькулятора
    let state = {
        price: 0,
        kaspiGoldBonusAmount: 0, 
        customCashbackRate: 5,   
        installmentMonths: 12,
        installmentBonus: 0,     
        depositRate: 17.4
    };

    const formatMoney = (amount) => Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' ₸';

    const parseNumber = (val) => {
        const rawValue = val.replace(/\s+/g, '');
        return parseFloat(rawValue) || 0;
    };

    const formattedInputs = document.querySelectorAll('.formatted-input');
    formattedInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
            if (val !== '') {
                val = val.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }
            e.target.value = val;
        });
    });

    // Слушатели событий
    priceInput.addEventListener('input', (e) => { state.price = parseNumber(e.target.value); calculate(); });
    kaspiGoldBonusInput.addEventListener('input', (e) => { state.kaspiGoldBonusAmount = parseNumber(e.target.value); calculate(); });

    kartaPercentChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            kartaPercentChips.forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            state.customCashbackRate = parseFloat(e.target.dataset.percent);
            calculate();
        });
    });

    kaspiPromoToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            installmentBonusContainer.classList.remove('hidden');
        } else {
            installmentBonusContainer.classList.add('hidden');
            installmentBonusInput.value = '';
            state.installmentBonus = 0;
        }
        calculate();
    });

    installmentBonusInput.addEventListener('input', (e) => { state.installmentBonus = parseNumber(e.target.value); calculate(); });

    monthChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            monthChips.forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            state.installmentMonths = parseInt(e.target.dataset.months);
            calculate();
        });
    });

    depositRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.depositRate = e.target.value === 'moya-cel' ? 17.4 : 14.5;
            calculate();
        });
    });

    // Главная логика
    function calculate() {
        if (state.price <= 0) {
            valKarta.textContent = '0 ₸';
            valInst.textContent = '0 ₸';
            valGold.textContent = '0 ₸';
            valIron.textContent = '0 ₸';
            earlyPayoffBox.classList.add('hidden');
            
            // Сброс стилей лучших вариантов
            document.querySelectorAll('.result-item').forEach(el => {
                el.style.background = 'transparent';
                el.style.border = 'none';
            });
            return;
        }

        // 1. BCC ironCard
        const ironBenefit = state.price * 0.04;

        // 2. Kaspi Gold
        const goldBenefit = state.kaspiGoldBonusAmount;

        // 3. BCC #картакарта (кешбэк + грейс 85 дней)
        let kartaCashback = state.price * (state.customCashbackRate / 100);
        if (kartaCashback > 20000) kartaCashback = 20000;
        const graceInterest = state.price * (state.depositRate / 100 / 365) * 85;
        const kartaBenefit = kartaCashback + graceInterest;

        // 4. Рассрочка (депозит + бонус)
        let balance = state.price;
        let instInterest = 0;
        const monthlyPayment = state.price / state.installmentMonths;
        const monthlyRate = (state.depositRate / 100) / 12;

        let interestHistory = [];
        for (let m = 1; m <= state.installmentMonths; m++) {
            const interest = balance * monthlyRate;
            instInterest += interest;
            balance = balance + interest - monthlyPayment;
            interestHistory.push(instInterest);
        }
        const instBenefit = instInterest + state.installmentBonus;

        // Обновляем UI значений
        valIron.textContent = formatMoney(ironBenefit);
        valGold.textContent = formatMoney(goldBenefit);
        valKarta.textContent = formatMoney(kartaBenefit);
        valInst.textContent = formatMoney(instBenefit);

        descKarta.textContent = kartaCashback >= 20000 ? `Лимит 20к + ${formatMoney(graceInterest)} грейс` : `Кешбэк + ${formatMoney(graceInterest)} грейс`;
        descInst.textContent = state.installmentBonus > 0 ? `Проценты + ${formatMoney(state.installmentBonus)} бонус` : `Доход по депозиту`;

        // Определяем победителя
        const benefits = [
            { id: 'res-karta', val: kartaBenefit },
            { id: 'res-inst', val: instBenefit },
            { id: 'res-gold', val: goldBenefit },
            { id: 'res-iron', val: ironBenefit }
        ];
        
        // Сортируем DOM элементы (по желанию можно менять порядок в DOM, но лучше просто подсветить)
        benefits.sort((a, b) => b.val - a.val);
        const maxVal = benefits[0].val;

        // Подсвечиваем самый выгодный (и убираем с остальных)
        document.querySelectorAll('.result-item').forEach(el => {
            if (el.id === benefits[0].id && maxVal > 0) {
                el.style.background = '#f2fff5'; // Light green
                el.style.border = '1px solid #2ecc71';
                el.style.borderRadius = '12px';
                el.style.padding = '8px';
                el.style.margin = '4px -8px'; // Compensate padding
            } else {
                el.style.background = 'transparent';
                el.style.border = 'none';
                el.style.padding = '16px 0';
                el.style.margin = '0';
            }
        });

        // Досрочное погашение
        // Находим лучший карточный метод
        const bestCardBenefit = Math.max(ironBenefit, goldBenefit, kartaBenefit);
        let earlyMonth = -1;

        if (instBenefit > bestCardBenefit) {
            for (let m = 0; m < state.installmentMonths; m++) {
                if ((interestHistory[m] + state.installmentBonus) >= bestCardBenefit) {
                    earlyMonth = m + 1;
                    break;
                }
            }
        }

        if (earlyMonth !== -1 && earlyMonth <= state.installmentMonths && maxVal === instBenefit) {
            earlyPayoffBox.classList.remove('hidden');
            payoffMonth.textContent = `На ${earlyMonth}-й месяц`;
        } else {
            earlyPayoffBox.classList.add('hidden');
        }
    }
});

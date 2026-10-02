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

    const instRecBox = document.getElementById('installment-recommendation');

    // Состояние калькулятора
    let state = {
        price: 0,
        kaspiGoldBonusAmount: 0, 
        customCashbackRate: 0,   
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
    
    function getInstallmentBenefit(months, price, rate, bonus) {
        let bal = price;
        let totInt = 0;
        const mRate = (rate / 100) / 12;
        const pmt = price / months;
        for (let m = 1; m <= months; m++) {
            const interest = bal * mRate;
            totInt += interest;
            bal = bal + interest - pmt;
        }
        return totInt + bonus;
    }

    // Главная логика
    function calculate() {
        if (state.price <= 0) {
            valKarta.textContent = '0 ₸';
            valInst.textContent = '0 ₸';
            valGold.textContent = '0 ₸';
            valIron.textContent = '0 ₸';
            earlyPayoffBox.classList.add('hidden');
            instRecBox.classList.add('hidden');
            
            // Сброс стилей лучших вариантов
            document.querySelectorAll('.result-item').forEach(el => {
                el.style.background = 'transparent';
                el.style.border = 'none';
            });
            return;
        }

        // Месячная ставка
        const monthlyRate = (state.depositRate / 100) / 12;

        // 1. BCC ironCard (Кешбэк + процент на кешбэк за время рассрочки)
        let ironCashback = state.price * 0.04;
        let ironBenefit = ironCashback * Math.pow(1 + monthlyRate, state.installmentMonths);

        // 2. Kaspi Gold
        let goldBenefit = state.kaspiGoldBonusAmount * Math.pow(1 + monthlyRate, state.installmentMonths);

        // 3. BCC #картакарта (кешбэк + грейс 85 дней)
        let kartaBenefit = 0;
        let kartaCashback = 0;
        let graceInterest = 0;
        const resKarta = document.getElementById('res-karta');

        if (state.customCashbackRate === 0) {
            kartaBenefit = -1; // Дисквалифицируем
            valKarta.textContent = '—';
            descKarta.textContent = 'Недоступно';
            resKarta.style.opacity = '0.4';
            resKarta.style.filter = 'grayscale(100%)';
        } else {
            kartaCashback = state.price * (state.customCashbackRate / 100);
            if (kartaCashback > 20000) kartaCashback = 20000;
            graceInterest = state.price * (state.depositRate / 100 / 365) * 85;
            
            let baseKarta = kartaCashback + graceInterest;
            let remainingMonths = state.installmentMonths - (85 / 30.416);
            if (remainingMonths > 0) {
                kartaBenefit = baseKarta * Math.pow(1 + monthlyRate, remainingMonths);
            } else {
                kartaBenefit = baseKarta;
            }

            valKarta.textContent = formatMoney(kartaBenefit);
            descKarta.textContent = kartaCashback >= 20000 ? `Лимит 20к + ${formatMoney(graceInterest)} грейс` : `Кешбэк + ${formatMoney(graceInterest)} грейс`;
            resKarta.style.opacity = '1';
            resKarta.style.filter = 'none';
        }

        // 4. Рассрочка (депозит + бонус)
        let balance = state.price;
        let instInterest = 0;
        const monthlyPayment = state.price / state.installmentMonths;

        let interestHistory = [];
        for (let m = 1; m <= state.installmentMonths; m++) {
            const interest = balance * monthlyRate;
            instInterest += interest;
            balance = balance + interest - monthlyPayment;
            interestHistory.push(instInterest);
        }
        const instBenefit = instInterest + state.installmentBonus;
        
        // Рекомендация по рассрочке
        const maxInstBenefit = getInstallmentBenefit(24, state.price, state.depositRate, state.installmentBonus);
        instRecBox.classList.remove('hidden');
        if (state.installmentMonths < 24) {
            const diff = maxInstBenefit - instBenefit;
            instRecBox.style.color = '#d35400';
            instRecBox.style.background = '#fdf2e9';
            instRecBox.style.borderColor = '#fcecdb';
            instRecBox.innerHTML = `💡 <strong>Совет:</strong> выберите 24 месяца. Деньги дольше пролежат на депозите, и вы заработаете еще <strong>+${formatMoney(diff)}</strong>.`;
        } else {
            instRecBox.style.color = '#27ae60';
            instRecBox.style.background = '#eef8f1';
            instRecBox.style.borderColor = '#bcf0c2';
            instRecBox.innerHTML = `💡 <strong>Отличный выбор!</strong> 24 месяца дадут максимальный доход по депозиту.`;
        }

        // Обновляем UI значений
        valIron.textContent = formatMoney(ironBenefit);
        valGold.textContent = formatMoney(goldBenefit);
        valInst.textContent = formatMoney(instBenefit);

        descInst.textContent = state.installmentBonus > 0 ? `Проценты + ${formatMoney(state.installmentBonus)} бонус` : `Доход по депозиту`;

        // Определяем победителя
        const benefits = [
            { id: 'res-karta', val: kartaBenefit, name: 'BCC #картакарта' },
            { id: 'res-inst', val: instBenefit, name: 'рассрочки' },
            { id: 'res-gold', val: goldBenefit, name: 'Kaspi Gold' },
            { id: 'res-iron', val: ironBenefit, name: 'BCC ironCard' }
        ];
        
        const maxVal = Math.max(...benefits.map(b => b.val));

        // Подсвечиваем самый выгодный (и убираем с остальных), добавляем подсказки
        benefits.forEach(item => {
            const el = document.getElementById(item.id);
            
            // Формируем детальное объяснение
            let explanation = '';
            if (item.id === 'res-karta') {
                explanation = `Включает ${formatMoney(kartaCashback)} кешбэка и ${formatMoney(graceInterest)} за 85 дней грейса, которые затем продолжат приносить процент на депозите.`;
            } else if (item.id === 'res-inst') {
                explanation = `Вы заработаете ${formatMoney(instInterest)} процентов на депозите за ${state.installmentMonths} мес.` + (state.installmentBonus > 0 ? ` + ${formatMoney(state.installmentBonus)} по акции.` : '');
            } else if (item.id === 'res-gold') {
                explanation = `Вы получите ${formatMoney(state.kaspiGoldBonusAmount)} Kaspi бонусов сразу, и они (как эквивалент денег) принесут процент на депозите за ${state.installmentMonths} мес.`;
            } else if (item.id === 'res-iron') {
                explanation = `Вы получите ${formatMoney(ironCashback)} кешбэка деньгами сразу, и они принесут сложный процент на депозите за ${state.installmentMonths} мес.`;
            }

            // Создаем или находим кастомный тултип
            let tooltipEl = el.querySelector('.kaspi-tooltip');
            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.className = 'kaspi-tooltip';
                el.appendChild(tooltipEl);
            }
            
            // Очищаем стандартный тултип
            el.removeAttribute('title');

            if (item.val === maxVal && maxVal > 0) {
                el.style.background = '#fff5f5'; // Light red/pink
                el.style.border = '1px solid var(--primary)';
                el.style.borderRadius = '12px';
                el.style.padding = '8px';
                el.style.margin = '4px -8px';
                
                tooltipEl.innerHTML = `<div style="color: #2ecc71; font-weight: 700; margin-bottom: 4px;">🏆 Самый выгодный вариант!</div><div style="color: #8e8e93; font-size: 13px; margin-bottom: 6px;">${explanation}</div><div style="font-weight: 700;">Итоговая выгода: <span class="text-red">${formatMoney(item.val)}</span></div>`;
            } else {
                el.style.background = 'transparent';
                el.style.border = 'none';
                el.style.padding = '16px 0';
                el.style.margin = '0';
                if (item.val === -1) {
                    tooltipEl.innerHTML = `Этот способ оплаты недоступен, так как процент кешбэка установлен на 0.`;
                } else if (maxVal > 0) {
                    const diff = maxVal - item.val;
                    tooltipEl.innerHTML = `<div style="color: var(--primary); font-weight: 700; margin-bottom: 4px;">❌ Уступает на ${formatMoney(diff)}</div><div style="color: #8e8e93; font-size: 13px; margin-bottom: 6px;">${explanation}</div><div style="font-weight: 700;">Итоговая выгода: <span class="text-red">${formatMoney(item.val)}</span></div>`;
                } else {
                    tooltipEl.innerHTML = '';
                }
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
            
            const date = new Date();
            date.setMonth(date.getMonth() + earlyMonth);
            const formatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });
            let futureDate = formatter.format(date);
            // Делаем с большой буквы и убираем " г."
            futureDate = futureDate.charAt(0).toUpperCase() + futureDate.slice(1).replace(' г.', '');
            
            payoffMonth.textContent = `На ${earlyMonth}-й месяц (${futureDate})`;
        } else {
            earlyPayoffBox.classList.add('hidden');
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Елементы DOM
    const priceInput = document.getElementById('item-price');
    const cardRadios = document.querySelectorAll('input[name="card-type"]');
    
    const customCashbackPercentContainer = document.getElementById('custom-cashback-percent-container');
    const kartaPercentChips = document.querySelectorAll('#karta-percent-chips .chip');
    
    const customCashbackAmountContainer = document.getElementById('custom-cashback-amount-container');
    const customCashbackAmountInput = document.getElementById('custom-cashback-amount');
    
    const bccKartaWarning = document.getElementById('bcc-karta-warning');
    const calcCashbackAmount = document.getElementById('calc-cashback-amount');
    
    // Грейс-период
    const gracePeriodContainer = document.getElementById('grace-period-container');
    const calcGraceInterest = document.getElementById('calc-grace-interest');
    const calcTotalCardBenefit = document.getElementById('calc-total-card-benefit');
    
    const monthChips = document.querySelectorAll('#installment-months .chip');
    const calcMonthlyPayment = document.getElementById('calc-monthly-payment');
    
    const kaspiPromoToggle = document.getElementById('kaspi-promo-toggle');
    const installmentBonusContainer = document.getElementById('installment-bonus-container');
    const installmentBonusInput = document.getElementById('installment-bonus');

    const depositRadios = document.querySelectorAll('input[name="deposit-type"]');
    const calcTotalInterest = document.getElementById('calc-total-interest');
    
    const summaryText = document.getElementById('summary-text');
    const earlyPayoffBox = document.getElementById('early-payoff-box');
    const payoffMonth = document.getElementById('payoff-month');

    // Состояние калькулятора
    let state = {
        price: 0,
        cardType: 'bcc-iron',
        customCashbackRate: 5,   
        kaspiGoldBonusAmount: 0, 
        installmentMonths: 12,
        installmentBonus: 0,     
        depositRate: 17.4
    };

    // Форматирование чисел для вывода
    const formatMoney = (amount) => {
        return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' ₸';
    };

    // Парсинг числа из строки
    const parseNumber = (val) => {
        const rawValue = val.replace(/\s+/g, '');
        return parseFloat(rawValue) || 0;
    };

    // Автоматическое форматирование инпутов с пробелами
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

    // Обработчики событий
    priceInput.addEventListener('input', (e) => {
        state.price = parseNumber(e.target.value);
        calculate();
    });

    cardRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.cardType = e.target.value;
            
            if (state.cardType === 'bcc-karta') {
                customCashbackPercentContainer.classList.remove('hidden');
                customCashbackAmountContainer.classList.add('hidden');
                
                // Сброс к 5% при выборе карты
                kartaPercentChips.forEach(c => c.classList.remove('active'));
                kartaPercentChips[0].classList.add('active');
                state.customCashbackRate = 5;
            } else if (state.cardType === 'kaspi-gold') {
                customCashbackPercentContainer.classList.add('hidden');
                customCashbackAmountContainer.classList.remove('hidden');
                
                customCashbackAmountInput.value = '';
                state.kaspiGoldBonusAmount = 0;
            } else {
                customCashbackPercentContainer.classList.add('hidden');
                customCashbackAmountContainer.classList.add('hidden');
            }
            calculate();
        });
    });

    kartaPercentChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            kartaPercentChips.forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            state.customCashbackRate = parseFloat(e.target.dataset.percent);
            calculate();
        });
    });

    customCashbackAmountInput.addEventListener('input', (e) => {
        state.kaspiGoldBonusAmount = parseNumber(e.target.value);
        calculate();
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

    installmentBonusInput.addEventListener('input', (e) => {
        state.installmentBonus = parseNumber(e.target.value);
        calculate();
    });

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
            if (e.target.value === 'moya-cel') {
                state.depositRate = 17.4;
            } else {
                state.depositRate = 14.5;
            }
            calculate();
        });
    });

    // Главная логика расчета
    function calculate() {
        if (state.price <= 0) {
            calcCashbackAmount.textContent = '0 ₸';
            calcMonthlyPayment.textContent = '0 ₸';
            calcTotalInterest.textContent = '0 ₸';
            gracePeriodContainer.classList.add('hidden');
            summaryText.textContent = 'Введите стоимость товара, чтобы увидеть расчет.';
            earlyPayoffBox.classList.add('hidden');
            bccKartaWarning.classList.add('hidden');
            return;
        }

        // 1. Расчет кешбэка при покупке сразу картой
        let cardCashback = 0;
        let isBccKartaCapped = false;
        let graceInterest = 0;

        if (state.cardType === 'bcc-iron') {
            cardCashback = state.price * 0.04;
        } else if (state.cardType === 'bcc-karta') {
            cardCashback = state.price * (state.customCashbackRate / 100);
            if (cardCashback > 20000) {
                cardCashback = 20000;
                isBccKartaCapped = true;
            }
            // Выгода за 85 дней (грейс-период)
            // (Стоимость * Годовая ставка / 365) * 85 дней
            graceInterest = state.price * (state.depositRate / 100 / 365) * 85;
        } else if (state.cardType === 'kaspi-gold') {
            cardCashback = state.kaspiGoldBonusAmount;
        }

        calcCashbackAmount.textContent = formatMoney(cardCashback);
        
        const totalCardBenefit = cardCashback + graceInterest;

        if (state.cardType === 'bcc-karta') {
            gracePeriodContainer.classList.remove('hidden');
            calcGraceInterest.textContent = formatMoney(graceInterest);
            calcTotalCardBenefit.textContent = formatMoney(totalCardBenefit);
        } else {
            gracePeriodContainer.classList.add('hidden');
        }

        if (isBccKartaCapped) {
            bccKartaWarning.classList.remove('hidden');
        } else {
            bccKartaWarning.classList.add('hidden');
        }

        // 2. Расчет рассрочки и депозита
        const monthlyPayment = state.price / state.installmentMonths;
        calcMonthlyPayment.textContent = formatMoney(monthlyPayment);

        let balance = state.price;
        let totalInterest = 0;
        const monthlyRate = (state.depositRate / 100) / 12;
        let earlyPayoffMonth = -1;

        for (let m = 1; m <= state.installmentMonths; m++) {
            const interest = balance * monthlyRate;
            totalInterest += interest;
            balance = balance + interest - monthlyPayment;

            // Считаем досрочное погашение, сравнивая с общей выгодой по карте
            if (earlyPayoffMonth === -1 && (totalInterest + state.installmentBonus) >= totalCardBenefit) {
                earlyPayoffMonth = m;
            }
        }

        calcTotalInterest.textContent = formatMoney(totalInterest);

        // 3. Сравнение и вердикт
        const totalInstallmentBenefit = totalInterest + state.installmentBonus;

        if (totalInstallmentBenefit > totalCardBenefit) {
            let bonusText = state.installmentBonus > 0 ? ` + акция ${formatMoney(state.installmentBonus)}` : '';
            summaryText.innerHTML = `Выгоднее взять в <strong>рассрочку</strong>! <br>Вы заработаете на депозите <span class="text-green">${formatMoney(totalInterest)}</span>${bonusText}, что в сумме больше выгоды от покупки картой (<span class="text-green">${formatMoney(totalCardBenefit)}</span>).`;
            
            if (earlyPayoffMonth !== -1 && earlyPayoffMonth <= state.installmentMonths) {
                earlyPayoffBox.classList.remove('hidden');
                payoffMonth.textContent = `На ${earlyPayoffMonth}-й месяц`;
            } else {
                earlyPayoffBox.classList.add('hidden');
            }
        } else if (totalCardBenefit > totalInstallmentBenefit) {
            let extraText = state.cardType === 'bcc-karta' ? ` (кешбэк + проценты за 85 дней)` : '';
            summaryText.innerHTML = `Выгоднее <strong>купить сразу картой</strong>! <br>Ваша выгода${extraText} составит <span class="text-green">${formatMoney(totalCardBenefit)}</span>, а депозит и бонусы рассрочки за этот срок принесут только <span class="text-green">${formatMoney(totalInstallmentBenefit)}</span>.`;
            earlyPayoffBox.classList.add('hidden');
        } else {
            summaryText.innerHTML = `Выгода одинакова. Вы получите по <span class="text-green">${formatMoney(totalCardBenefit)}</span> в обоих случаях.`;
            earlyPayoffBox.classList.add('hidden');
        }
    }
});

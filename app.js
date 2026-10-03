document.addEventListener('DOMContentLoaded', () => {
    // Вводы
    const priceInput = document.getElementById('item-price');
    const kaspiGoldBonusInput = document.getElementById('kaspi-gold-bonus');
    const kartaPercentChips = document.querySelectorAll('#karta-percent-chips .chip');
    
    // Рассрочка
    const kaspiPromoToggle = document.getElementById('kaspi-promo-toggle');
    const deliveryDateInput = document.getElementById('delivery-date');
    if (deliveryDateInput) {
        deliveryDateInput.valueAsDate = new Date();
        state.deliveryDate = deliveryDateInput.valueAsDate;
        deliveryDateInput.addEventListener('change', (e) => {
            state.deliveryDate = e.target.valueAsDate;
            calculate();
        });
    }

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
    const resKarta = document.getElementById('res-karta');

    
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
        deliveryDate: null,     
        depositRate: 17.4
    };

    const formatMoney = (amount) => Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' ₸';

    const parseNumber = (val) => {
        const rawValue = val.replace(/[^\d.]/g, '');
        return parseFloat(rawValue) || 0;
    };

    const formattedInputs = document.querySelectorAll('.formatted-input');
    formattedInputs.forEach(input => {
        // Запрет ввода всего, кроме цифр
        input.addEventListener('keypress', (e) => {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });

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
    kaspiGoldBonusInput.addEventListener('input', (e) => { 
        state.kaspiGoldBonusAmount = parseNumber(e.target.value); 
        if (kaspiPromoToggle.checked) state.installmentBonus = state.kaspiGoldBonusAmount;
        calculate(); 
    });

    kartaPercentChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            kartaPercentChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.customCashbackRate = parseFloat(chip.dataset.percent);
            calculate();
        });
    });

    kaspiPromoToggle.addEventListener('change', (e) => {
        state.installmentBonus = e.target.checked ? state.kaspiGoldBonusAmount : 0;
        calculate();
    });

    

    monthChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            monthChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.installmentMonths = parseInt(chip.dataset.months);
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
        // Обновляем текст ежемесячных платежей в кнопках сроков
        monthChips.forEach(chip => {
            const m = parseInt(chip.dataset.months);
            const pmt = state.price > 0 ? Math.round(state.price / m) : 0;
            let pmtEl = chip.querySelector('.chip-pmt');
            
            // Fallback for aggressively cached mobile browsers
            if (!pmtEl) {
                chip.innerHTML = `
                    <div style="font-size: 16px;">${m} мес</div>
                    <div class="chip-pmt" style="font-size: 11px; font-weight: 400; margin-top: 4px; opacity: 0.9;"></div>
                `;
                pmtEl = chip.querySelector('.chip-pmt');
            }
            
            if (pmtEl) pmtEl.textContent = formatMoney(pmt) + '/мес';
        });

        if (state.price <= 0) {
            valInst.textContent = '0 ₸';
            valGold.textContent = '0 ₸';
            valIron.textContent = '0 ₸';
            earlyPayoffBox.classList.add('hidden');
            instRecBox.classList.add('hidden');
            
            if (state.customCashbackRate === 0) {
                valKarta.textContent = '—';
                descKarta.textContent = 'Недоступно';
                valKarta.style.color = '#8e8e93';
                resKarta.classList.add('disabled-method');
            } else {
                valKarta.textContent = '0 ₸';
                descKarta.textContent = 'Кешбэк + 85 дней';
                valKarta.style.color = '';
                resKarta.classList.remove('disabled-method');
            }
            
            // Сброс стилей лучших вариантов
            document.querySelectorAll('.result-item').forEach(el => {
                el.style.background = 'transparent';
                el.style.border = 'none';
            });
            return;
        }

        // Месячная ставка
        const monthlyRate = (state.depositRate / 100) / 12;
        const dailyRate = (state.depositRate / 100) / 365;

        window.schedules = { inst: [], gold: [], iron: [], karta: [] };
        
        const today = new Date();
        today.setHours(0,0,0,0);
        let delivery = state.deliveryDate || today;
        delivery.setHours(0,0,0,0);
        let diffDays = Math.max(0, Math.ceil((delivery - today) / (1000 * 60 * 60 * 24)));

        // 1. Рассрочка (депозит + бонус)
        let depositBalance = state.price;
        let earnedInterest = 0;
        let pmt = state.price / state.installmentMonths;
        let interestHistory = [];
        
        let delayInt = depositBalance * dailyRate * diffDays;
        depositBalance += delayInt;
        earnedInterest += delayInt;
        
        if (diffDays > 0) {
            window.schedules.inst.push({ date: `Ожидание (${diffDays} дн.)`, balance: formatMoney(depositBalance), interest: `+${formatMoney(delayInt)}`, payment: "0 ₸" });
        }

        for (let m = 1; m <= state.installmentMonths; m++) {
            let int = depositBalance * monthlyRate;
            depositBalance += int;
            earnedInterest += int;
            depositBalance -= pmt;
            
            window.schedules.inst.push({ date: `Месяц ${m}`, balance: formatMoney(Math.max(0, depositBalance)), interest: `+${formatMoney(int)}`, payment: formatMoney(pmt) });
            interestHistory.push(earnedInterest);
        }
        
        let instInterest = earnedInterest;
        let instBenefit = instInterest + state.installmentBonus;

        // 2. Kaspi Gold
        let goldBenefit = state.kaspiGoldBonusAmount;
        window.schedules.gold.push({ date: "Сразу", balance: "0 ₸", interest: `+${formatMoney(goldBenefit)}`, payment: "0 ₸" });

        // 3. BCC ironCard
        let ironCashback = state.price * 0.04;
        let ironBalance = ironCashback;
        
        let ironDelayInt = ironBalance * dailyRate * diffDays;
        ironBalance += ironDelayInt;
        
        if (diffDays > 0) {
            window.schedules.iron.push({ date: `Ожидание (${diffDays} дн.)`, balance: formatMoney(ironBalance), interest: `+${formatMoney(ironDelayInt)}`, payment: "0 ₸" });
        }

        for (let m = 1; m <= state.installmentMonths; m++) {
            let int = ironBalance * monthlyRate;
            ironBalance += int;
            window.schedules.iron.push({ date: `Месяц ${m}`, balance: formatMoney(ironBalance), interest: `+${formatMoney(int)}`, payment: "0 ₸" });
        }
        let ironBenefit = ironBalance;

        // 4. BCC #картакарта
        let kartaBenefit = 0;
        let kartaCashback = 0;
        let graceInterest = 0;
        let baseKarta = 0;
        
        if (state.customCashbackRate === 0) {
            kartaBenefit = -1;
            valKarta.textContent = '—';
            descKarta.textContent = 'Недоступно';
            valKarta.style.color = '#8e8e93';
            resKarta.classList.add('disabled-method');
        } else {
            kartaCashback = state.price * (state.customCashbackRate / 100);
            if (kartaCashback > 20000) kartaCashback = 20000;
            graceInterest = state.price * dailyRate * 85;
            baseKarta = kartaCashback + graceInterest;
            
            let kartaBalance = baseKarta;
            let remainingMonths = state.installmentMonths - (85 / 30.416);
            
            window.schedules.karta.push({ date: "Грейс (85 дн.)", balance: formatMoney(kartaBalance), interest: `+${formatMoney(graceInterest)}`, payment: "0 ₸" });
            
            if (remainingMonths > 0) {
                let remainingFullMonths = Math.floor(remainingMonths);
                for(let m=1; m<=remainingFullMonths; m++) {
                    let int = kartaBalance * monthlyRate;
                    kartaBalance += int;
                    window.schedules.karta.push({ date: `След. месяц ${m}`, balance: formatMoney(kartaBalance), interest: `+${formatMoney(int)}`, payment: "0 ₸" });
                }
                let fraction = remainingMonths - remainingFullMonths;
                if (fraction > 0) {
                    let int = kartaBalance * (monthlyRate * fraction);
                    kartaBalance += int;
                    window.schedules.karta.push({ date: `Остаток дней`, balance: formatMoney(kartaBalance), interest: `+${formatMoney(int)}`, payment: "0 ₸" });
                }
                kartaBenefit = kartaBalance;
            } else {
                kartaBenefit = baseKarta;
            }

            valKarta.textContent = formatMoney(kartaBenefit);
            descKarta.textContent = kartaCashback >= 20000 ? `Лимит 20к + ${formatMoney(graceInterest)} %` : `Кешбэк + ${formatMoney(graceInterest)} %`;
            valKarta.style.color = '';
            resKarta.classList.remove('disabled-method');
        }

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
                explanation = `Включает ${formatMoney(kartaCashback)} кешбэка и ${formatMoney(graceInterest)} процентов по депозиту за 85 дней без % по карте. Затем сумма продолжит расти.`;
            } else if (item.id === 'res-inst') {
                explanation = `Вы заработаете ${formatMoney(instInterest)} процентов на депозите за ${state.installmentMonths} мес.` + (state.installmentBonus > 0 ? ` + ${formatMoney(state.installmentBonus)} по акции.` : '');
            } else if (item.id === 'res-gold') {
                explanation = `Вы получите ${formatMoney(state.kaspiGoldBonusAmount)} Kaspi бонусов сразу. (Бонусы нельзя положить на депозит)`;
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

            const tooltipSvgIcon = `
                <svg class="info-icon" style="flex-shrink: 0;" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="12" fill="#0079C2"/>
                  <rect x="11" y="10" width="2.5" height="8" rx="1" fill="white"/>
                  <circle cx="12.25" cy="6.5" r="1.5" fill="white"/>
                </svg>
            `;

            // Базовые стили (сброс)
            el.style.background = 'transparent';
            el.style.border = 'none';
            el.style.padding = '16px 0';
            el.style.margin = '0';
            el.style.borderRadius = '0';

            if (item.val === maxVal && maxVal > 0) {
                // Подсвечиваем самый выгодный вариант
                el.style.background = '#fff5f5'; // Светло-красный/розовый фон
                el.style.border = '1px solid var(--primary)';
                el.style.borderRadius = '12px';
                el.style.padding = '8px';
                el.style.margin = '4px -8px';

                tooltipEl.innerHTML = `
                    ${tooltipSvgIcon}
                    <div class="info-text">
                        <div style="font-weight: 700; margin-bottom: 4px; color: #1c1c1e;">Самый выгодный вариант</div>
                        <div style="color: #333333; margin-bottom: 6px;">${explanation}</div>
                        <div style="font-weight: 700; color: #1c1c1e;">Итого: <span class="text-red">${formatMoney(item.val)}</span></div>
                    </div>
                `;
            } else if (item.val === -1) {
                tooltipEl.innerHTML = `
                    ${tooltipSvgIcon}
                    <div class="info-text" style="color: #333333;">Этот способ оплаты недоступен (выбран 0%).</div>
                `;
            } else if (maxVal > 0) {
                const diff = maxVal - item.val;
                tooltipEl.innerHTML = `
                    ${tooltipSvgIcon}
                    <div class="info-text">
                        <div style="font-weight: 700; margin-bottom: 4px; color: #1c1c1e;">Уступает на ${formatMoney(diff)}</div>
                        <div style="color: #333333; margin-bottom: 6px;">${explanation}</div>
                        <div style="font-weight: 700; color: #1c1c1e;">Итого: <span class="text-red">${formatMoney(item.val)}</span></div>
                    </div>
                `;
            } else {
                    tooltipEl.innerHTML = '';
                }
        });

        // Досрочное погашение
        let earlyMonth = -1;
        
        for (let m = 0; m < state.installmentMonths; m++) {
            let currentMonth = m + 1;
            
            // Каким был бы доход от карт, если бы мы остановились на этом месяце?
            let currentIron = ironCashback * Math.pow(1 + monthlyRate, currentMonth);
            let currentGold = state.kaspiGoldBonusAmount; // бонусы не капитализируются
            let currentKarta = -1;
            
            if (state.customCashbackRate !== 0) {
                let remainingKartaMonths = currentMonth - (85 / 30.416);
                if (remainingKartaMonths > 0) {
                    currentKarta = baseKarta * Math.pow(1 + monthlyRate, remainingKartaMonths);
                } else {
                    currentKarta = baseKarta;
                }
            }
            
            let currentBestCard = Math.max(currentIron, currentGold, currentKarta);
            
            if ((interestHistory[m] + state.installmentBonus) >= currentBestCard) {
                earlyMonth = currentMonth;
                break;
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
    calculate();
});

window.toggleTooltip = function(e, btn) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const tooltip = btn.closest('.result-item').querySelector('.kaspi-tooltip');
    const isShowing = tooltip && tooltip.classList.contains('show');
    
    // Скрываем все остальные
    document.querySelectorAll('.kaspi-tooltip').forEach(tt => tt.classList.remove('show'));
    
    if (tooltip && !isShowing) {
        tooltip.classList.add('show');
    }
};

// Глобальное закрытие при клике вне
const closeTooltips = (e) => {
    if (!e.target.closest('.kaspi-tooltip') && !e.target.closest('.info-btn')) {
        document.querySelectorAll('.kaspi-tooltip').forEach(tt => tt.classList.remove('show'));
    }
};

document.addEventListener('click', closeTooltips);
document.addEventListener('touchstart', closeTooltips, {passive: true});

window.downloadPDF = function(e, type) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const schedule = window.schedules && window.schedules[type];
    if (!schedule || schedule.length === 0) return;
    
    let title = "График";
    if (type === 'inst') title = "График платежей по рассрочке";
    if (type === 'gold') title = "Kaspi Gold (бонусы)";
    if (type === 'iron') title = "График дохода: BCC ironCard";
    if (type === 'karta') title = "График дохода: BCC #картакарта";

    let tableHtml = `
    <div id="pdf-content" style="padding: 30px; font-family: sans-serif; color: #1c1c1e;">
        <h2 style="color: #f14635; margin-bottom: 20px; text-align: center;">${title}</h2>
        <table style="width: 100%; border-collapse: collapse; text-align: right; font-size: 14px;">
            <thead>
                <tr style="border-bottom: 2px solid #ccc;">
                    <th style="padding: 10px; text-align: left;">Период</th>
                    <th style="padding: 10px;">Остаток депозита</th>
                    <th style="padding: 10px;">Начисленные %</th>
                    <th style="padding: 10px;">Платеж банку</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    schedule.forEach(row => {
        tableHtml += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; text-align: left;">${row.date}</td>
                <td style="padding: 10px;">${row.balance}</td>
                <td style="padding: 10px; color: #0079C2;">${row.interest}</td>
                <td style="padding: 10px; color: #f14635;">${row.payment}</td>
            </tr>
        `;
    });
    
    tableHtml += `</tbody></table></div>`;
    
    const container = document.createElement('div');
    container.innerHTML = tableHtml;
    // html2pdf needs it in the DOM temporarily or it might struggle with fonts/styles.
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    document.body.appendChild(container);
    
    const opt = {
      margin:       10,
      filename:     `schedule_${type}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(container).save().then(() => {
        document.body.removeChild(container);
    });
};

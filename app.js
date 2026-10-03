document.addEventListener('DOMContentLoaded', () => {

        const monthNamesRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const formatRuDate = (d) => `${d.getDate()} ${monthNamesRu[d.getMonth()]} ${d.getFullYear()} г.`;
    const addMonths = (date, months) => {
        let d = new Date(date);
        let expectedMonth = (d.getMonth() + months) % 12;
        d.setMonth(d.getMonth() + months);
        if (d.getMonth() !== expectedMonth && d.getDate() < 4) {
            d.setDate(0);
        }
        return d;
    };

    let state = {
        price: 0,
        kaspiGoldBonusAmount: 0, 
        customCashbackRate: 0,   
        installmentMonths: 12,
        installmentBonus: 0,
        deliveryDate: null,     
        depositRate: 17.4
    };

    // Вводы
    const priceInput = document.getElementById('item-price');
    const kaspiGoldBonusInput = document.getElementById('kaspi-gold-bonus');
    const kartaPercentChips = document.querySelectorAll('#karta-percent-chips .chip');
    
    // Рассрочка
    const kaspiPromoToggle = document.getElementById('kaspi-promo-toggle');
    const deliveryDateInput = document.getElementById('delivery-date');
    if (deliveryDateInput) {
        flatpickr(deliveryDateInput, {
            locale: "ru",
            defaultDate: new Date(),
            dateFormat: "d.m.Y",
            disableMobile: true, // Use flatpickr even on mobile for consistency
            onChange: function(selectedDates) {
                if (selectedDates.length > 0) {
                    state.deliveryDate = selectedDates[0];
                    calculate();
                }
            }
        });
        state.deliveryDate = new Date();
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

    const formatMoney = (amount) => Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0") + "\u00A0₸";

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
                val = val.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
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
            valInst.textContent = '0\u00A0₸';
            valGold.textContent = '0\u00A0₸';
            valIron.textContent = '0\u00A0₸';
            valInst.style.color = '#1c1c1e';
            valGold.style.color = '#1c1c1e';
            valIron.style.color = '#1c1c1e';
            earlyPayoffBox.classList.add('hidden');
            instRecBox.classList.add('hidden');
            
            if (state.customCashbackRate === 0) {
                valKarta.textContent = '—';
                descKarta.textContent = 'Недоступно';
                valKarta.style.color = '#8e8e93';
                resKarta.classList.add('disabled-method');
            } else {
                valKarta.textContent = '0\u00A0₸';
                descKarta.textContent = 'Кешбэк + 85 дней';
                valKarta.style.color = '#1c1c1e';
                resKarta.classList.remove('disabled-method');
            }
            
            // Сброс стилей лучших вариантов
            document.querySelectorAll('.result-item').forEach(el => {
                el.style.background = 'transparent';
                el.style.boxShadow = 'none';
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
            window.schedules.inst.push({ date: `Ожидание до ${formatRuDate(delivery)}`, balance: formatMoney(depositBalance), interest: `+${formatMoney(delayInt)}`, payment: "0\u00A0₸" });
        }

        for (let m = 1; m <= state.installmentMonths; m++) {
            let int = depositBalance * monthlyRate;
            depositBalance += int;
            earnedInterest += int;
            depositBalance -= pmt;
            
            window.schedules.inst.push({ date: formatRuDate(addMonths(delivery, m)), balance: formatMoney(Math.max(0, depositBalance)), interest: `+${formatMoney(int)}`, payment: formatMoney(pmt), rawInterest: int, rawPayment: pmt });
            interestHistory.push(earnedInterest);
        }
        
        let instInterest = earnedInterest;
        let instBenefit = instInterest + state.installmentBonus;

        // 2. Kaspi Gold
        let goldBenefit = state.kaspiGoldBonusAmount;
        window.schedules.gold.push({ date: formatRuDate(today), balance: "0\u00A0₸", interest: `+${formatMoney(goldBenefit)}`, payment: "0\u00A0₸" });

        // 3. BCC ironCard
        let ironCashback = state.price * 0.04;
        let ironBalance = ironCashback;
        
        let ironDelayInt = ironBalance * dailyRate * diffDays;
        ironBalance += ironDelayInt;
        
        if (diffDays > 0) {
            window.schedules.iron.push({ date: `Ожидание до ${formatRuDate(delivery)}`, balance: formatMoney(ironBalance), interest: `+${formatMoney(ironDelayInt)}`, payment: "0\u00A0₸" });
        }

        for (let m = 1; m <= state.installmentMonths; m++) {
            let int = ironBalance * monthlyRate;
            ironBalance += int;
            window.schedules.iron.push({ date: formatRuDate(addMonths(delivery, m)), balance: formatMoney(ironBalance), interest: `+${formatMoney(int)}`, payment: "0\u00A0₸" });
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
            
            window.schedules.karta.push({ date: `Грейс до ${formatRuDate(new Date(today.getTime() + 85 * 24 * 60 * 60 * 1000))}`, balance: formatMoney(kartaBalance), interest: `+${formatMoney(graceInterest)}`, payment: "0\u00A0₸" });
            
            if (remainingMonths > 0) {
                let remainingFullMonths = Math.floor(remainingMonths);
                for(let m=1; m<=remainingFullMonths; m++) {
                    let int = kartaBalance * monthlyRate;
                    kartaBalance += int;
                    window.schedules.karta.push({ date: formatRuDate(addMonths(new Date(today.getTime() + 85 * 24 * 60 * 60 * 1000), m)), balance: formatMoney(kartaBalance), interest: `+${formatMoney(int)}`, payment: "0\u00A0₸" });
                }
                let fraction = remainingMonths - remainingFullMonths;
                if (fraction > 0) {
                    let int = kartaBalance * (monthlyRate * fraction);
                    kartaBalance += int;
                    window.schedules.karta.push({ date: `Остаток дней`, balance: formatMoney(kartaBalance), interest: `+${formatMoney(int)}`, payment: "0\u00A0₸" });
                }
                kartaBenefit = kartaBalance;
            } else {
                kartaBenefit = baseKarta;
            }

            valKarta.textContent = formatMoney(kartaBenefit);
            descKarta.textContent = kartaCashback >= 20000 ? `Лимит 20 000 ₸ + ${formatMoney(graceInterest)} %` : `Кешбэк + ${formatMoney(graceInterest)} %`;
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

        const valueEls = { 'res-karta': valKarta, 'res-inst': valInst, 'res-gold': valGold, 'res-iron': valIron };

        // Подсвечиваем самый выгодный (и убираем с остальных), добавляем подсказки
        benefits.forEach(item => {
            const el = document.getElementById(item.id);
            const valEl = valueEls[item.id];
            
            if (item.val === -1) {
                valEl.style.color = '#8e8e93';
            } else if (item.val === maxVal && maxVal > 0) {
                valEl.style.color = '#12a04b'; // Тёмно-зелёный
            } else {
                valEl.style.color = '#1c1c1e'; // Чёрный
            }

            
            // Формируем детальное объяснение
            let explanation = '';
            if (item.id === 'res-karta') {
                let kartaPct = Math.round((kartaCashback / item.val) * 100);
                explanation = `
                    <div style="color: #333333; margin-bottom: 8px;">Кешбэк + процент на эту сумму за 85 дней грейс-периода.</div>
                    <div class="visual-bar-container">
                        <div class="visual-bar-part" style="width: ${kartaPct}%; background: #0079C2;"></div>
                        <div class="visual-bar-part" style="width: ${100 - kartaPct}%; background: #12a04b;"></div>
                    </div>
                    <div class="visual-legend">
                        <div><span class="visual-dot" style="background: #0079C2;"></span>Кешбэк: <strong>${formatMoney(kartaCashback)}</strong></div>
                        <div><span class="visual-dot" style="background: #12a04b;"></span>Проценты (85 дн.): <strong>${formatMoney(graceInterest)}</strong></div>
                    </div>
                `;
            } else if (item.id === 'res-inst') {
                let instTot = instInterest + state.installmentBonus;
                let intPct = Math.round((instInterest / instTot) * 100) || 100;
                let bonusPct = 100 - intPct;
                explanation = `
                    <div style="color: #333333; margin-bottom: 8px;">Сумма лежит на депозите, пока вы платите рассрочку.</div>
                    <div class="visual-bar-container">
                        <div class="visual-bar-part" style="width: ${intPct}%; background: #12a04b;"></div>
                        ${state.installmentBonus > 0 ? `<div class="visual-bar-part" style="width: ${bonusPct}%; background: #f14635;"></div>` : ''}
                    </div>
                    <div class="visual-legend">
                        <div><span class="visual-dot" style="background: #12a04b;"></span>Проценты: <strong>${formatMoney(instInterest)}</strong></div>
                        ${state.installmentBonus > 0 ? `<div><span class="visual-dot" style="background: #f14635;"></span>Бонус: <strong>${formatMoney(state.installmentBonus)}</strong></div>` : ''}
                    </div>
                `;
            } else if (item.id === 'res-gold') {
                explanation = `
                    <div style="color: #333333; margin-bottom: 8px;">Бонусы зачисляются сразу, но не растут на депозите.</div>
                    <div class="visual-bar-container">
                        <div class="visual-bar-part" style="width: 100%; background: #f14635;"></div>
                    </div>
                    <div class="visual-legend">
                        <div><span class="visual-dot" style="background: #f14635;"></span>Kaspi Бонусы: <strong>${formatMoney(state.kaspiGoldBonusAmount)}</strong></div>
                    </div>
                `;
            } else if (item.id === 'res-iron') {
                let ironTot = item.val;
                let ironCashPct = Math.round((ironCashback / ironTot) * 100);
                let ironInt = ironTot - ironCashback;
                explanation = `
                    <div style="color: #333333; margin-bottom: 8px;">Кешбэк деньгами сразу кладется на депозит.</div>
                    <div class="visual-bar-container">
                        <div class="visual-bar-part" style="width: ${ironCashPct}%; background: #0079C2;"></div>
                        <div class="visual-bar-part" style="width: ${100 - ironCashPct}%; background: #12a04b;"></div>
                    </div>
                    <div class="visual-legend">
                        <div><span class="visual-dot" style="background: #0079C2;"></span>Кешбэк (4%): <strong>${formatMoney(ironCashback)}</strong></div>
                        <div><span class="visual-dot" style="background: #12a04b;"></span>Проценты: <strong>${formatMoney(ironInt)}</strong></div>
                    </div>
                `;
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
            el.style.boxShadow = 'none';
            
            
            

            if (item.val === maxVal && maxVal > 0) {
                // Подсвечиваем самый выгодный вариант
                el.style.background = '#fff5f5'; // Светло-красный/розовый фон
                el.style.boxShadow = 'inset 0 0 0 1px var(--primary)';
                el.style.borderRadius = '12px';
                
                

                tooltipEl.innerHTML = `
                    ${tooltipSvgIcon}
                    <div class="info-text">
                        <div style="font-weight: 700; margin-bottom: 4px; color: #1c1c1e;">Самый выгодный вариант</div>
                        <div style="color: #333333; margin-bottom: 6px;">${explanation}</div>
                        <div style="font-weight: 700; color: #1c1c1e;">Итого: <span style="color: #12a04b;">${formatMoney(item.val)}</span></div>
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
                        <div style="font-weight: 700; color: #1c1c1e;">Итого: <span style="color: #12a04b;">${formatMoney(item.val)}</span></div>
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

    // Desktop hover logic for overlay
    document.querySelectorAll('.result-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            const tt = item.querySelector('.kaspi-tooltip');
            if (tt && tt.innerHTML.trim() !== '') {
                document.body.classList.add('tooltip-active');
                
                
                item.classList.add('elevated'); // Ensure it's not transparent over overlay
                
                // slight padding tweak to make it look like a popout if we want, but Kaspi list items are usually flush.
            }
        });
        item.addEventListener('mouseleave', () => {
            document.body.classList.remove('tooltip-active');
            
            item.classList.remove('elevated');
        });
    });

    calculate();
});

window.toggleTooltip = function(e, btn) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const item = btn.closest('.result-item');
    const tooltip = item.querySelector('.kaspi-tooltip');
    const isShowing = tooltip && tooltip.classList.contains('show');
    
    // Скрываем все остальные
    document.querySelectorAll('.kaspi-tooltip').forEach(tt => tt.classList.remove('show'));
    document.querySelectorAll('.result-item').forEach(ri => {
        ri.classList.remove('elevated');
        
    });
    
    if (tooltip && !isShowing) {
        tooltip.classList.add('show');
        document.body.classList.add('tooltip-active');
        
        
        item.classList.add('elevated');
        
    } else {
        document.body.classList.remove('tooltip-active');
    }
};

// Глобальное закрытие при клике вне
const closeTooltips = (e) => {
    if (!e.target.closest('.kaspi-tooltip') && !e.target.closest('.info-btn')) {
        document.querySelectorAll('.kaspi-tooltip').forEach(tt => tt.classList.remove('show'));
        document.body.classList.remove('tooltip-active');
        document.querySelectorAll('.result-item').forEach(ri => {
            ri.classList.remove('elevated');
            
        });
    }
};

document.addEventListener('click', closeTooltips);
document.addEventListener('touchstart', closeTooltips, {passive: true});


let currentDownloadType = null;
let currentDownloadTitle = null;

window.downloadPDF = function(e, type) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const schedule = window.schedules && window.schedules[type];
    if (!schedule || schedule.length === 0) return;
    
    currentDownloadType = type;
    
    let title = "График";
    if (type === 'inst') title = "График платежей по рассрочке";
    if (type === 'gold') title = "Kaspi Gold (бонусы)";
    if (type === 'iron') title = "График дохода: BCC ironCard";
    if (type === 'karta') title = "График дохода: BCC #картакарта";
    
    currentDownloadTitle = title;
    
    document.getElementById('pdf-filename-input').value = '';
    document.getElementById('pdf-modal-overlay').classList.add('show');
};

window.closePdfModal = function() {
    document.getElementById('pdf-modal-overlay').classList.remove('show');
    currentDownloadType = null;
};

window.confirmPdfDownload = function() {
    if (!currentDownloadType) return;
    
    let fileName = document.getElementById('pdf-filename-input').value.trim();
    
    if (fileName === '') {
        // Generate DDMMYY-HHMM
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = String(d.getFullYear()).slice(-2);
        const hh = String(d.getHours()).padStart(2, '0');
        const mn = String(d.getMinutes()).padStart(2, '0');
        fileName = `${dd}${mm}${yy}-${hh}${mn}`;
    }
    
    if (!fileName.toLowerCase().endsWith('.pdf')) {
        fileName += '.pdf';
    }
    
    const type = currentDownloadType;
    const schedule = window.schedules[type];
    const title = currentDownloadTitle;
    
    closePdfModal();

    let headers = [];
    let widths = [];
    
    if (type === 'inst' || type === 'karta') {
        headers = ['Период', 'Остаток депозита', 'Начисления (Кешбэк и %)', 'Платеж банку'];
        widths = ['*', 'auto', 'auto', 'auto'];
    } else if (type === 'gold') {
        headers = ['Событие', 'Начисленные Бонусы'];
        widths = ['*', 'auto'];
    } else { // iron
        headers = ['Период', 'Сумма на депозите', 'Начисления (Кешбэк и %)'];
        widths = ['*', 'auto', 'auto'];
    }

    const tableBody = [
        headers.map(h => ({ text: h, style: 'tableHeader' }))
    ];
    
    let totalInterest = 0;
    let totalPayment = 0;

    schedule.forEach(row => {
        totalInterest += row.rawInterest || 0;
        totalPayment += row.rawPayment || 0;
        
        let rowData = [];
        if (type === 'inst' || type === 'karta') {
            rowData = [
                row.date,
                row.balance.replace(/₸/g, 'тг.'),
                { text: row.interest.replace(/₸/g, 'тг.'), color: '#0079C2' },
                { text: row.payment.replace(/₸/g, 'тг.'), color: '#f14635' }
            ];
        } else if (type === 'gold') {
            rowData = [
                row.date,
                { text: row.interest.replace(/₸/g, 'тг.'), color: '#0079C2' }
            ];
        } else { // iron
            rowData = [
                row.date,
                row.balance.replace(/₸/g, 'тг.'),
                { text: row.interest.replace(/₸/g, 'тг.'), color: '#0079C2' }
            ];
        }
        tableBody.push(rowData);
    });

    // Add Total Row
    if (type === 'inst' || type === 'karta') {
        tableBody.push([
            { text: 'Итого', bold: true },
            '',
            { text: '+' + formatMoney(totalInterest).replace(/₸/g, 'тг.'), color: '#0079C2', bold: true },
            { text: formatMoney(totalPayment).replace(/₸/g, 'тг.'), color: '#f14635', bold: true }
        ]);
    } else if (type === 'gold') {
        tableBody.push([
            { text: 'Итого', bold: true },
            { text: '+' + formatMoney(totalInterest).replace(/₸/g, 'тг.'), color: '#0079C2', bold: true }
        ]);
    } else { // iron
        tableBody.push([
            { text: 'Итого', bold: true },
            '',
            { text: '+' + formatMoney(totalInterest).replace(/₸/g, 'тг.'), color: '#0079C2', bold: true }
        ]);
    }


    const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: [ 40, 60, 40, 60 ],
        content: [
            { text: title, style: 'header' },
            {
                table: {
                    headerRows: 1,
                    widths: widths,
                    body: tableBody
                },
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 0 : 1;
                    },
                    vLineWidth: function (i, node) {
                        return 0;
                    },
                    hLineColor: function (i, node) {
                        return '#eeeeee';
                    },
                    paddingLeft: function(i, node) { return 10; },
                    paddingRight: function(i, node) { return 10; },
                    paddingTop: function(i, node) { return 8; },
                    paddingBottom: function(i, node) { return 8; },
                }
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                color: '#f14635',
                alignment: 'center',
                margin: [0, 0, 0, 20]
            },
            tableHeader: {
                bold: true,
                fontSize: 12,
                color: '#1c1c1e',
                fillColor: '#f5f6f8'
            }
        },
        defaultStyle: {
            fontSize: 11,
            color: '#1c1c1e'
        }
    };

    pdfMake.createPdf(docDefinition).download(fileName);
};
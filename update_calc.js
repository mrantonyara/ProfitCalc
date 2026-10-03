const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const oldCalcBlock = `        // 1. Рассрочка
        let instBenefit = 0;
        let balance = state.price;
        let interestHistory = [];
        let pmt = state.price / state.installmentMonths;

        for (let m = 1; m <= state.installmentMonths; m++) {
            let interest = balance * monthlyRate;
            instBenefit += interest;
            balance -= pmt;
            interestHistory.push(instBenefit);
        }
        
        let instInterest = instBenefit;
        instBenefit += state.installmentBonus;

        // 2. Kaspi Gold (Бонусы)
        let goldBenefit = state.kaspiGoldBonusAmount;

        // 3. BCC #картакарта (кешбэк + грейс 85 дней)
        let kartaBenefit = 0;
        let kartaCashback = 0;
        let graceInterest = 0;
        let baseKarta = 0;
        
        if (state.customCashbackRate === 0) {
            kartaBenefit = -1; // Дисквалифицируем
            valKarta.textContent = '—';
            descKarta.textContent = 'Недоступно';
            valKarta.style.color = '#8e8e93';
            resKarta.classList.add('disabled-method');
        } else {
            kartaCashback = state.price * (state.customCashbackRate / 100);
            if (kartaCashback > 20000) kartaCashback = 20000;
            graceInterest = state.price * (state.depositRate / 100 / 365) * 85;
            
            baseKarta = kartaCashback + graceInterest;
            let remainingMonths = state.installmentMonths - (85 / 30.416);
            if (remainingMonths > 0) {
                kartaBenefit = baseKarta * Math.pow(1 + monthlyRate, remainingMonths);
            } else {
                kartaBenefit = baseKarta;
            }

            valKarta.textContent = formatMoney(kartaBenefit);
            descKarta.textContent = kartaCashback >= 20000 ? \`Лимит 20к + \${formatMoney(graceInterest)} %\` : \`Кешбэк + \${formatMoney(graceInterest)} %\`;
            valKarta.style.color = '';
            resKarta.classList.remove('disabled-method');
        }

        // 4. Рассрочка (депозит + бонус)
        // (Остаток на депозите после покупки через BCC ironCard)
        // Для ironCard: сразу получаем кешбэк 4% от всей суммы и кладем на депозит
        let ironCashback = state.price * 0.04;
        let ironBenefit = ironCashback * Math.pow(1 + monthlyRate, state.installmentMonths);`;

const newCalcBlock = `        window.schedules = { inst: [], gold: [], iron: [], karta: [] };
        
        const today = new Date();
        today.setHours(0,0,0,0);
        let delivery = state.deliveryDate || today;
        delivery.setHours(0,0,0,0);
        let diffDays = Math.max(0, Math.ceil((delivery - today) / (1000 * 60 * 60 * 24)));
        let dailyRate = (state.depositRate / 100) / 365;

        // 1. Рассрочка
        let depositBalance = state.price;
        let earnedInterest = 0;
        let pmt = state.price / state.installmentMonths;
        let interestHistory = [];
        
        // Delay period
        let delayInt = depositBalance * dailyRate * diffDays;
        depositBalance += delayInt;
        earnedInterest += delayInt;
        
        if (diffDays > 0) {
            window.schedules.inst.push({ date: \`Ожидание доставки (\${diffDays} дн.)\`, balance: formatMoney(depositBalance), interest: \`+\${formatMoney(delayInt)}\`, payment: "0 ₸" });
        }

        for (let m = 1; m <= state.installmentMonths; m++) {
            let int = depositBalance * monthlyRate;
            depositBalance += int;
            earnedInterest += int;
            depositBalance -= pmt;
            
            window.schedules.inst.push({ date: \`Месяц \${m}\`, balance: formatMoney(Math.max(0, depositBalance)), interest: \`+\${formatMoney(int)}\`, payment: formatMoney(pmt) });
            interestHistory.push(earnedInterest);
        }
        
        let instInterest = earnedInterest;
        let instBenefit = instInterest + state.installmentBonus;

        // 2. Kaspi Gold (Бонусы)
        let goldBenefit = state.kaspiGoldBonusAmount;
        window.schedules.gold.push({ date: "Сразу", balance: "0 ₸", interest: \`+\${formatMoney(goldBenefit)}\`, payment: "0 ₸" });

        // 4. BCC ironCard
        let ironCashback = state.price * 0.04;
        let ironBalance = ironCashback;
        
        let ironDelayInt = ironBalance * dailyRate * diffDays;
        ironBalance += ironDelayInt;
        
        if (diffDays > 0) {
            window.schedules.iron.push({ date: \`Ожидание доставки (\${diffDays} дн.)\`, balance: formatMoney(ironBalance), interest: \`+\${formatMoney(ironDelayInt)}\`, payment: "0 ₸" });
        }

        for (let m = 1; m <= state.installmentMonths; m++) {
            let int = ironBalance * monthlyRate;
            ironBalance += int;
            window.schedules.iron.push({ date: \`Месяц \${m}\`, balance: formatMoney(ironBalance), interest: \`+\${formatMoney(int)}\`, payment: "0 ₸" });
        }
        let ironBenefit = ironBalance;

        // 3. BCC #картакарта
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
            // Delay doesn't technically change the grace 85 days, it's just 85 days + remaining months.
            let remainingMonths = state.installmentMonths - (85 / 30.416);
            
            window.schedules.karta.push({ date: "Грейс (85 дн.)", balance: formatMoney(kartaBalance), interest: \`+\${formatMoney(graceInterest)}\`, payment: "0 ₸" });
            
            if (remainingMonths > 0) {
                // If there are full months left, compound them
                let remainingFullMonths = Math.floor(remainingMonths);
                for(let m=1; m<=remainingFullMonths; m++) {
                    let int = kartaBalance * monthlyRate;
                    kartaBalance += int;
                    window.schedules.karta.push({ date: \`След. месяц \${m}\`, balance: formatMoney(kartaBalance), interest: \`+\${formatMoney(int)}\`, payment: "0 ₸" });
                }
                // Fraction of month left
                let fraction = remainingMonths - remainingFullMonths;
                if (fraction > 0) {
                    let int = kartaBalance * (monthlyRate * fraction);
                    kartaBalance += int;
                    window.schedules.karta.push({ date: \`Остаток дней\`, balance: formatMoney(kartaBalance), interest: \`+\${formatMoney(int)}\`, payment: "0 ₸" });
                }
                kartaBenefit = kartaBalance;
            } else {
                kartaBenefit = baseKarta;
            }

            valKarta.textContent = formatMoney(kartaBenefit);
            descKarta.textContent = kartaCashback >= 20000 ? \`Лимит 20к + \${formatMoney(graceInterest)} %\` : \`Кешбэк + \${formatMoney(graceInterest)} %\`;
            valKarta.style.color = '';
            resKarta.classList.remove('disabled-method');
        }`;

code = code.replace(oldCalcBlock, newCalcBlock);

fs.writeFileSync('app.js', code);

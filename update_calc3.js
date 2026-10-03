const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const regex = /\/\/ Месячная ставка[\s\S]*?\/\/ Определяем победителя/m;

const newBlock = `// Месячная ставка
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
            window.schedules.inst.push({ date: \`Ожидание (\${diffDays} дн.)\`, balance: formatMoney(depositBalance), interest: \`+\${formatMoney(delayInt)}\`, payment: "0 ₸" });
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

        // 2. Kaspi Gold
        let goldBenefit = state.kaspiGoldBonusAmount;
        window.schedules.gold.push({ date: "Сразу", balance: "0 ₸", interest: \`+\${formatMoney(goldBenefit)}\`, payment: "0 ₸" });

        // 3. BCC ironCard
        let ironCashback = state.price * 0.04;
        let ironBalance = ironCashback;
        
        let ironDelayInt = ironBalance * dailyRate * diffDays;
        ironBalance += ironDelayInt;
        
        if (diffDays > 0) {
            window.schedules.iron.push({ date: \`Ожидание (\${diffDays} дн.)\`, balance: formatMoney(ironBalance), interest: \`+\${formatMoney(ironDelayInt)}\`, payment: "0 ₸" });
        }

        for (let m = 1; m <= state.installmentMonths; m++) {
            let int = ironBalance * monthlyRate;
            ironBalance += int;
            window.schedules.iron.push({ date: \`Месяц \${m}\`, balance: formatMoney(ironBalance), interest: \`+\${formatMoney(int)}\`, payment: "0 ₸" });
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
            
            window.schedules.karta.push({ date: "Грейс (85 дн.)", balance: formatMoney(kartaBalance), interest: \`+\${formatMoney(graceInterest)}\`, payment: "0 ₸" });
            
            if (remainingMonths > 0) {
                let remainingFullMonths = Math.floor(remainingMonths);
                for(let m=1; m<=remainingFullMonths; m++) {
                    let int = kartaBalance * monthlyRate;
                    kartaBalance += int;
                    window.schedules.karta.push({ date: \`След. месяц \${m}\`, balance: formatMoney(kartaBalance), interest: \`+\${formatMoney(int)}\`, payment: "0 ₸" });
                }
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
        }

        valIron.textContent = formatMoney(ironBenefit);
        valGold.textContent = formatMoney(goldBenefit);
        valInst.textContent = formatMoney(instBenefit);

        descInst.textContent = state.installmentBonus > 0 ? \`Проценты + \${formatMoney(state.installmentBonus)} бонус\` : \`Доход по депозиту\`;

        // Определяем победителя`;

code = code.replace(regex, newBlock);
fs.writeFileSync('app.js', code);

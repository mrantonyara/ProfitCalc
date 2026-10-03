const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// We will find "// 1. Рассрочка" and replace up to "valKarta.textContent = formatMoney(kartaBenefit);" (which is right after karta logic)
const regex = /\/\/ 1\. Рассрочка[\s\S]*?valKarta\.textContent = formatMoney\(kartaBenefit\);/m;

const newBlock = `        window.schedules = { inst: [], gold: [], iron: [], karta: [] };
        
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

        // 4. BCC ironCard
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

        // 3. BCC #картакарта
        let kartaBenefit = 0;
        let kartaCashback = 0;
        let graceInterest = 0;
        let baseKarta = 0;
        
        if (state.customCashbackRate === 0) {
            kartaBenefit = -1;
            valKarta.textContent = '—';
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

            valKarta.textContent = formatMoney(kartaBenefit);`;

code = code.replace(regex, newBlock);
fs.writeFileSync('app.js', code);

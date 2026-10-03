import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

karta_old = """        let kartaCashback = state.price * (state.customCashbackRate / 100);
        if (kartaCashback > 20000) kartaCashback = 20000;
        
        let graceInterest = state.price * dailyRate * 85;
        let baseKarta = kartaCashback + graceInterest;
        let kartaBenefit = 0;
        
        if (state.installmentMonths > 3) {
            let remainingMonths = state.installmentMonths - (85 / 30);
            let kartaBalance = baseKarta;
            
            window.schedules.karta = [];
            window.schedules.karta.push({ date: `Покупка (${formatRuDate(today)})`, balance: formatMoney(state.price), interest: `+${formatMoney(kartaCashback)} (Кешбэк)`, payment: "0\\u00A0тг.", rawInterest: kartaCashback, rawPayment: 0 });
            window.schedules.karta.push({ date: `Грейс до ${formatRuDate(new Date(today.getTime() + 85 * 24 * 60 * 60 * 1000))}`, balance: formatMoney(state.price), interest: `+${formatMoney(graceInterest)}`, payment: "0\\u00A0тг.", rawInterest: graceInterest, rawPayment: 0 });
            window.schedules.karta.push({ date: `Погашение долга по карте`, balance: formatMoney(kartaBalance), interest: `0\\u00A0тг.`, payment: formatMoney(state.price), rawInterest: 0, rawPayment: state.price });
            
            if (remainingMonths > 0) {
                let remainingFullMonths = Math.floor(remainingMonths);
                for(let m=1; m<=remainingFullMonths; m++) {
                    let int = kartaBalance * monthlyRate;
                    kartaBalance += int;
                    window.schedules.karta.push({ date: formatRuDate(addMonths(new Date(today.getTime() + 85 * 24 * 60 * 60 * 1000), m)), balance: formatMoney(kartaBalance), interest: `+${formatMoney(int)}`, payment: "0\\u00A0тг.", rawInterest: int, rawPayment: 0 });
                }
                let fraction = remainingMonths - remainingFullMonths;
                if (fraction > 0) {
                    let int = kartaBalance * (monthlyRate * fraction);
                    kartaBalance += int;
                    window.schedules.karta.push({ date: `Остаток дней`, balance: formatMoney(kartaBalance), interest: `+${formatMoney(int)}`, payment: "0\\u00A0тг.", rawInterest: int, rawPayment: 0 });
                }
                kartaBenefit = kartaBalance;
            } else {
                kartaBenefit = baseKarta;
            }"""

karta_new = """        let kartaCashback = state.price * (state.customCashbackRate / 100);
        if (kartaCashback > 20000) kartaCashback = 20000;
        
        let graceEndDate = new Date(today.getTime() + 85 * 24 * 60 * 60 * 1000);
        let graceInterest = state.price * ((state.depositRate / 100) / 365) * 85;
        let baseKarta = kartaCashback + graceInterest;
        let kartaBenefit = 0;
        
        window.schedules.karta = [];
        window.schedules.karta.push({ date: `Покупка (${formatRuDate(today)})`, balance: formatMoney(state.price), interest: `+${formatMoney(kartaCashback)} (Кешбэк)`, payment: "0\\u00A0тг.", rawInterest: kartaCashback, rawPayment: 0 });
        window.schedules.karta.push({ date: `Грейс до ${formatRuDate(graceEndDate)}`, balance: formatMoney(state.price), interest: `+${formatMoney(graceInterest)}`, payment: "0\\u00A0тг.", rawInterest: graceInterest, rawPayment: 0 });
        window.schedules.karta.push({ date: `Погашение долга по карте`, balance: formatMoney(baseKarta), interest: `0\\u00A0тг.`, payment: formatMoney(state.price), rawInterest: 0, rawPayment: state.price });
        
        if (state.installmentMonths > 3) {
            let remainingMonths = state.installmentMonths - (85 / 30);
            if (remainingMonths > 0) {
                let kartaEvents = [];
                let remainingFullMonths = Math.floor(remainingMonths);
                
                for(let m=1; m<=remainingFullMonths; m++) {
                    let pDate = addMonths(graceEndDate, m);
                    kartaEvents.push({ date: pDate, type: 'milestone', label: formatRuDate(pDate), amount: 0 });
                }
                
                let fraction = remainingMonths - remainingFullMonths;
                if (fraction > 0) {
                    let finalDate = new Date(graceEndDate.getTime() + remainingMonths * 30 * 24 * 60 * 60 * 1000);
                    kartaEvents.push({ date: finalDate, type: 'milestone', label: `Остаток дней`, amount: 0 });
                }
                
                let kartaSim = simulateKaspiDeposit(baseKarta, graceEndDate, kartaEvents, state.depositRate);
                
                for (let row of kartaSim.scheduleRows) {
                    window.schedules.karta.push({
                        date: row.date,
                        balance: formatMoney(row.balance),
                        interest: `+${formatMoney(row.rawInterest)}`,
                        payment: "0\\u00A0тг.",
                        rawInterest: row.rawInterest,
                        rawPayment: 0
                    });
                }
                kartaBenefit = kartaSim.finalBalance;
            } else {
                kartaBenefit = baseKarta;
            }"""

js = js.replace(karta_old, karta_new)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

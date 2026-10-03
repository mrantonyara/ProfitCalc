import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

iron_old = """        let ironCashback = state.price * 0.04; // 4%
        if (ironCashback > 15000) ironCashback = 15000;
        let ironBalance = ironCashback;
        
        window.schedules.iron = [];
        window.schedules.iron.push({ date: `Покупка (${formatRuDate(today)})`, balance: "0\\u00A0тг.", interest: `+${formatMoney(ironCashback)} (Кешбэк)`, payment: "0\\u00A0тг.", rawInterest: ironCashback, rawPayment: 0 });
        
        let ironDelayInt = ironBalance * dailyRate * diffDays;
        ironBalance += ironDelayInt;
        
        if (diffDays > 0) {
            window.schedules.iron.push({ date: `Ожидание (${diffDays} дн.)`, balance: formatMoney(ironBalance), interest: `+${formatMoney(ironDelayInt)}`, payment: "0\\u00A0тг.", rawInterest: ironDelayInt, rawPayment: 0 });
        }

        for (let m = 1; m <= state.installmentMonths; m++) {
            let int = ironBalance * monthlyRate;
            ironBalance += int;
            window.schedules.iron.push({ date: formatRuDate(addMonths(delivery, m)), balance: formatMoney(ironBalance), interest: `+${formatMoney(int)}`, payment: "0\\u00A0тг.", rawInterest: int, rawPayment: 0 });
        }
        
        let ironBenefit = ironBalance;"""

iron_new = """        let ironCashback = state.price * 0.04; // 4%
        if (ironCashback > 15000) ironCashback = 15000;
        
        window.schedules.iron = [];
        window.schedules.iron.push({ date: `Покупка (${formatRuDate(today)})`, balance: "0\\u00A0тг.", interest: `+${formatMoney(ironCashback)} (Кешбэк)`, payment: "0\\u00A0тг.", rawInterest: ironCashback, rawPayment: 0 });
        
        let ironEvents = [];
        if (diffDays > 0) {
            ironEvents.push({ date: new Date(delivery), type: 'milestone', label: `Ожидание до ${formatRuDate(delivery)}`, amount: 0 });
        }
        for (let m = 1; m <= state.installmentMonths; m++) {
            let pDate = addMonths(delivery, m);
            ironEvents.push({ date: pDate, type: 'milestone', label: formatRuDate(pDate), amount: 0 });
        }
        
        let ironSim = simulateKaspiDeposit(ironCashback, today, ironEvents, state.depositRate);
        
        for (let row of ironSim.scheduleRows) {
            window.schedules.iron.push({
                date: row.date,
                balance: formatMoney(row.balance),
                interest: `+${formatMoney(row.rawInterest)}`,
                payment: "0\\u00A0тг.",
                rawInterest: row.rawInterest,
                rawPayment: 0
            });
        }
        
        let ironBenefit = ironSim.finalBalance;"""

js = js.replace(iron_old, iron_new)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

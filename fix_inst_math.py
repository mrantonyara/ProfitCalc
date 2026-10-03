import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

inst_old = """        let depositBalance = state.price;
        let earnedInterest = 0;
        let pmt = state.price / state.installmentMonths;
        let interestHistory = [];
        
        let delayInt = depositBalance * dailyRate * diffDays;
        depositBalance += delayInt;
        earnedInterest += delayInt;
        
        if (diffDays > 0) {
            window.schedules.inst.push({ date: `Ожидание до ${formatRuDate(delivery)}`, balance: formatMoney(depositBalance), interest: `+${formatMoney(delayInt)}`, payment: "0\\u00A0₸" });
        }

        for (let m = 1; m <= state.installmentMonths; m++) {
            let int = depositBalance * monthlyRate;
            depositBalance += int;
            earnedInterest += int;
            depositBalance -= pmt;
            
            window.schedules.inst.push({ date: formatRuDate(addMonths(delivery, m)), balance: formatMoney(Math.max(0, depositBalance)), interest: `+${formatMoney(int)}`, payment: formatMoney(pmt), rawInterest: int, rawPayment: pmt });
            interestHistory.push(earnedInterest);
        }

        let instBenefit = earnedInterest + state.installmentBonus;"""

inst_new = """        let pmt = state.price / state.installmentMonths;
        
        let instEvents = [];
        if (diffDays > 0) {
            instEvents.push({ date: new Date(delivery), type: 'milestone', label: `Ожидание до ${formatRuDate(delivery)}`, amount: 0 });
        }
        for (let m = 1; m <= state.installmentMonths; m++) {
            let pDate = addMonths(delivery, m);
            instEvents.push({ date: pDate, type: 'payment', label: formatRuDate(pDate), amount: pmt });
        }
        
        let instSim = simulateKaspiDeposit(state.price, today, instEvents, state.depositRate);
        
        for (let row of instSim.scheduleRows) {
            window.schedules.inst.push({
                date: row.date,
                balance: formatMoney(Math.max(0, row.balance)),
                interest: `+${formatMoney(row.rawInterest)}`,
                payment: formatMoney(row.rawPayment),
                rawInterest: row.rawInterest,
                rawPayment: row.rawPayment
            });
        }
        
        let earnedInterest = instSim.totalInterest;
        let instBenefit = earnedInterest + state.installmentBonus;"""

js = js.replace(inst_old, inst_new)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

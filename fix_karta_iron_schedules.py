import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update iron schedule
iron_old = "        window.schedules.iron = [];"
iron_new = """        window.schedules.iron = [];
        window.schedules.iron.push({ date: `Покупка (${formatRuDate(today)})`, balance: "0\\u00A0тг.", interest: `+${formatMoney(ironCashback)} (Кешбэк)`, payment: "0\\u00A0тг.", rawInterest: ironCashback, rawPayment: 0 });"""
js = js.replace(iron_old, iron_new)

# 2. Update karta schedule
karta_old = """        window.schedules.karta = [];
        window.schedules.karta.push({ date: `Грейс до ${formatRuDate(new Date(today.getTime() + 85 * 24 * 60 * 60 * 1000))}`, balance: formatMoney(kartaBalance), interest: `+${formatMoney(graceInterest)}`, payment: "0\\u00A0тг.", rawInterest: graceInterest, rawPayment: 0 });"""

karta_new = """        window.schedules.karta = [];
        window.schedules.karta.push({ date: `Покупка (${formatRuDate(today)})`, balance: formatMoney(state.price), interest: `+${formatMoney(kartaCashback)} (Кешбэк)`, payment: "0\\u00A0тг.", rawInterest: kartaCashback, rawPayment: 0 });
        window.schedules.karta.push({ date: `Грейс до ${formatRuDate(new Date(today.getTime() + 85 * 24 * 60 * 60 * 1000))}`, balance: formatMoney(state.price), interest: `+${formatMoney(graceInterest)}`, payment: "0\\u00A0тг.", rawInterest: graceInterest, rawPayment: 0 });
        window.schedules.karta.push({ date: `Погашение долга по карте`, balance: formatMoney(kartaBalance), interest: `0\\u00A0тг.`, payment: formatMoney(state.price), rawInterest: 0, rawPayment: state.price });"""
js = js.replace(karta_old, karta_new)

# 3. Update downloadPDF table headers
headers_old = """    if (type === 'inst') {
        headers = ['Период', 'Остаток депозита', 'Начисленные %', 'Платеж банку'];
        widths = ['*', 'auto', 'auto', 'auto'];
    } else if (type === 'gold') {
        headers = ['Событие', 'Начисленные Бонусы'];
        widths = ['*', 'auto'];
    } else {
        headers = ['Период', 'Сумма на депозите', 'Начисленные %'];
        widths = ['*', 'auto', 'auto'];
    }"""

headers_new = """    if (type === 'inst' || type === 'karta') {
        headers = ['Период', 'Остаток депозита', 'Начисления (Кешбэк и %)', 'Платеж банку'];
        widths = ['*', 'auto', 'auto', 'auto'];
    } else if (type === 'gold') {
        headers = ['Событие', 'Начисленные Бонусы'];
        widths = ['*', 'auto'];
    } else { // iron
        headers = ['Период', 'Сумма на депозите', 'Начисления (Кешбэк и %)'];
        widths = ['*', 'auto', 'auto'];
    }"""
js = js.replace(headers_old, headers_new)

# 4. Update rowData construction in downloadPDF
rowdata_old = """        if (type === 'inst') {
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
        } else {
            rowData = [
                row.date,
                row.balance.replace(/₸/g, 'тг.'),
                { text: row.interest.replace(/₸/g, 'тг.'), color: '#0079C2' }
            ];
        }"""

rowdata_new = """        if (type === 'inst' || type === 'karta') {
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
        }"""
js = js.replace(rowdata_old, rowdata_new)

# 5. Update Total Row in downloadPDF
total_old = """    if (type === 'inst') {
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
    } else {
        tableBody.push([
            { text: 'Итого', bold: true },
            '',
            { text: '+' + formatMoney(totalInterest).replace(/₸/g, 'тг.'), color: '#0079C2', bold: true }
        ]);
    }"""

total_new = """    if (type === 'inst' || type === 'karta') {
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
    }"""
js = js.replace(total_old, total_new)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

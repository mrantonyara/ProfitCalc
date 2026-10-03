import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_loop = """    schedule.forEach(row => {
        let rowData = [];
        if (type === 'inst') {
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
        }
        tableBody.push(rowData);
    });"""

new_loop = """    let totalInterest = 0;
    let totalPayment = 0;

    schedule.forEach(row => {
        totalInterest += row.rawInterest || 0;
        totalPayment += row.rawPayment || 0;
        
        let rowData = [];
        if (type === 'inst') {
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
        }
        tableBody.push(rowData);
    });

    // Add Total Row
    if (type === 'inst') {
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
    }
"""

js = js.replace(old_loop, new_loop)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

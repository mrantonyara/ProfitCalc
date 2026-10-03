import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_loop = """    schedule.forEach(row => {
        tableBody.push([
            row.date,
            row.balance,
            { text: row.interest, color: '#0079C2' },
            { text: row.payment, color: '#f14635' }
        ]);
    });"""

new_loop = """    schedule.forEach(row => {
        // Заменяем символ ₸ на 'тг.' для PDF, так как стандартный шрифт Roboto его не всегда поддерживает
        tableBody.push([
            row.date,
            row.balance.replace(/₸/g, 'тг.'),
            { text: row.interest.replace(/₸/g, 'тг.'), color: '#0079C2' },
            { text: row.payment.replace(/₸/g, 'тг.'), color: '#f14635' }
        ]);
    });"""

js = js.replace(old_loop, new_loop)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

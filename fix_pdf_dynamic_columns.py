import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace from `const tableBody = [` to `widths: [ '*', 'auto', 'auto', 'auto' ],\n                    body: tableBody`
regex = r'const tableBody = \[.*?widths: \[ \'\*\', \'auto\', \'auto\', \'auto\' \],\n                    body: tableBody'

replacement = """let headers = [];
    let widths = [];
    
    if (type === 'inst') {
        headers = ['Период', 'Остаток депозита', 'Начисленные %', 'Платеж банку'];
        widths = ['*', 'auto', 'auto', 'auto'];
    } else if (type === 'gold') {
        headers = ['Событие', 'Начисленные Бонусы'];
        widths = ['*', 'auto'];
    } else {
        headers = ['Период', 'Сумма на депозите', 'Начисленные %'];
        widths = ['*', 'auto', 'auto'];
    }

    const tableBody = [
        headers.map(h => ({ text: h, style: 'tableHeader' }))
    ];
    
    schedule.forEach(row => {
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
                    body: tableBody"""

js = re.sub(regex, replacement, js, flags=re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

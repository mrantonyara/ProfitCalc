import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# We need to replace the entire window.downloadPDF function.
# Let's find its start and end.
start_idx = js.find('window.downloadPDF = function(e, type) {')
if start_idx != -1:
    js_before = js[:start_idx]
    
    new_download = """window.downloadPDF = function(e, type) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const schedule = window.schedules && window.schedules[type];
    if (!schedule || schedule.length === 0) return;
    
    let title = "График";
    if (type === 'inst') title = "График платежей по рассрочке";
    if (type === 'gold') title = "Kaspi Gold (бонусы)";
    if (type === 'iron') title = "График дохода: BCC ironCard";
    if (type === 'karta') title = "График дохода: BCC #картакарта";

    // Build table body for pdfmake
    // First row is the header
    const tableBody = [
        [
            { text: 'Период', style: 'tableHeader' },
            { text: 'Остаток депозита', style: 'tableHeader' },
            { text: 'Начисленные %', style: 'tableHeader' },
            { text: 'Платеж банку', style: 'tableHeader' }
        ]
    ];
    
    schedule.forEach(row => {
        tableBody.push([
            row.date,
            row.balance,
            { text: row.interest, color: '#0079C2' },
            { text: row.payment, color: '#f14635' }
        ]);
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
                    widths: [ '*', 'auto', 'auto', 'auto' ],
                    body: tableBody
                },
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 0 : 1;
                    },
                    vLineWidth: function (i, node) {
                        return 0;
                    },
                    hLineColor: function (i, node) {
                        return '#eeeeee';
                    },
                    paddingLeft: function(i, node) { return 10; },
                    paddingRight: function(i, node) { return 10; },
                    paddingTop: function(i, node) { return 8; },
                    paddingBottom: function(i, node) { return 8; },
                }
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                color: '#f14635',
                alignment: 'center',
                margin: [0, 0, 0, 20]
            },
            tableHeader: {
                bold: true,
                fontSize: 12,
                color: '#1c1c1e',
                fillColor: '#f5f6f8'
            }
        },
        defaultStyle: {
            fontSize: 11,
            color: '#1c1c1e'
        }
    };

    pdfMake.createPdf(docDefinition).download(`schedule_${type}.pdf`);
};"""
    js = js_before + new_download

    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(js)

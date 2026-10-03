import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_code = """        let fileName = prompt("Введите название для PDF (например: Холодильник), или просто нажмите ОК:", title);
    if (fileName === null) return; // User cancelled
    
    fileName = fileName.trim();
    if (fileName === '') fileName = title;
    
    if (!fileName.toLowerCase().endsWith('.pdf')) {
        fileName += '.pdf';
    }

    pdfMake.createPdf(docDefinition).download(fileName);"""

new_code = "    pdfMake.createPdf(docDefinition).download(fileName);"

js = js.replace(old_code, new_code)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

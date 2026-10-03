import re

with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Remove installment-bonus-container
code = re.sub(r'<div id="installment-bonus-container".*?</div>\s*</div>', '</div>', code, flags=re.DOTALL)

# 2. Add delivery date
code = code.replace('<label class="input-label">Срок (месяцев)</label>',
    '<label class="input-label mt-12">Дата доставки</label>\n                <input type="date" id="delivery-date" class="input-field" style="font-family: inherit; margin-bottom: 16px;">\n\n                <label class="input-label">Срок (месяцев)</label>')

# 3. Inject html2pdf script
code = code.replace('</head>', '    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>\n</head>')

# 4. Inject PDF buttons right before .info-btn
def pdf_btn(type_id):
    return f'''<div class="pdf-btn" onclick="downloadPDF(event, '{type_id}')" style="margin-left: auto; padding: 12px 4px; cursor: pointer; color: #8e8e93; display: flex; align-items: center; justify-content: center;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="12" y1="18" x2="12" y2="12"></line>
                                <line x1="9" y1="15" x2="12" y2="18"></line>
                                <line x1="15" y1="15" x2="12" y2="18"></line>
                            </svg>
                        </div>'''

code = code.replace('<strong class="text-red" id="val-gold">0 ₸</strong>', '<strong class="text-red" id="val-gold">0 ₸</strong>\n                        ' + pdf_btn('gold'))
code = code.replace('<strong class="text-red" id="val-inst">0 ₸</strong>', '<strong class="text-red" id="val-inst">0 ₸</strong>\n                        ' + pdf_btn('inst'))
code = code.replace('<strong class="text-red" id="val-iron">0 ₸</strong>', '<strong class="text-red" id="val-iron">0 ₸</strong>\n                        ' + pdf_btn('iron'))
code = code.replace('<strong class="text-red" id="val-karta">0 ₸</strong>', '<strong class="text-red" id="val-karta">0 ₸</strong>\n                        ' + pdf_btn('karta'))

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(code)

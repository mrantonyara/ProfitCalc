import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Date formatters
date_helpers = """    const monthNamesRu = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const formatRuDate = (d) => `${d.getDate()} ${monthNamesRu[d.getMonth()]} ${d.getFullYear()} г.`;
    const addMonths = (date, months) => {
        let d = new Date(date);
        let expectedMonth = (d.getMonth() + months) % 12;
        d.setMonth(d.getMonth() + months);
        if (d.getMonth() !== expectedMonth && d.getDate() < 4) {
            d.setDate(0);
        }
        return d;
    };"""

js = js.replace("let state = {", date_helpers + "\n\n    let state = {")

# 2. Update loop dates
js = js.replace("`Месяц ${m}`", "formatRuDate(addMonths(delivery, m))")
js = js.replace('date: "Грейс (85 дн.)"', 'date: `Грейс до ${formatRuDate(new Date(today.getTime() + 85 * 24 * 60 * 60 * 1000))}`')
js = js.replace("`След. месяц ${m}`", "formatRuDate(addMonths(new Date(today.getTime() + 85 * 24 * 60 * 60 * 1000), m))")
js = js.replace('date: "Сразу"', 'date: formatRuDate(today)')

# 3. Modify downloadPDF to open modal instead of native prompt
modal_logic = """
let currentDownloadType = null;
let currentDownloadTitle = null;

window.downloadPDF = function(e, type) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const schedule = window.schedules && window.schedules[type];
    if (!schedule || schedule.length === 0) return;
    
    currentDownloadType = type;
    
    let title = "График";
    if (type === 'inst') title = "График платежей по рассрочке";
    if (type === 'gold') title = "Kaspi Gold (бонусы)";
    if (type === 'iron') title = "График дохода: BCC ironCard";
    if (type === 'karta') title = "График дохода: BCC #картакарта";
    
    currentDownloadTitle = title;
    
    document.getElementById('pdf-filename-input').value = '';
    document.getElementById('pdf-modal-overlay').classList.add('show');
};

window.closePdfModal = function() {
    document.getElementById('pdf-modal-overlay').classList.remove('show');
    currentDownloadType = null;
};

window.confirmPdfDownload = function() {
    if (!currentDownloadType) return;
    
    let fileName = document.getElementById('pdf-filename-input').value.trim();
    
    if (fileName === '') {
        // Generate DDMMYY-HHMM
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = String(d.getFullYear()).slice(-2);
        const hh = String(d.getHours()).padStart(2, '0');
        const mn = String(d.getMinutes()).padStart(2, '0');
        fileName = `${dd}${mm}${yy}-${hh}${mn}`;
    }
    
    if (!fileName.toLowerCase().endsWith('.pdf')) {
        fileName += '.pdf';
    }
    
    const type = currentDownloadType;
    const schedule = window.schedules[type];
    const title = currentDownloadTitle;
    
    closePdfModal();
"""

# Replace the beginning of downloadPDF up to `const tableBody = [`
download_regex = r'window\.downloadPDF = function\(e, type\) \{.*?const tableBody = \['

js = re.sub(download_regex, modal_logic + "\n    const tableBody = [", js, flags=re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

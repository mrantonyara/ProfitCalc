with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

modal_html = """
    <!-- Modal for PDF Download -->
    <div id="pdf-modal-overlay" class="modal-overlay">
        <div class="modal-card">
            <h3 style="margin-bottom: 12px; color: #1c1c1e;">Скачать график</h3>
            <p style="font-size: 14px; color: #8e8e93; margin-bottom: 16px;">Укажите название файла, чтобы не потерять его (необязательно).</p>
            <input type="text" id="pdf-filename-input" class="input-field" placeholder="Например: Холодильник" style="margin-bottom: 20px;">
            <div style="display: flex; gap: 12px;">
                <button class="modal-btn modal-btn-cancel" onclick="closePdfModal()">Отмена</button>
                <button class="modal-btn modal-btn-primary" onclick="confirmPdfDownload()">Скачать PDF</button>
            </div>
        </div>
    </div>
"""

# Insert right before the last closing tags
if "</body>" in html:
    html = html.replace("</body>", modal_html + "\n</body>")
else:
    html += modal_html

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

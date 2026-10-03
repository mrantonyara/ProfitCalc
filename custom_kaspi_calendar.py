import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove Flatpickr
html = re.sub(r'<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr.*?>\n', '', html)
html = re.sub(r'<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>\n', '', html)
html = re.sub(r'<script src="https://npmcdn.com/flatpickr.*?>\n', '', html)

# 2. Add custom date modal HTML
modal_html = """
    <!-- Custom Kaspi Date Picker Modal -->
    <div id="kaspi-date-overlay" class="modal-overlay">
        <div class="modal-card" style="padding: 0; overflow: hidden; max-width: 360px;">
            <div style="background: #f5f6f8; padding: 16px; text-align: center; border-bottom: 1px solid #e5e5ea;">
                <h3 style="margin: 0; font-size: 18px; color: #1c1c1e;">Дата доставки</h3>
            </div>
            <div style="padding: 16px;">
                <div class="kaspi-calendar-header">
                    <button class="cal-btn" onclick="prevMonth()">❮</button>
                    <span id="cal-month-year" style="font-weight: 700; font-size: 16px;">Октябрь 2026</span>
                    <button class="cal-btn" onclick="nextMonth()">❯</button>
                </div>
                <div class="kaspi-calendar-week">
                    <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
                </div>
                <div id="kaspi-calendar-grid" class="kaspi-calendar-grid">
                    <!-- Days will be injected here -->
                </div>
                <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="quick-date-btn" onclick="selectQuickDate(0)">Сегодня</button>
                    <button class="quick-date-btn" onclick="selectQuickDate(1)">Завтра</button>
                    <button class="quick-date-btn" onclick="selectQuickDate(3)">Через 3 дня</button>
                    <button class="quick-date-btn" onclick="selectQuickDate(7)">Через неделю</button>
                </div>
            </div>
            <div style="padding: 16px; border-top: 1px solid #e5e5ea; display: flex; gap: 12px;">
                <button class="modal-btn modal-btn-cancel" onclick="closeDateModal()">Отмена</button>
                <button class="modal-btn modal-btn-primary" onclick="confirmDateModal()">Выбрать</button>
            </div>
        </div>
    </div>
"""

# Inject before </body>
html = html.replace('</body>', modal_html + '\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

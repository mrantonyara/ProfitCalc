import re

# 1. Update HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('class="text-red"', '')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Update JS
with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# In benefits.forEach loop:
loop_target = "benefits.forEach(item => {\n            const el = document.getElementById(item.id);"
loop_replacement = """const valueEls = { 'res-karta': valKarta, 'res-inst': valInst, 'res-gold': valGold, 'res-iron': valIron };

        // Подсвечиваем самый выгодный (и убираем с остальных), добавляем подсказки
        benefits.forEach(item => {
            const el = document.getElementById(item.id);
            const valEl = valueEls[item.id];
            
            if (item.val === -1) {
                valEl.style.color = '#8e8e93';
            } else if (item.val === maxVal && maxVal > 0) {
                valEl.style.color = '#12a04b'; // Тёмно-зелёный
            } else {
                valEl.style.color = '#1c1c1e'; // Чёрный
            }
"""

js = js.replace("// Подсвечиваем самый выгодный (и убираем с остальных), добавляем подсказки\n        " + loop_target, loop_replacement)

# Also fix the text-red inside tooltips
js = js.replace('<span class="text-red">', '<span style="color: #12a04b;">')

# And when price <= 0, reset colors
price_zero_target = """        if (state.price <= 0) {
            valInst.textContent = '0 ₸';
            valGold.textContent = '0 ₸';
            valIron.textContent = '0 ₸';"""
price_zero_replacement = """        if (state.price <= 0) {
            valInst.textContent = '0 ₸';
            valGold.textContent = '0 ₸';
            valIron.textContent = '0 ₸';
            valInst.style.color = '#1c1c1e';
            valGold.style.color = '#1c1c1e';
            valIron.style.color = '#1c1c1e';"""
js = js.replace(price_zero_target, price_zero_replacement)

# When customCashbackRate !== 0 and price <= 0
karta_reset_target = """            } else {
                valKarta.textContent = '0 ₸';
                descKarta.textContent = 'Кешбэк + 85 дней';
                valKarta.style.color = '';"""
karta_reset_replacement = """            } else {
                valKarta.textContent = '0 ₸';
                descKarta.textContent = 'Кешбэк + 85 дней';
                valKarta.style.color = '#1c1c1e';"""
js = js.replace(karta_reset_target, karta_reset_replacement)


with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)


import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Flatpickr initialization
flatpickr_init = """
    if (deliveryDateInput) {
        flatpickr(deliveryDateInput, {
            locale: "ru",
            defaultDate: new Date(),
            dateFormat: "d.m.Y",
            disableMobile: true, // Use flatpickr even on mobile for consistency
            onChange: function(selectedDates) {
                if (selectedDates.length > 0) {
                    state.deliveryDate = selectedDates[0];
                    calculate();
                }
            }
        });
        state.deliveryDate = new Date();
    }
"""
js = re.sub(r'if \(deliveryDateInput\)\s*\{[\s\S]*?calculate\(\);\n\s*\}\);\n\s*\}', flatpickr_init.strip(), js)

# 2. Fix PDF invisible container rendering
pdf_fix = """
    const container = document.createElement('div');
    container.innerHTML = tableHtml;
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '800px';
    container.style.zIndex = '-100';
    // Remove absolute top: -9999px because html2canvas ignores off-screen or empty bounds sometimes
"""
js = js.replace("container.style.position = 'absolute';\n    container.style.top = '-9999px';", pdf_fix)

# 3. Remove hardcoded margin/padding shifts from highlight
js = js.replace("el.style.padding = '8px';", "")
js = js.replace("el.style.margin = '4px -8px';", "")
js = js.replace("el.style.border = '1px solid var(--primary)';", "el.style.boxShadow = 'inset 0 0 0 1px var(--primary)';")

js = js.replace("el.style.padding = '16px 0';", "")
js = js.replace("el.style.margin = '0';", "")
js = js.replace("el.style.borderRadius = '0';", "")
js = js.replace("el.style.border = 'none';", "el.style.boxShadow = 'none';")

# 4. Enhance explanation with visual bar
# Karta
karta_old = "explanation = `Включает ${formatMoney(kartaCashback)} кешбэка и ${formatMoney(graceInterest)} процентов по депозиту за 85 дней без % по карте. Затем сумма продолжит расти.`;"
karta_new = """let kartaPct = Math.round((kartaCashback / item.val) * 100);
                explanation = `
                    <div style="color: #333333; margin-bottom: 8px;">Кешбэк + процент на эту сумму за 85 дней грейс-периода.</div>
                    <div class="visual-bar-container">
                        <div class="visual-bar-part" style="width: ${kartaPct}%; background: #0079C2;"></div>
                        <div class="visual-bar-part" style="width: ${100 - kartaPct}%; background: #12a04b;"></div>
                    </div>
                    <div class="visual-legend">
                        <div><span class="visual-dot" style="background: #0079C2;"></span>Кешбэк: <strong>${formatMoney(kartaCashback)}</strong></div>
                        <div><span class="visual-dot" style="background: #12a04b;"></span>Проценты (85 дн.): <strong>${formatMoney(graceInterest)}</strong></div>
                    </div>
                `;"""
js = js.replace(karta_old, karta_new)

# Inst
inst_old = "explanation = `Вы заработаете ${formatMoney(instInterest)} процентов на депозите за ${state.installmentMonths} мес.` + (state.installmentBonus > 0 ? ` + ${formatMoney(state.installmentBonus)} по акции.` : '');"
inst_new = """let instTot = instInterest + state.installmentBonus;
                let intPct = Math.round((instInterest / instTot) * 100) || 100;
                let bonusPct = 100 - intPct;
                explanation = `
                    <div style="color: #333333; margin-bottom: 8px;">Сумма лежит на депозите, пока вы платите рассрочку.</div>
                    <div class="visual-bar-container">
                        <div class="visual-bar-part" style="width: ${intPct}%; background: #12a04b;"></div>
                        ${state.installmentBonus > 0 ? `<div class="visual-bar-part" style="width: ${bonusPct}%; background: #f14635;"></div>` : ''}
                    </div>
                    <div class="visual-legend">
                        <div><span class="visual-dot" style="background: #12a04b;"></span>Проценты: <strong>${formatMoney(instInterest)}</strong></div>
                        ${state.installmentBonus > 0 ? `<div><span class="visual-dot" style="background: #f14635;"></span>Бонус: <strong>${formatMoney(state.installmentBonus)}</strong></div>` : ''}
                    </div>
                `;"""
js = js.replace(inst_old, inst_new)

# Gold
gold_old = "explanation = `Вы получите ${formatMoney(state.kaspiGoldBonusAmount)} Kaspi бонусов сразу. (Бонусы нельзя положить на депозит)`;"
gold_new = """explanation = `
                    <div style="color: #333333; margin-bottom: 8px;">Бонусы зачисляются сразу, но не растут на депозите.</div>
                    <div class="visual-bar-container">
                        <div class="visual-bar-part" style="width: 100%; background: #f14635;"></div>
                    </div>
                    <div class="visual-legend">
                        <div><span class="visual-dot" style="background: #f14635;"></span>Kaspi Бонусы: <strong>${formatMoney(state.kaspiGoldBonusAmount)}</strong></div>
                    </div>
                `;"""
js = js.replace(gold_old, gold_new)

# Iron
iron_old = "explanation = `Вы получите ${formatMoney(ironCashback)} кешбэка деньгами сразу, и они принесут сложный процент на депозите за ${state.installmentMonths} мес.`;"
iron_new = """let ironTot = item.val;
                let ironCashPct = Math.round((ironCashback / ironTot) * 100);
                let ironInt = ironTot - ironCashback;
                explanation = `
                    <div style="color: #333333; margin-bottom: 8px;">Кешбэк деньгами сразу кладется на депозит.</div>
                    <div class="visual-bar-container">
                        <div class="visual-bar-part" style="width: ${ironCashPct}%; background: #0079C2;"></div>
                        <div class="visual-bar-part" style="width: ${100 - ironCashPct}%; background: #12a04b;"></div>
                    </div>
                    <div class="visual-legend">
                        <div><span class="visual-dot" style="background: #0079C2;"></span>Кешбэк (4%): <strong>${formatMoney(ironCashback)}</strong></div>
                        <div><span class="visual-dot" style="background: #12a04b;"></span>Проценты: <strong>${formatMoney(ironInt)}</strong></div>
                    </div>
                `;"""
js = js.replace(iron_old, iron_new)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

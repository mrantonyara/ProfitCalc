import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update window.schedules.push to include raw values
js = js.replace('window.schedules.inst.push({ date: `Ожидание до ${formatRuDate(delivery)}`, balance: formatMoney(depositBalance), interest: `+${formatMoney(delayInt)}`, payment: "0\\u00A0тг." });',
                'window.schedules.inst.push({ date: `Ожидание до ${formatRuDate(delivery)}`, balance: formatMoney(depositBalance), interest: `+${formatMoney(delayInt)}`, payment: "0\\u00A0тг.", rawInterest: delayInt, rawPayment: 0 });')

js = js.replace('window.schedules.inst.push({ date: formatRuDate(addMonths(delivery, m)), balance: formatMoney(Math.max(0, depositBalance)), interest: `+${formatMoney(int)}`, payment: formatMoney(pmt) });',
                'window.schedules.inst.push({ date: formatRuDate(addMonths(delivery, m)), balance: formatMoney(Math.max(0, depositBalance)), interest: `+${formatMoney(int)}`, payment: formatMoney(pmt), rawInterest: int, rawPayment: pmt });')

js = js.replace('window.schedules.gold.push({ date: formatRuDate(today), balance: "0\\u00A0тг.", interest: `+${formatMoney(goldBenefit)}`, payment: "0\\u00A0тг." });',
                'window.schedules.gold.push({ date: formatRuDate(today), balance: "0\\u00A0тг.", interest: `+${formatMoney(goldBenefit)}`, payment: "0\\u00A0тг.", rawInterest: goldBenefit, rawPayment: 0 });')

js = js.replace('window.schedules.iron.push({ date: `Ожидание (${diffDays} дн.)`, balance: formatMoney(ironBalance), interest: `+${formatMoney(ironDelayInt)}`, payment: "0\\u00A0тг." });',
                'window.schedules.iron.push({ date: `Ожидание (${diffDays} дн.)`, balance: formatMoney(ironBalance), interest: `+${formatMoney(ironDelayInt)}`, payment: "0\\u00A0тг.", rawInterest: ironDelayInt, rawPayment: 0 });')

js = js.replace('window.schedules.iron.push({ date: formatRuDate(addMonths(delivery, m)), balance: formatMoney(ironBalance), interest: `+${formatMoney(int)}`, payment: "0\\u00A0тг." });',
                'window.schedules.iron.push({ date: formatRuDate(addMonths(delivery, m)), balance: formatMoney(ironBalance), interest: `+${formatMoney(int)}`, payment: "0\\u00A0тг.", rawInterest: int, rawPayment: 0 });')

js = js.replace('window.schedules.karta.push({ date: `Грейс до ${formatRuDate(new Date(today.getTime() + 85 * 24 * 60 * 60 * 1000))}`, balance: formatMoney(kartaBalance), interest: `+${formatMoney(graceInterest)}`, payment: "0\\u00A0тг." });',
                'window.schedules.karta.push({ date: `Грейс до ${formatRuDate(new Date(today.getTime() + 85 * 24 * 60 * 60 * 1000))}`, balance: formatMoney(kartaBalance), interest: `+${formatMoney(graceInterest)}`, payment: "0\\u00A0тг.", rawInterest: graceInterest, rawPayment: 0 });')

js = js.replace('window.schedules.karta.push({ date: formatRuDate(addMonths(new Date(today.getTime() + 85 * 24 * 60 * 60 * 1000), m)), balance: formatMoney(kartaBalance), interest: `+${formatMoney(int)}`, payment: "0\\u00A0тг." });',
                'window.schedules.karta.push({ date: formatRuDate(addMonths(new Date(today.getTime() + 85 * 24 * 60 * 60 * 1000), m)), balance: formatMoney(kartaBalance), interest: `+${formatMoney(int)}`, payment: "0\\u00A0тг.", rawInterest: int, rawPayment: 0 });')

js = js.replace('window.schedules.karta.push({ date: `Остаток дней`, balance: formatMoney(kartaBalance), interest: `+${formatMoney(int)}`, payment: "0\\u00A0тг." });',
                'window.schedules.karta.push({ date: `Остаток дней`, balance: formatMoney(kartaBalance), interest: `+${formatMoney(int)}`, payment: "0\\u00A0тг.", rawInterest: int, rawPayment: 0 });')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

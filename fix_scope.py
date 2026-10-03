import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Remove it from inside calculate()
js = js.replace('const formatMoney = (amount) => Math.round(amount).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, "\\u00A0") + "\\u00A0₸";', '')
js = js.replace('    const parseNumber = (val) => {\n        const rawValue = val.replace(/[^\\d.]/g, \'\');\n        return parseFloat(rawValue) || 0;\n    };', '')

# 2. Add it globally at the top
global_funcs = """const formatMoney = (amount) => Math.round(amount).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, "\\u00A0") + "\\u00A0₸";
const parseNumber = (val) => {
    const rawValue = val.replace(/[^\\d.]/g, '');
    return parseFloat(rawValue) || 0;
};
"""

js = global_funcs + "\n" + js

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)

with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('app.js', 'w', encoding='utf-8') as f:
    for line in lines:
        if line.strip() == ");" and "const deliveryDateInput" not in line:
            # Let's just remove rogue ");" on line 39
            pass
        else:
            f.write(line)

import os

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    changed = False
    for i, line in enumerate(lines):
        if line.startswith('import { DashboardData } from'):
            lines[i] = line.replace('import { DashboardData }', 'import type { DashboardData }')
            changed = True
        elif line.startswith('import { DashboardData, EmpresaInfo } from'):
            lines[i] = line.replace('import { DashboardData, EmpresaInfo }', 'import type { DashboardData, EmpresaInfo }')
            changed = True
            
    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(f"Fixed: {path}")

for root, dirs, f in os.walk('src/admin'):
    for file in f:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

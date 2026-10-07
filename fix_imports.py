import re

with open("frontend/src/app/features/dashboard/dashboard-page.component.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Fix messy imports 
content = content.replace('import { ResilienceWidgetComponent, DailyIntentionComponent } from "../../shared/components/resilience-widget.component";', 'import { ResilienceWidgetComponent } from "../../shared/components/resilience-widget.component";')
content = content.replace('ResilienceWidgetComponent, DailyIntentionComponent, ResilienceWidgetComponent, DailyIntentionComponent', 'ResilienceWidgetComponent, DailyIntentionComponent')
content = content.replace('ResilienceWidgetComponent, DailyIntentionComponent, DailyIntentionComponent', 'ResilienceWidgetComponent, DailyIntentionComponent')
content = content.replace('ResilienceWidgetComponent, ResilienceWidgetComponent, DailyIntentionComponent', 'ResilienceWidgetComponent, DailyIntentionComponent')

# ensure clean imports block
lines = content.split('\n')
clean_lines = []
imports_set = set()
for line in lines:
    if line.startswith('import ') and 'shared/components/resilience' in line:
        if line in imports_set: continue
        imports_set.add(line)
        clean_lines.append(line)
    elif line.startswith('import ') and 'shared/components/daily-intention' in line:
        if line in imports_set: continue
        imports_set.add(line)
        clean_lines.append(line)
    else:
        clean_lines.append(line)
        
with open("frontend/src/app/features/dashboard/dashboard-page.component.ts", "w", encoding="utf-8") as f:
    f.write('\n'.join(clean_lines))

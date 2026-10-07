import sys

with open("frontend/src/app/features/dashboard/dashboard-page.component.ts", "r", encoding="utf-8") as f:
    content = f.read()

import_str = 'import { ResilienceWidgetComponent } from "../../shared/components/resilience-widget.component";'
import_repl = import_str + '\nimport { DailyIntentionComponent } from "../../shared/components/daily-intention.component";'
content = content.replace(import_str, import_repl)

imports_array = 'ResilienceWidgetComponent'
imports_array_repl = imports_array + ', DailyIntentionComponent'
content = content.replace(imports_array, imports_array_repl)

widget_str = '<app-resilience-widget class="block"></app-resilience-widget>'
widget_repl = '<div class="grid gap-4 lg:grid-cols-2"><app-resilience-widget class="block"></app-resilience-widget><app-daily-intention class="block"></app-daily-intention></div>'
content = content.replace(widget_str, widget_repl)

with open("frontend/src/app/features/dashboard/dashboard-page.component.ts", "w", encoding="utf-8") as f:
    f.write(content)

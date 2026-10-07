import sys

with open("frontend/src/app/features/dashboard/dashboard-page.component.ts", "r", encoding="utf-8") as f:
    content = f.read()

import_str = 'import { ProgressChartComponent } from "../../shared/components/progress-chart.component";'
import_repl = import_str + '\nimport { ResilienceWidgetComponent } from "../../shared/components/resilience-widget.component";'
content = content.replace(import_str, import_repl)

imports_array = 'IconComponent, MoodTrackerComponent, ProgressChartComponent'
imports_array_repl = imports_array + ', ResilienceWidgetComponent'
content = content.replace(imports_array, imports_array_repl)

widget_str = '<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">'
widget_repl = '<app-resilience-widget class="block"></app-resilience-widget>\n          ' + widget_str
content = content.replace(widget_str, widget_repl)

with open("frontend/src/app/features/dashboard/dashboard-page.component.ts", "w", encoding="utf-8") as f:
    f.write(content)

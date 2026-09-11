import re

with open("temp_modals.txt", "r") as f:
    modals = f.read()

# Add missing footer and modals before <script>
with open("lab_packs_evolution.html", "r") as f:
    text = f.read()

if "<!-- ダークテーマ・フッター規格（マスター同期） -->" not in text:
    text = text.replace("  <script>", "    </div><!-- /.content-area -->\n\n" + modals + "\n\n  <script>")

with open("lab_packs_evolution.html", "w") as f:
    f.write(text)

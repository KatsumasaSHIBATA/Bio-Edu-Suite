with open("lab_packs_evolution.html", "r") as f:
    text = f.read()

# remove extra </div>
if "</div><!-- /.content-area -->" in text:
    text = text.replace("</div><!-- /.content-area -->", "<!-- /.content-area -->")
if "</div><!-- /.main-wrapper -->" in text:
    text = text.replace("</div><!-- /.main-wrapper -->", "<!-- /.main-wrapper -->")

with open("lab_packs_evolution.html", "w") as f:
    f.write(text)


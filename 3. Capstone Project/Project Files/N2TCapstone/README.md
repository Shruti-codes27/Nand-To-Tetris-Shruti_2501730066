# Hack Computer Lab — Nand to Tetris Capstone

Interactive capstone website for **Shruti Dolare · Roll 2501730066 · ETCNTC301**.

The site includes the supplied HDL sources, a live two-pass Hack assembler, downloadable project files and a 16-bit CPU/screen emulator.

## Run locally

Double-click `index.html`, or run:

```bash
python -m http.server 3000
```

Then open `http://localhost:3000`.

## Submitted parameters

- Parameter **K = 66**
- Box: **48 × 20 pixels**, starting at row **66** and ending at row **85**
- Words per row: **3**
- Screen addresses: **18496..19106**
- `K mod 3 = 0` → automatic `symbols.txt` export
- `K mod 4 = 2` → 48-pixel width

## Project files

- `capstone/` — 26 HDL chips, `assembler.py`, `Box.asm`, `Box.hack` and `symbols.txt`
- `PROJECT_EXPLANATION.md` — detailed technical explanation
- `Capstone_Project_Report_Shruti_Dolare.docx` — capstone report
- `assets/downloads/project-files.zip` — complete downloadable package

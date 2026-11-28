# Nand2Tetris Capstone Project: Make the Computer Draw a Box

**Student Name:** Shruti Dolare  
**Roll Number:** 2501730066  
**Personal Parameter (K):** 66  
**Repository Directory:** `capstone/`

---

## 1. Project Overview & Calculation of Personal Parameters

The objective of this Capstone Project is to build a general-purpose 16-bit computer architecture from fundamental logic gates up to complete hardware simulation, implement a two-pass assembler in Python, and write an interactive assembly program that renders a solid black box on screen when any keyboard key is pressed and clears the screen when released.

### Parameter Derivation
According to the assignment specifications:
- **Roll Number:** `2501730066`
- **$K$ (Last two digits of Roll No.):** **`66`**
- **Part B Extra Assembler Feature:**
  $$K \pmod 3 = 66 \pmod 3 = 0$$
  *Feature Requirement:* Automatically save all user-defined labels (with ROM addresses) and variables (with allocated RAM addresses) into `symbols.txt`.
- **Part C Box Specifications:**
  - **Starting Row:** $r = K = 66$
  - **Height:** 20 rows (Rows 66 through 85 inclusive)
  - **Width:** 
    $$\text{Width} = 16 \times ((K \pmod 4) + 1) = 16 \times ((66 \pmod 4) + 1) = 16 \times (2 + 1) = 48\text{ pixels}$$
  - **Memory Representation:** Since each screen memory word contains 16 horizontal pixels, a width of 48 pixels spans exactly:
    $$\frac{48}{16} = 3\text{ consecutive words per row (words 0, 1, and 2 from left edge)}$$
  - **Starting Base Address in RAM:**
    $$\text{SCREEN} + 32 \times K = 16384 + 32 \times 66 = 16384 + 2112 = 18496$$

---

## 2. Part A: Computer Architecture & HDL Hardware Construction

### 2.1 Chip Hierarchy & Custom Implementation
To fulfill the requirement of building our own chips while leveraging built-in memory blocks where designated:
1. **Elementary Logic Gates:** Implemented [`Not.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Not.hdl), [`And.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/And.hdl), [`Or.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Or.hdl), and [`Xor.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Xor.hdl) from primitive `Nand` gates.
2. **Multiplexors & Demultiplexors:** Implemented [`Mux.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Mux.hdl), [`DMux.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/DMux.hdl), [`Not16.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Not16.hdl), [`And16.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/And16.hdl), [`Or16.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Or16.hdl), [`Mux16.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Mux16.hdl), [`Or8Way.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Or8Way.hdl), [`Mux4Way16.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Mux4Way16.hdl), [`Mux8Way16.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Mux8Way16.hdl), [`DMux4Way.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/DMux4Way.hdl), and [`DMux8Way.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/DMux8Way.hdl).
3. **Arithmetic Logic Unit (ALU):** Constructed [`HalfAdder.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/HalfAdder.hdl), [`FullAdder.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/FullAdder.hdl), [`Add16.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Add16.hdl), [`Inc16.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Inc16.hdl), and finally [`ALU.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/ALU.hdl) which supports 18 arithmetic/logical functions controlled by flags `zx, nx, zy, ny, f, no` and outputs status flags `zr` and `ng`.
4. **Registers & Program Counter:** Built [`Bit.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Bit.hdl) around `DFF`, [`Register.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Register.hdl) (16-bit), and [`PC.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/PC.hdl) supporting sequential incrementing, synchronous load, and synchronous reset.

### 2.2 System-Level Chips
- **[`Memory.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Memory.hdl):**
  Integrates a 16K RAM block (`0x0000` to `0x3FFF`), an 8K Screen memory map (`0x4000` to `0x5FFF`), and the single-register Keyboard memory map (`0x6000`, 24576). It utilizes address lines `address[13..14]` with `DMux4Way` for load dispatching and `Mux4Way16` for output multiplexing.
- **[`CPU.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/CPU.hdl):**
  Implements the full Hack instruction set decoding:
  - Distinguishes A-instruction (`instruction[15] == 0`) and C-instruction (`instruction[15] == 1`).
  - Routes inputs to the `ARegister` and `DRegister`.
  - Feeds the ALU with register `D` and either register `A` or external `inM` based on the `a`-bit (`instruction[12]`).
  - Computes `writeM` and evaluates branch conditions against ALU status bits `zr` and `ng` combined with jump flags `j1, j2, j3` (`instruction[2..0]`) to control `PC` loading.
- **[`Computer.hdl`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Computer.hdl):**
  Wires `ROM32K`, `CPU`, and `Memory` into a closed feedback loop driven by system clock cycles.

---

## 3. Part B: Two-Pass Python Assembler (`assembler.py`)

The assembler converts Hack symbolic assembly (`.asm`) into binary machine language (`.hack`).

### 3.1 Two-Pass Architecture
1. **First Pass:**
   - Strips single-line comments (`//...`) and trailing/leading whitespace.
   - Ignores blank lines.
   - Scans for pseudo-instructions `(LABEL)`. When encountered, records the current ROM address (equal to the number of actual instructions encountered so far) in the symbol table. Labels are not emitted into the instruction stream.
2. **Second Pass:**
   - Handles A-instructions (`@value` or `@symbol`).
     - Numeric values are converted directly to 15-bit binary prefixed with `0`.
     - Symbolic references are resolved: predefined symbols (`SCREEN`, `KBD`, `R0`-`R15`, `SP`, etc.) or existing labels are replaced by their address. Any novel variable symbol is allocated memory sequentially starting at RAM address `16`.
   - Handles C-instructions (`dest=comp;jump`).
     - Parses optional `dest` and `jump` clauses.
     - Matches mnemonics against standard binary lookup tables.
     - Formats output as `111` + `a c1 c2 c3 c4 c5 c6` + `d1 d2 d3` + `j1 j2 j3`.

### 3.2 Extra Feature Implementation ($K \pmod 3 = 0$)
Because $K = 66 \pmod 3 = 0$, `assembler.py` contains a dedicated export function:
```python
def write_symbols_file(symbols_path, labels, variables):
    with open(symbols_path, "w", encoding="utf-8") as f:
        f.write("# Labels (ROM addresses)\n")
        for name, addr in labels.items():
            f.write(f"{name}: {addr}\n")
        f.write("\n# Variables (RAM addresses)\n")
        for name, addr in variables.items():
            f.write(f"{name}: {addr}\n")
```
When running `python assembler.py capstone/Box.asm`, it automatically generates [`capstone/symbols.txt`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/symbols.txt), mapping all jump targets and loop variables.

---

## 4. Part C: The Box Assembly Program (`Box.asm` & `Box.hack`)

### 4.1 Program Design & Logic Flow
The program [`Box.asm`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Box.asm) implements a persistent polling loop:
1. **Keyboard Polling:**
   Reads the keyboard memory-mapped register `@KBD` (RAM address 24576).
   - If `KBD != 0`: A key is pressed $\rightarrow$ sets `@color` to `-1` (`0xFFFF`, turning 16 pixels solid black).
   - If `KBD == 0`: No key is pressed $\rightarrow$ sets `@color` to `0` (`0x0000`, turning 16 pixels white).
2. **Coordinate Initialization:**
   - Sets `@addr = 18496` (Row 66 base address: $16384 + 32 \times 66$).
   - Sets `@rows = 20` (loop counter for height).
3. **Nested Drawing Loop:**
   - **Outer Loop (`ROW_LOOP`):** Checks if `@rows == 0`. If true, returns to `LOOP` to poll keyboard again. Otherwise, sets `@cols = 3` and `@curr = addr`.
   - **Inner Loop (`COL_LOOP`):** Writes `@color` to `RAM[curr]`, increments `curr = curr + 1`, and decrements `cols`. Runs 3 times per row ($3 \times 16 = 48$ pixels).
   - **Row Advance (`NEXT_ROW`):** Increments `@addr = addr + 32`, decrements `rows`, and loops back to `ROW_LOOP`.

### 4.2 Local Verification Results
The program was assembled using our custom `assembler.py` into [`Box.hack`](file:///c:/Users/manoh/OneDrive/Desktop/N2TCapstone/capstone/Box.hack) (53 instructions). It was verified using an exact software emulator:
- **Key Pressed:** Successfully writes `0xFFFF` to 60 words (rows 66–85, columns 0–2).
- **Key Released:** Successfully restores all 60 words to `0x0000`.

---

## 5. Summary of Project Files in `capstone/`

| File | Purpose |
| :--- | :--- |
| `Computer.hdl` | Top-level chip uniting CPU, Memory, and ROM32K |
| `CPU.hdl` | Hack CPU with decoding logic, ALU, registers, and jump evaluation |
| `Memory.hdl` | Complete memory space router for RAM16K, Screen, and Keyboard |
| `ALU.hdl`, `Add16.hdl`, `PC.hdl`, etc. | 23 supporting custom HDL logic chips |
| `assembler.py` | Two-pass Python assembler with `symbols.txt` export feature |
| `Box.asm` | Source Hack assembly for drawing the 48x20 box at row 66 |
| `Box.hack` | Assembled 16-bit binary machine instructions |
| `symbols.txt` | Symbol table export output generated by `assembler.py` |

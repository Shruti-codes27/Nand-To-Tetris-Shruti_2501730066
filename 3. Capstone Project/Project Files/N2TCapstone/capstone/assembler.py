"""
Hack Assembler (Part B)
Roll No: 2501730066 | K = 66 | K mod 3 = 0
Extra feature (K mod 3 == 0): Saves all labels and variables with their
addresses in symbols.txt.

Usage:
    python assembler.py <input.asm> [output.hack]
"""

import os
import sys

PREDEFINED_SYMBOLS = {
    "SP": 0,
    "LCL": 1,
    "ARG": 2,
    "THIS": 3,
    "THAT": 4,
    "SCREEN": 16384,
    "KBD": 24576,
    **{f"R{i}": i for i in range(16)},
}

COMP_TABLE = {
    "0":   "0101010",
    "1":   "0111111",
    "-1":  "0111010",
    "D":   "0001100",
    "A":   "0110000",
    "M":   "1110000",
    "!D":  "0001101",
    "!A":  "0110001",
    "!M":  "1110001",
    "-D":  "0001111",
    "-A":  "0110011",
    "-M":  "1110011",
    "D+1": "0011111",
    "A+1": "0110111",
    "M+1": "1110111",
    "D-1": "0001110",
    "A-1": "0110010",
    "M-1": "1110010",
    "D+A": "0000010",
    "A+D": "0000010",
    "D+M": "1000010",
    "M+D": "1000010",
    "D-A": "0010011",
    "D-M": "1010011",
    "A-D": "0000111",
    "M-D": "1000111",
    "D&A": "0000000",
    "A&D": "0000000",
    "D&M": "1000000",
    "M&D": "1000000",
    "D|A": "0010101",
    "A|D": "0010101",
    "D|M": "1010101",
    "M|D": "1010101",
}

DEST_TABLE = {
    "":    "000",
    "M":   "001",
    "D":   "010",
    "MD":  "011",
    "DM":  "011",
    "A":   "100",
    "AM":  "101",
    "MA":  "101",
    "AD":  "110",
    "DA":  "110",
    "AMD": "111",
}

JUMP_TABLE = {
    "":    "000",
    "JGT": "001",
    "JEQ": "010",
    "JGE": "011",
    "JLT": "100",
    "JNE": "101",
    "JLE": "110",
    "JMP": "111",
}


def clean_line(raw_line: str) -> str:
    """Strip comments (//...) and all whitespace from a source line."""
    no_comment = raw_line.split("//", 1)[0]
    return "".join(no_comment.split())


def first_pass(lines: list[str]) -> tuple[list[str], dict[str, int], dict[str, int]]:
    """
    First reading:
    Remove comments and blank lines, record label declarations (LABEL) -> ROM address.
    Returns (clean_instructions, symbol_table, labels_only).
    """
    symbol_table = dict(PREDEFINED_SYMBOLS)
    labels: dict[str, int] = {}
    instructions: list[str] = []
    rom_address = 0

    for raw in lines:
        line = clean_line(raw)
        if not line:
            continue
        if line.startswith("(") and line.endswith(")"):
            label = line[1:-1]
            symbol_table[label] = rom_address
            labels[label] = rom_address
        else:
            instructions.append(line)
            rom_address += 1

    return instructions, symbol_table, labels


def translate_c_instruction(line: str) -> str:
    """Translate a C-instruction ([dest=]comp[;jump]) into a 16-bit binary string."""
    dest = ""
    jump = ""
    rest = line

    if "=" in rest:
        dest, rest = rest.split("=", 1)
    if ";" in rest:
        comp, jump = rest.split(";", 1)
    else:
        comp = rest

    if comp not in COMP_TABLE:
        raise ValueError(f"Unknown comp mnemonic: '{comp}' in '{line}'")
    if dest not in DEST_TABLE:
        raise ValueError(f"Unknown dest mnemonic: '{dest}' in '{line}'")
    if jump not in JUMP_TABLE:
        raise ValueError(f"Unknown jump mnemonic: '{jump}' in '{line}'")

    return "111" + COMP_TABLE[comp] + DEST_TABLE[dest] + JUMP_TABLE[jump]


def second_pass(
    instructions: list[str], symbol_table: dict[str, int]
) -> tuple[list[str], dict[str, int]]:
    """
    Second reading:
    Convert every A- and C-instruction into 16 bits.
    New variables are allocated RAM addresses starting at 16.
    Returns (binary_lines, variables_only).
    """
    binary_lines: list[str] = []
    variables: dict[str, int] = {}
    next_var_addr = 16

    for line in instructions:
        if line.startswith("@"):
            symbol = line[1:]
            if symbol.isdigit():
                addr = int(symbol)
            else:
                if symbol not in symbol_table:
                    symbol_table[symbol] = next_var_addr
                    variables[symbol] = next_var_addr
                    next_var_addr += 1
                addr = symbol_table[symbol]
            binary_lines.append(f"0{addr:015b}")
        else:
            binary_lines.append(translate_c_instruction(line))

    return binary_lines, variables


def write_symbols_file(
    symbols_path: str, labels: dict[str, int], variables: dict[str, int]
) -> None:
    """
    Extra feature for K mod 3 == 0 (K = 66):
    Save all labels and variables with their addresses in symbols.txt.
    """
    with open(symbols_path, "w", encoding="utf-8") as f:
        f.write("# Labels (ROM addresses)\n")
        if labels:
            for name, addr in labels.items():
                f.write(f"{name}: {addr}\n")
        else:
            f.write("(none)\n")

        f.write("\n# Variables (RAM addresses)\n")
        if variables:
            for name, addr in variables.items():
                f.write(f"{name}: {addr}\n")
        else:
            f.write("(none)\n")


def assemble_file(asm_path: str, hack_path: str | None = None) -> tuple[str, str]:
    """Assemble a .asm file into a .hack file and write symbols.txt."""
    with open(asm_path, "r", encoding="utf-8") as f:
        raw_lines = f.readlines()

    instructions, symbol_table, labels = first_pass(raw_lines)
    binary_lines, variables = second_pass(instructions, symbol_table)

    if hack_path is None:
        base, _ = os.path.splitext(asm_path)
        hack_path = base + ".hack"

    with open(hack_path, "w", encoding="utf-8") as f:
        for bits in binary_lines:
            f.write(bits + "\n")

    out_dir = os.path.dirname(os.path.abspath(hack_path))
    symbols_path = os.path.join(out_dir, "symbols.txt")
    write_symbols_file(symbols_path, labels, variables)

    return hack_path, symbols_path


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python assembler.py <input.asm> [output.hack]")
        sys.exit(1)

    asm_path = sys.argv[1]
    hack_path = sys.argv[2] if len(sys.argv) >= 3 else None
    out_hack, out_symbols = assemble_file(asm_path, hack_path)
    print(f"Assembled: {asm_path} -> {out_hack}")
    print(f"Symbols saved to: {out_symbols}")


if __name__ == "__main__":
    main()

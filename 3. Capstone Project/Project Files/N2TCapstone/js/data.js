/* Hack Computer Lab — project data (ETCNTC301 capstone) */
(function () {
  'use strict';

  var DEFAULT_ROLL = '2501730066';

  var STUDENT = {
    name: 'Shruti Dolare',
    roll: DEFAULT_ROLL,
    course: 'ETCNTC301',
    courseName: 'Nand to Tetris - I',
    university: 'K.R. Mangalam University',
    school: 'School of Engineering & Technology',
    evaluation: '10 Marks Individual Capstone'
  };

  var BOX = { rows: 20, pixelsPerWord: 16 };

  function kFromRoll(roll) {
    var digits = String(roll == null ? '' : roll).replace(/\D/g, '');
    if (!digits) return 66;
    var last2 = parseInt(digits.slice(-2), 10);
    return isNaN(last2) ? 66 : last2;
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function paramsFor(K) {
    var wordsPerRow = (K % 4) + 1;
    var startAddr = 16384 + 32 * K;
    return {
      K: K,
      startRow: K,
      endRow: K + BOX.rows - 1,
      rows: BOX.rows,
      wordsPerRow: wordsPerRow,
      pxWidth: wordsPerRow * BOX.pixelsPerWord,
      startAddr: startAddr,
      endAddr: startAddr + (BOX.rows - 1) * 32 + (wordsPerRow - 1),
      kMod3: K % 3,
      kMod4: K % 4
    };
  }

  function boxAsm(K) {
    var p = paramsFor(K);
    var words = p.wordsPerRow;
    return [
      '// Box.asm - Capstone Project Part C',
      '// Student: ' + STUDENT.name + ' | Roll No: ' + DEFAULT_ROLL + ' | K = ' + pad2(K),
      '//',
      '// Behavior:',
      '//   While any key is pressed (KBD != 0), draws a black box on screen.',
      '//   When no key is pressed (KBD == 0), clears the box back to white.',
      '//',
      '// Dimensions for K = ' + pad2(K) + ':',
      '//   - Starting row: K = ' + K + ' -> SCREEN (16384) + 32 * ' + K + ' = ' + p.startAddr,
      '//   - Height: 20 rows (rows ' + K + ' to ' + p.endRow + ')',
      '//   - Width: 16 * ((' + K + ' mod 4) + 1) = 16 * ' + words + ' = ' + p.pxWidth + ' pixels from left edge (' + words + ' words/row)',
      '',
      '(LOOP)',
      '    // Poll the keyboard memory-mapped register (RAM[24576])',
      '    @KBD',
      '    D=M',
      '    @SET_BLACK',
      '    D;JNE           // If KBD != 0, a key is pressed -> draw black',
      '',
      '    // No key pressed -> color = 0 (all 16 bits white)',
      '    @color',
      '    M=0',
      '    @START_DRAW',
      '    0;JMP',
      '',
      '(SET_BLACK)',
      '    // Key pressed -> color = -1 (all 16 bits black: 1111111111111111)',
      '    @color',
      '    M=-1',
      '',
      '(START_DRAW)',
      '    // Start at row ' + K + ': SCREEN (16384) + 32 * ' + K + ' = ' + p.startAddr,
      '    @' + p.startAddr,
      '    D=A',
      '    @addr',
      '    M=D',
      '',
      '    // 20 rows tall',
      '    @20',
      '    D=A',
      '    @rows',
      '    M=D',
      '',
      '(ROW_LOOP)',
      '    @rows',
      '    D=M',
      '    @LOOP',
      '    D;JEQ           // All 20 rows processed -> return to keyboard poll',
      '',
      '    // ' + words + ' words per row (' + words + ' * 16 = ' + p.pxWidth + ' pixels wide)',
      '    @' + words,
      '    D=A',
      '    @cols',
      '    M=D',
      '',
      '    // curr tracks the word address within the current row',
      '    @addr',
      '    D=M',
      '    @curr',
      '    M=D',
      '',
      '(COL_LOOP)',
      '    @cols',
      '    D=M',
      '    @NEXT_ROW',
      '    D;JEQ           // Finished ' + words + ' words in this row -> move to next row',
      '',
      '    @color',
      '    D=M',
      '    @curr',
      '    A=M',
      '    M=D             // Write 16-pixel word (0 or -1) to screen memory',
      '',
      '    @curr',
      '    M=M+1           // Move to next 16-pixel word in the same row',
      '    @cols',
      '    M=M-1           // Decrement remaining words in row',
      '    @COL_LOOP',
      '    0;JMP',
      '',
      '(NEXT_ROW)',
      '    // Advance base row address by 32 words (one screen row)',
      '    @32',
      '    D=A',
      '    @addr',
      '    M=D+M',
      '',
      '    @rows',
      '    M=M-1           // Decrement remaining rows',
      '    @ROW_LOOP',
      '    0;JMP'
    ].join('\n');
  }

  function dupTestAsm(K) {
    return [
      '// Optional Duplicate Label Diagnostics Test',
      '// Student Roll Number: ' + DEFAULT_ROLL + ' | Parameter K = ' + K,
      '// This demonstrates parser diagnostics; the submitted K mod 3 = 0',
      '// extra feature is automatic symbol-table export.',
      '',
      '(START)',
      '@10',
      'D=A',
      '(LOOP)',
      '@counter',
      'M=D',
      'D=D-1',
      '(LOOP)      // Line 12: intentional duplicate label',
      '@LOOP',
      'D;JGT',
      '(END)',
      '@END',
      '0;JMP'
    ].join('\n');
  }

  var ADD_ASM = [
    '// Computes the sum of RAM[0] and RAM[1] and stores it in RAM[2]',
    '@0',
    'D=M',
    '@1',
    'D=D+M',
    '@2',
    'M=D',
    '(END)',
    '@END',
    '0;JMP'
  ].join('\n');

  var MAX_ASM = [
    '// Computes max(RAM[0], RAM[1]) and stores it in RAM[2]',
    '@R0',
    'D=M',
    '@R1',
    'D=D-M',
    '@R0_BIGGER',
    'D;JGT',
    '@R1',
    'D=M',
    '@R2',
    'M=D',
    '@END',
    '0;JMP',
    '(R0_BIGGER)',
    '@R0',
    'D=M',
    '@R2',
    'M=D',
    '(END)',
    '@END',
    '0;JMP'
  ].join('\n');

  var RECT_ASM = [
    '// Draws a rectangle at the top-left corner of the screen.',
    '// The rectangle is 16 pixels wide and R0 pixels high.',
    '',
    '@0',
    'D=M',
    '@INFINITE_LOOP',
    'D;JLE',
    '@counter',
    'M=D',
    '@SCREEN',
    'D=A',
    '@address',
    'M=D',
    '(LOOP)',
    '@address',
    'A=M',
    'M=-1',
    '@address',
    'M=M+1',
    '@counter',
    'MD=M-1',
    '@LOOP',
    'D;JGT',
    '(INFINITE_LOOP)',
    '@INFINITE_LOOP',
    '0;JMP'
  ].join('\n');

  var HDL = {
    'CPU.hdl': {
      title: 'Hack Central Processing Unit (CPU.hdl)',
      desc: 'Implements the full 16-bit Von Neumann CPU integrating A and D registers, ALU, Program Counter, instruction decoding and 7 jump condition branches.',
      ioIn: [
        ['inM[16]', '16-bit data value read from memory at RAM[addressM]'],
        ['instruction[16]', '16-bit instruction word fetched from ROM32K[pc]'],
        ['reset', '1-bit reset button; restarts execution from ROM[0]']
      ],
      ioOut: [
        ['outM[16]', '16-bit ALU output value to be written to memory'],
        ['writeM', 'Memory write enable flag (set if C-instruction has d3=1)'],
        ['addressM[15]', '15-bit address pointing to target memory location'],
        ['pc[15]', '15-bit program counter pointing to next instruction']
      ],
      highlights: [
        'Instruction Bit 15: 0 for A-instruction (loads constant), 1 for C-instruction.',
        'A-Register Input Mux: selects instruction literal (bit 15=0) or ALU output (bit 15=1 and d1=1).',
        'ALU Y-Input Mux: selects between A-register (a=0) or inM (a=1) via instruction bit 12.',
        'Jump Condition Logic: evaluates (j1 & ng) | (j2 & zr) | (j3 & (not zr & not ng)), gated by isCInstruction.'
      ],
      content: [
        '/**',
        ' * The Hack Central Processing Unit (CPU).',
        ' * Uses custom ALU, PC, and logic gates alongside built-in ARegister and DRegister.',
        ' */',
        'CHIP CPU {',
        '    IN  inM[16],         // M value input (M = contents of RAM[A])',
        '        instruction[16], // Instruction for execution',
        '        reset;           // Signals whether to restart the current program',
        '',
        '    OUT outM[16],        // M value output',
        '        writeM,          // Write to M?',
        '        addressM[15],    // Address in data memory (of M)',
        '        pc[15];          // Address of next instruction',
        '',
        '    PARTS:',
        '    // Decode A-instruction vs C-instruction',
        '    Not(in=instruction[15], out=isAInst);',
        '',
        '    // Select A-register input: instruction for A-inst, ALU output for C-inst',
        '    Mux16(a=aluOut, b=instruction, sel=isAInst, out=aIn);',
        '',
        '    // Load A-register if A-instruction or C-instruction with d1 (bit 5) set',
        '    Or(a=isAInst, b=instruction[5], out=loadA);',
        '    ARegister(in=aIn, load=loadA, out=aOut, out[0..14]=addressM);',
        '',
        '    // Select ALU y-input: A-register (a=0) or inM (a=1)',
        '    Mux16(a=aOut, b=inM, sel=instruction[12], out=yIn);',
        '',
        '    // Load D-register only on C-instruction with d2 (bit 4) set',
        '    And(a=instruction[15], b=instruction[4], out=loadD);',
        '    DRegister(in=aluOut, load=loadD, out=dOut);',
        '',
        '    // Execute ALU operation using c1..c6 (bits 11..6)',
        '    ALU(x=dOut, y=yIn,',
        '        zx=instruction[11], nx=instruction[10],',
        '        zy=instruction[9],  ny=instruction[8],',
        '        f=instruction[7],   no=instruction[6],',
        '        out=aluOut, out=outM, zr=zr, ng=ng);',
        '',
        '    // Write to Memory only on C-instruction with d3 (bit 3) set',
        '    And(a=instruction[15], b=instruction[3], out=writeM);',
        '',
        '    // Jump logic: j1 (<0), j2 (==0), j3 (>0) evaluated only for C-instructions',
        '    Or(a=zr, b=ng, out=isLe);',
        '    Not(in=isLe, out=isPos);',
        '',
        '    And(a=instruction[2], b=ng, out=jlt);',
        '    And(a=instruction[1], b=zr, out=jeq);',
        '    And(a=instruction[0], b=isPos, out=jgt);',
        '',
        '    Or(a=jlt, b=jeq, out=jle);',
        '    Or(a=jle, b=jgt, out=jumpCond);',
        '    And(a=instruction[15], b=jumpCond, out=pcLoad);',
        '',
        '    PC(in=aOut, load=pcLoad, inc=true, reset=reset, out[0..14]=pc);',
        '}'
      ].join('\n')
    },
    'Memory.hdl': {
      title: 'Hack Data Memory (Memory.hdl)',
      desc: 'The complete 32K address space of the Hack computer — RAM16K, the memory-mapped 8K screen and the keyboard register, selected by the top two address bits.',
      ioIn: [
        ['in[16]', '16-bit data word to load when load is asserted'],
        ['load', 'Write enable; commits in to Memory[address]'],
        ['address[15]', '15-bit address into the 32K memory space']
      ],
      ioOut: [
        ['out[16]', 'Always outputs the word stored at the selected address']
      ],
      highlights: [
        'Address Decode: address[13..14] splits the space — 00/01 RAM, 10 screen, 11 keyboard.',
        'RAM16K: loadRam is asserted only for the two lower quadrants; the low 14 bits select the word.',
        'Screen Map: writes in quadrant 10 land in Screen[address[0..12]] — 8K words = 512 × 256 pixels.',
        'Output Mux: Mux4Way16 selects RAM, screen or keyboard data for the continuous out bus.'
      ],
      content: [
        '/**',
        ' * The complete address space of the Hack computer\'s memory,',
        ' * including RAM and memory-mapped I/O.',
        ' * Uses built-in RAM16K, Screen, and Keyboard chips.',
        ' */',
        'CHIP Memory {',
        '    IN in[16], load, address[15];',
        '    OUT out[16];',
        '',
        '    PARTS:',
        '    DMux4Way(in=load, sel=address[13..14], a=loadRam1, b=loadRam2, c=loadScreen, d=loadKbd);',
        '    Or(a=loadRam1, b=loadRam2, out=loadRam);',
        '',
        '    RAM16K(in=in, load=loadRam, address=address[0..13], out=ramOut);',
        '    Screen(in=in, load=loadScreen, address=address[0..12], out=screenOut);',
        '    Keyboard(out=kbdOut);',
        '',
        '    Mux4Way16(a=ramOut, b=ramOut, c=screenOut, d=kbdOut, sel=address[13..14], out=out);',
        '}'
      ].join('\n')
    },
    'Computer.hdl': {
      title: 'The Hack Computer (Computer.hdl)',
      desc: 'Top-level system chip: ROM32K, CPU and Memory wired into the complete Hack computer that executes Box.hack, cycle by cycle.',
      ioIn: [
        ['reset', '1-bit reset signal; restarts the stored program from ROM[0]']
      ],
      ioOut: [],
      highlights: [
        'ROM32K fetch: the program counter addresses a 32K instruction ROM feeding instruction[16].',
        'CPU wiring: inM arrives from memory output; outM, writeM, addressM and pc leave the CPU.',
        'Write path: writeM enables exactly one memory-mapped region per cycle — RAM, screen or keyboard.',
        'Reset control: asserting reset forces the program counter to 0 and re-runs the program.'
      ],
      content: [
        '/**',
        ' * The Hack computer, consisting of CPU, ROM32K, and Memory.',
        ' * Uses custom CPU and Memory chips alongside built-in ROM32K.',
        ' */',
        'CHIP Computer {',
        '    IN reset;',
        '',
        '    PARTS:',
        '    ROM32K(address=pc, out=instruction);',
        '    CPU(inM=memOut, instruction=instruction, reset=reset,',
        '        outM=outM, writeM=writeM, addressM=addressM, pc=pc);',
        '    Memory(in=outM, load=writeM, address=addressM, out=memOut);',
        '}'
      ].join('\n')
    }
  };

  var PYTHON_SOURCE = String.raw`"""
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
`;

  var CHECKLIST = [
    {
      title: 'Part A: Hack Computer HDL',
      marks: '2.5 Marks',
      status: 'Complete',
      text: 'Twenty-six HDL files build the Hack machine from elementary gates through CPU.hdl, Memory.hdl and the top-level Computer.hdl.'
    },
    {
      title: 'Part B: Python Assembler',
      marks: '3.0 Marks',
      status: 'Complete',
      text: 'assembler.py performs two-pass translation and, for K mod 3 = 0, exports every label and variable with its address to symbols.txt.'
    },
    {
      title: 'Part C: Box Drawing Program',
      marks: '2.5 Marks',
      status: 'Complete',
      text: 'Box.asm polls RAM[24576] continuously and draws a 48 × 20 box at row 66 (addresses 18496..19106) on any key press — releasing the key writes 0 and erases it.'
    },
    {
      title: 'Viva Voce Preparation',
      marks: '2.0 Marks',
      status: 'Prepared',
      text: 'Architecture walkthrough ready: instruction decoding, ALU control bits, A/D register loading, jump gating, and the exact code edits needed for on-the-spot modifications.'
    }
  ];

  var PILLARS = [
    {
      n: '01',
      title: 'HDL Computer',
      part: 'Part A',
      marks: '2.5 Marks',
      text: 'Twenty-six HDL files construct the Hack computer from elementary logic gates through the CPU, Memory and top-level Computer chips.',
      link: '#part-a',
      cta: 'Explore Part A'
    },
    {
      n: '02',
      title: 'Python Assembler',
      part: 'Part B',
      marks: '3.0 Marks',
      text: 'Two-pass .asm → .hack translator with the K mod 3 = 0 symbol-table export feature and 16-bit binary output.',
      link: '#part-b',
      cta: 'Open Playground'
    },
    {
      n: '03',
      title: 'Box Program & Emulator',
      part: 'Part C',
      marks: '2.5 Marks',
      text: 'Keyboard-polled Hack assembly that paints a 48 × 20 box straight into screen memory, executed live on a software CPU.',
      link: '#part-c',
      cta: 'Launch Emulator'
    }
  ];

  window.PROJECT = {
    DEFAULT_ROLL: DEFAULT_ROLL,
    STUDENT: STUDENT,
    BOX: BOX,
    kFromRoll: kFromRoll,
    paramsFor: paramsFor,
    boxAsm: boxAsm,
    dupTestAsm: dupTestAsm,
    HDL: HDL,
    PYTHON_SOURCE: PYTHON_SOURCE,
    PRESETS: {
      box: boxAsm,
      add: function () { return ADD_ASM; },
      max: function () { return MAX_ASM; },
      rect: function () { return RECT_ASM; },
      dup: dupTestAsm
    },
    CHECKLIST: CHECKLIST,
    PILLARS: PILLARS
  };
})();

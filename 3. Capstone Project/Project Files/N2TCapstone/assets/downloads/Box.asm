// Box.asm - Capstone Project Part C
// Student: Shruti Dolare | Roll No: 2501730066 | K = 66
//
// Behavior:
//   While any key is pressed (KBD != 0), draws a black box on screen.
//   When no key is pressed (KBD == 0), clears the box back to white.
//
// Dimensions for K = 66:
//   - Starting row: K = 66 -> SCREEN (16384) + 32 * 66 = 18496
//   - Height: 20 rows (rows 66 to 85)
//   - Width: 16 * ((66 mod 4) + 1) = 16 * 3 = 48 pixels from left edge (3 words/row)

(LOOP)
    // Poll the keyboard memory-mapped register (RAM[24576])
    @KBD
    D=M
    @SET_BLACK
    D;JNE           // If KBD != 0, a key is pressed -> draw black

    // No key pressed -> color = 0 (all 16 bits white)
    @color
    M=0
    @START_DRAW
    0;JMP

(SET_BLACK)
    // Key pressed -> color = -1 (all 16 bits black: 1111111111111111)
    @color
    M=-1

(START_DRAW)
    // Start at row 66: SCREEN (16384) + 32 * 66 = 18496
    @18496
    D=A
    @addr
    M=D

    // 20 rows tall
    @20
    D=A
    @rows
    M=D

(ROW_LOOP)
    @rows
    D=M
    @LOOP
    D;JEQ           // All 20 rows processed -> return to keyboard poll

    // 3 words per row (3 * 16 = 48 pixels wide)
    @3
    D=A
    @cols
    M=D

    // curr tracks the word address within the current row
    @addr
    D=M
    @curr
    M=D

(COL_LOOP)
    @cols
    D=M
    @NEXT_ROW
    D;JEQ           // Finished 3 words in this row -> move to next row

    @color
    D=M
    @curr
    A=M
    M=D             // Write 16-pixel word (0 or -1) to screen memory

    @curr
    M=M+1           // Move to next 16-pixel word in the same row
    @cols
    M=M-1           // Decrement remaining words in row
    @COL_LOOP
    0;JMP

(NEXT_ROW)
    // Advance base row address by 32 words (one screen row)
    @32
    D=A
    @addr
    M=D+M

    @rows
    M=M-1           // Decrement remaining rows
    @ROW_LOOP
    0;JMP

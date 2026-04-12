import { clsx } from 'clsx';
import type { Board as BoardType, Move, Position } from '../types';

interface BoardProps {
  board: BoardType;
  selectedPos: Position | null;
  validMoves: Move[];
  onSquareClick: (pos: Position) => void;
  disabled: boolean;
}

export function Board({ board, selectedPos, validMoves, onSquareClick, disabled }: BoardProps) {
  const validDestSet = new Set(validMoves.map(m => `${m.to.row},${m.to.col}`));
  const selectableSet = new Set(validMoves.map(m => `${m.from.row},${m.from.col}`));

  return (
    <div
      className="grid grid-cols-8 grid-rows-[repeat(8,var(--sq))] border-[3px] border-[#5c3417] rounded-sm shadow-2xl select-none"
      role="grid"
      aria-label="Checkers board"
    >
      {board.map((row, rowIdx) =>
        row.map((piece, colIdx) => {
          const isDark = (rowIdx + colIdx) % 2 === 1;
          const isSelected = selectedPos?.row === rowIdx && selectedPos?.col === colIdx;
          const isValidDest = validDestSet.has(`${rowIdx},${colIdx}`);
          const isSelectable = !disabled && isDark && selectableSet.has(`${rowIdx},${colIdx}`);

          return (
            <div
              key={`${rowIdx}-${colIdx}`}
              className={clsx(
                'flex items-center justify-center relative transition-colors duration-150',
                'w-[var(--sq)] h-[var(--sq)]',
                isDark ? [
                  'cursor-pointer',
                  isSelected  ? '!bg-[#7fc97f]'
                  : isValidDest ? '!bg-[#a8d880]'
                  : isSelectable ? 'bg-[#b58863] hover:!bg-[#c9a850]'
                  : 'bg-[#b58863] hover:bg-[#c9985a]',
                ] : 'bg-[#f0d9b5]',
              )}
              onClick={() => isDark && !disabled && onSquareClick({ row: rowIdx, col: colIdx })}
              role={isDark ? 'gridcell' : undefined}
              aria-label={isDark ? `Row ${rowIdx + 1}, Col ${colIdx + 1}` : undefined}
            >
              {piece && (
                <div
                  className={clsx(
                    'rounded-full flex items-center justify-center cursor-pointer',
                    'transition-[transform,box-shadow] duration-[120ms] ease-out',
                    'relative z-10',
                    'w-[calc(var(--sq)*0.76)] h-[calc(var(--sq)*0.76)]',
                    piece.player === 'red' ? 'piece-red' : 'piece-black',
                    isSelected ? 'piece-selected' : 'hover:scale-105 hover:-translate-y-px',
                  )}
                >
                  {piece.king && (
                    <span
                      className="pointer-events-none leading-none text-[#ffd700] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] text-[calc(var(--sq)*0.32)]"
                      aria-label="King"
                    >
                      ♛
                    </span>
                  )}
                </div>
              )}
              {isValidDest && !piece && (
                <div className="rounded-full bg-[rgba(60,180,60,0.65)] border-2 border-[rgba(40,140,40,0.8)] pointer-events-none w-[calc(var(--sq)*0.32)] h-[calc(var(--sq)*0.32)]" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

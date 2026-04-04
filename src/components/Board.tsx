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
    <div className="board" role="grid" aria-label="Checkers board">
      {board.map((row, rowIdx) =>
        row.map((piece, colIdx) => {
          const isDark = (rowIdx + colIdx) % 2 === 1;
          const isSelected = selectedPos?.row === rowIdx && selectedPos?.col === colIdx;
          const isValidDest = validDestSet.has(`${rowIdx},${colIdx}`);
          const isSelectable = !disabled && isDark && selectableSet.has(`${rowIdx},${colIdx}`);

          const squareClasses = [
            'square',
            isDark ? 'dark' : 'light',
            isSelected ? 'selected' : '',
            isValidDest ? 'valid-dest' : '',
            isSelectable && !isSelected ? 'selectable' : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={`${rowIdx}-${colIdx}`}
              className={squareClasses}
              onClick={() => isDark && !disabled && onSquareClick({ row: rowIdx, col: colIdx })}
              role={isDark ? 'gridcell' : undefined}
              aria-label={isDark ? `Row ${rowIdx + 1}, Col ${colIdx + 1}` : undefined}
            >
              {piece && (
                <div
                  className={[
                    'piece',
                    piece.player,
                    piece.king ? 'king' : '',
                    isSelected ? 'piece-selected' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {piece.king && <span className="crown" aria-label="King">♛</span>}
                </div>
              )}
              {isValidDest && !piece && <div className="move-dot" />}
            </div>
          );
        })
      )}
    </div>
  );
}

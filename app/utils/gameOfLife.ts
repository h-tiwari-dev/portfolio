export enum Cell {
    Dead = 0,
    Alive = 1,
}

export class Universe {
    width: number;
    height: number;
    cells: Cell[];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.cells = new Array<Cell>(width * height).fill(Cell.Dead);

        for (let i = 0; i < width * height; i++) {
            if (Math.random() > 0.5) {
                this.cells[i] = Cell.Alive;
            }
        }
    }

    private get_index(row: number, column: number): number {
        return row * this.width + column;
    }

    private live_neighbor_count(row: number, column: number): number {
        let count = 0;
        for (let deltaRow of [-1, 0, 1]) {
            for (let deltaColumn of [-1, 0, 1]) {
                if (deltaRow === 0 && deltaColumn === 0) {
                    continue;
                }
                const neighborRow = (row + deltaRow + this.height) % this.height;
                const neighborColumn = (column + deltaColumn + this.width) % this.width;
                const idx = this.get_index(neighborRow, neighborColumn);
                count += this.cells[idx] === Cell.Alive ? 1 : 0;
            }
        }
        return count;
    }

    tick(): void {
        const next: Cell[] = this.cells.slice();

        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const idx = this.get_index(row, col);
                const cell = this.cells[idx];
                const liveNeighbors = this.live_neighbor_count(row, col);

                let nextCell: Cell;
                if (cell === Cell.Alive) {
                    if (liveNeighbors < 2) {
                        nextCell = Cell.Dead;
                    } else if (liveNeighbors === 2 || liveNeighbors === 3) {
                        nextCell = Cell.Alive;
                    } else {
                        nextCell = Cell.Dead;
                    }
                } else {
                    if (liveNeighbors === 3) {
                        nextCell = Cell.Alive;
                    } else {
                        nextCell = Cell.Dead;
                    }
                }
                next[idx] = nextCell;
            }
        }
        this.cells = next;
    }

    render(): string {
        let result = '';
        for (let i = 0; i < this.cells.length; i++) {
            const cell = this.cells[i];
            const symbol = cell === Cell.Dead ? '◻' : '◼';
            result += symbol;
            if ((i + 1) % this.width === 0) {
                result += '\n';
            }
        }
        return result;
    }

    toggle_cell(row: number, col: number): void {
        const idx = this.get_index(row, col);
        this.cells[idx] = this.cells[idx] === Cell.Dead ? Cell.Alive : Cell.Dead;
    }
}

// Usage
// const universe = new Universe(10, 10);
// console.log(universe.render());
// universe.tick();
// console.log(universe.render());

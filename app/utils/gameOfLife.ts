export enum Cell {
    Dead = 0,
    Alive = 1,
}

export class Universe {
    width: number;
    height: number;
    cells: Uint8Array;
    nextCells: Uint8Array;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.cells = new Uint8Array(width * height);
        this.nextCells = new Uint8Array(width * height);
        this.randomize();
    }

    randomize(): void {
        for (let i = 0; i < this.width * this.height; i++) {
            if (Math.random() > 0.8) { // Sparser initialization for background
                this.cells[i] = Cell.Alive;
            } else {
                this.cells[i] = Cell.Dead;
            }
        }
    }

    clear(): void {
        this.cells.fill(Cell.Dead);
        this.nextCells.fill(Cell.Dead);
    }

    private get_index(row: number, column: number): number {
        return row * this.width + column;
    }

    tick(): void {
        const { width, height, cells, nextCells } = this;

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const idx = row * width + col;

                // Optimized neighbor counting with wrap-around
                let liveNeighbors = 0;

                // North
                liveNeighbors += cells[((row - 1 + height) % height) * width + col];
                // South
                liveNeighbors += cells[((row + 1) % height) * width + col];
                // West
                liveNeighbors += cells[row * width + ((col - 1 + width) % width)];
                // East
                liveNeighbors += cells[row * width + ((col + 1) % width)];

                // NW
                liveNeighbors += cells[((row - 1 + height) % height) * width + ((col - 1 + width) % width)];
                // NE
                liveNeighbors += cells[((row - 1 + height) % height) * width + ((col + 1) % width)];
                // SW
                liveNeighbors += cells[((row + 1) % height) * width + ((col - 1 + width) % width)];
                // SE
                liveNeighbors += cells[((row + 1) % height) * width + ((col + 1) % width)];

                const cell = cells[idx];
                let nextCell = cell;

                if (cell === Cell.Alive) {
                    if (liveNeighbors < 2 || liveNeighbors > 3) {
                        nextCell = Cell.Dead;
                    }
                } else {
                    if (liveNeighbors === 3) {
                        nextCell = Cell.Alive;
                    }
                }
                nextCells[idx] = nextCell;
            }
        }

        // Swap buffers
        this.cells.set(this.nextCells);
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

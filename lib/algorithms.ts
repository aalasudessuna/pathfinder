export interface Cell {
  row: number;
  col: number;
}

export interface GridNode extends Cell {
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  distance: number;
  isVisited: boolean;
  previousNode: GridNode | null;
  fScore?: number;
  gScore?: number;
}

export type Grid = GridNode[][];

export function createGrid(rows: number, cols: number, start: Cell, end: Cell): Grid {
  const grid: Grid = [];
  for (let row = 0; row < rows; row++) {
    const currentRow: GridNode[] = [];
    for (let col = 0; col < cols; col++) {
      currentRow.push({
        row,
        col,
        isWall: false,
        isStart: row === start.row && col === start.col,
        isEnd: row === end.row && col === end.col,
        distance: Infinity,
        isVisited: false,
        previousNode: null,
      });
    }
    grid.push(currentRow);
  }
  return grid;
}

function cloneGrid(grid: Grid): Grid {
  return grid.map(function (row) {
    return row.map(function (node) {
      return Object.assign({}, node, { previousNode: null });
    });
  });
}

function getNeighbors(node: GridNode, grid: Grid): GridNode[] {
  const row = node.row;
  const col = node.col;
  const neighbors: GridNode[] = [];
  const deltas = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (let i = 0; i < deltas.length; i++) {
    const dr = deltas[i][0];
    const dc = deltas[i][1];
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
      neighbors.push(grid[newRow][newCol]);
    }
  }
  return neighbors.filter(function (n) {
    return !n.isWall;
  });
}

function reconstructPath(endNode: GridNode): GridNode[] {
  const path: GridNode[] = [];
  let current: GridNode | null = endNode;
  while (current !== null) {
    path.unshift(current);
    current = current.previousNode;
  }
  return path;
}

export interface AlgorithmResult {
  visitedInOrder: GridNode[];
  path: GridNode[];
}

export function bfs(inputGrid: Grid, start: Cell, end: Cell): AlgorithmResult {
  const grid = cloneGrid(inputGrid);
  const visitedInOrder: GridNode[] = [];
  const startNode = grid[start.row][start.col];
  const endNode = grid[end.row][end.col];

  const queue: GridNode[] = [startNode];
  startNode.isVisited = true;
  startNode.distance = 0;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    visitedInOrder.push(current);

    if (current.row === endNode.row && current.col === endNode.col) {
      return { visitedInOrder: visitedInOrder, path: reconstructPath(current) };
    }

    const neighbors = getNeighbors(current, grid);
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      if (!neighbor.isVisited) {
        neighbor.isVisited = true;
        neighbor.previousNode = current;
        queue.push(neighbor);
      }
    }
  }

  return { visitedInOrder: visitedInOrder, path: [] };
}

export function dfs(inputGrid: Grid, start: Cell, end: Cell): AlgorithmResult {
  const grid = cloneGrid(inputGrid);
  const visitedInOrder: GridNode[] = [];
  const startNode = grid[start.row][start.col];
  const endNode = grid[end.row][end.col];

  const stack: GridNode[] = [startNode];
  const seen: { [key: string]: boolean } = {};
  seen[startNode.row + '-' + startNode.col] = true;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) break;
    current.isVisited = true;
    visitedInOrder.push(current);

    if (current.row === endNode.row && current.col === endNode.col) {
      return { visitedInOrder: visitedInOrder, path: reconstructPath(current) };
    }

    const neighbors = getNeighbors(current, grid);
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      const key = neighbor.row + '-' + neighbor.col;
      if (!seen[key]) {
        seen[key] = true;
        neighbor.previousNode = current;
        stack.push(neighbor);
      }
    }
  }

  return { visitedInOrder: visitedInOrder, path: [] };
}

export function dijkstra(inputGrid: Grid, start: Cell, end: Cell): AlgorithmResult {
  const grid = cloneGrid(inputGrid);
  const visitedInOrder: GridNode[] = [];
  const startNode = grid[start.row][start.col];
  const endNode = grid[end.row][end.col];

  const unvisited: GridNode[] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      unvisited.push(grid[r][c]);
    }
  }
  startNode.distance = 0;

  while (unvisited.length > 0) {
    unvisited.sort(function (a, b) {
      return a.distance - b.distance;
    });
    const closest = unvisited.shift();
    if (!closest) break;

    if (closest.distance === Infinity) break;
    closest.isVisited = true;
    visitedInOrder.push(closest);

    if (closest.row === endNode.row && closest.col === endNode.col) {
      return { visitedInOrder: visitedInOrder, path: reconstructPath(closest) };
    }

    const neighbors = getNeighbors(closest, grid);
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      if (!neighbor.isVisited) {
        const tentativeDistance = closest.distance + 1;
        if (tentativeDistance < neighbor.distance) {
          neighbor.distance = tentativeDistance;
          neighbor.previousNode = closest;
        }
      }
    }
  }

  return { visitedInOrder: visitedInOrder, path: [] };
}

function manhattanDistance(a: Cell, b: Cell): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function aStar(inputGrid: Grid, start: Cell, end: Cell): AlgorithmResult {
  const grid = cloneGrid(inputGrid);
  const visitedInOrder: GridNode[] = [];
  const startNode = grid[start.row][start.col];
  const endNode = grid[end.row][end.col];

  const open: GridNode[] = [startNode];
  startNode.gScore = 0;
  startNode.fScore = manhattanDistance(start, end);

  const seen: { [key: string]: boolean } = {};
  seen[startNode.row + '-' + startNode.col] = true;

  while (open.length > 0) {
    open.sort(function (a, b) {
      const fa = a.fScore === undefined ? Infinity : a.fScore;
      const fb = b.fScore === undefined ? Infinity : b.fScore;
      return fa - fb;
    });
    const current = open.shift();
    if (!current) break;
    current.isVisited = true;
    visitedInOrder.push(current);

    if (current.row === endNode.row && current.col === endNode.col) {
      return { visitedInOrder: visitedInOrder, path: reconstructPath(current) };
    }

    const neighbors = getNeighbors(current, grid);
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      const currentG = current.gScore === undefined ? Infinity : current.gScore;
      const neighborG = neighbor.gScore === undefined ? Infinity : neighbor.gScore;
      const tentativeG = currentG + 1;

      if (tentativeG < neighborG) {
        neighbor.previousNode = current;
        neighbor.gScore = tentativeG;
        neighbor.fScore = tentativeG + manhattanDistance(neighbor, end);

        const key = neighbor.row + '-' + neighbor.col;
        if (!seen[key]) {
          seen[key] = true;
          open.push(neighbor);
        }
      }
    }
  }

  return { visitedInOrder: visitedInOrder, path: [] };
}

export type AlgorithmKey = 'bfs' | 'dfs' | 'dijkstra' | 'astar';

export const algorithmRunners = {
  bfs: bfs,
  dfs: dfs,
  dijkstra: dijkstra,
  astar: aStar,
};

export const algorithmLabels = {
  bfs: 'Breadth-First Search',
  dfs: 'Depth-First Search',
  dijkstra: "Dijkstra's Algorithm",
  astar: 'A* Search',
};
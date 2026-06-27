'use client';

import { useState, useRef, useCallback } from 'react';
import {
  createGrid,
  algorithmRunners,
  algorithmLabels,
  type Grid,
  type Cell,
  type AlgorithmKey,
  type GridNode,
} from '@/lib/algorithms';

const ROWS = 18;
const COLS = 32;
const START: Cell = { row: 9, col: 5 };
const END: Cell = { row: 9, col: 26 };

type Mode = 'wall' | 'erase';

function cellClass(node: GridNode, visitedSet: Set<string>, pathSet: Set<string>): string {
  const key = `${node.row}-${node.col}`;
  if (node.isStart) return 'bg-start';
  if (node.isEnd) return 'bg-end';
  if (node.isWall) return 'bg-wall';
  if (pathSet.has(key)) return 'bg-path';
  if (visitedSet.has(key)) return 'bg-visited/60';
  return 'bg-panel';
}

export default function Home() {
  const [grid, setGrid] = useState<Grid>(() => createGrid(ROWS, COLS, START, END));
  const [algorithm, setAlgorithm] = useState<AlgorithmKey>('astar');
  const [isRunning, setIsRunning] = useState(false);
  const [visitedSet, setVisitedSet] = useState<Set<string>>(new Set());
  const [pathSet, setPathSet] = useState<Set<string>>(new Set());
  const [speed, setSpeed] = useState(15);
  const [stats, setStats] = useState<{ visited: number; pathLength: number } | null>(null);
  const isMouseDown = useRef(false);
  const mode = useRef<Mode>('wall');
  const timeouts = useRef<number[]>([]);

  const clearTimers = () => {
    timeouts.current.forEach((t) => clearTimeout(t));
    timeouts.current = [];
  };

  const toggleWall = (row: number, col: number, forceMode?: Mode) => {
    setGrid((prev) => {
      const next = prev.map((r) => r.map((c) => ({ ...c })));
      const node = next[row][col];
      if (node.isStart || node.isEnd) return next;
      const targetMode = forceMode ?? (node.isWall ? 'erase' : 'wall');
      node.isWall = targetMode === 'wall';
      return next;
    });
  };

  const handleMouseDown = (row: number, col: number) => {
    if (isRunning) return;
    const node = grid[row][col];
    if (node.isStart || node.isEnd) return;
    isMouseDown.current = true;
    mode.current = node.isWall ? 'erase' : 'wall';
    toggleWall(row, col, mode.current);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isRunning || !isMouseDown.current) return;
    toggleWall(row, col, mode.current);
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
  };

  const resetGrid = useCallback(() => {
    clearTimers();
    setIsRunning(false);
    setVisitedSet(new Set());
    setPathSet(new Set());
    setStats(null);
    setGrid(createGrid(ROWS, COLS, START, END));
  }, []);

  const clearWalls = () => {
    clearTimers();
    setVisitedSet(new Set());
    setPathSet(new Set());
    setStats(null);
    setGrid((prev) => prev.map((row) => row.map((node) => ({ ...node, isWall: false }))));
  };

  const runAlgorithm = () => {
    clearTimers();
    setVisitedSet(new Set());
    setPathSet(new Set());
    setStats(null);
    setIsRunning(true);

    const runner = algorithmRunners[algorithm];
    const { visitedInOrder, path } = runner(grid, START, END);

    const delay = Math.max(4, speed);

    visitedInOrder.forEach((node, i) => {
      const t = window.setTimeout(() => {
        setVisitedSet((prev) => {
          const next = new Set(prev);
          next.add(`${node.row}-${node.col}`);
          return next;
        });
      }, i * delay);
      timeouts.current.push(t);
    });

    const pathStart = visitedInOrder.length * delay;
    path.forEach((node, i) => {
      const t = window.setTimeout(() => {
        setPathSet((prev) => {
          const next = new Set(prev);
          next.add(`${node.row}-${node.col}`);
          return next;
        });
      }, pathStart + i * (delay * 2));
      timeouts.current.push(t);
    });

    const finishTimer = window.setTimeout(() => {
      setIsRunning(false);
      setStats({
        visited: visitedInOrder.length,
        pathLength: path.length,
      });
    }, pathStart + path.length * (delay * 2) + 50);
    timeouts.current.push(finishTimer);
  };

  return (
    <main className="min-h-screen px-4 py-10 md:py-14">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-frontier/20 bg-frontier/5 px-4 py-1.5 text-xs font-medium text-frontier">
            <span className="h-1.5 w-1.5 rounded-full bg-frontier animate-pulse" />
            Algoritma Görselleştirici
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Path<span className="text-frontier">Finder</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/50 md:text-base">
            BFS, DFS, Dijkstra ve A* algoritmalarının grid üzerinde nasıl çalıştığını canlı izle.
          </p>
        </div>

        {/* Controls */}
        <div className="glass mb-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl p-4">
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as AlgorithmKey)}
            disabled={isRunning}
            className="rounded-lg border border-white/10 bg-ink px-3 py-2 text-sm text-white focus:outline-none disabled:opacity-50"
          >
            {Object.entries(algorithmLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>Hız</span>
            <input
              type="range"
              min={4}
              max={60}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              disabled={isRunning}
              className="w-24 accent-frontier"
            />
          </div>

          <button
            onClick={runAlgorithm}
            disabled={isRunning}
            className="rounded-lg bg-start px-5 py-2 text-sm font-semibold text-ink transition hover:bg-start/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? 'Çalışıyor…' : 'Başlat'}
          </button>

          <button
            onClick={clearWalls}
            disabled={isRunning}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 disabled:opacity-50"
          >
            Duvarları Temizle
          </button>

          <button
            onClick={resetGrid}
            disabled={isRunning}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 disabled:opacity-50"
          >
            Sıfırla
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-4 flex justify-center gap-6 text-xs text-white/50">
            <span>
              Ziyaret edilen hücre: <span className="font-mono text-frontier">{stats.visited}</span>
            </span>
            <span>
              Yol uzunluğu:{' '}
              <span className="font-mono text-path">
                {stats.pathLength > 0 ? stats.pathLength : 'Yol bulunamadı'}
              </span>
            </span>
          </div>
        )}

        {/* Grid */}
        <div
          className="glass mx-auto inline-block rounded-2xl p-3"
          onMouseLeave={handleMouseUp}
        >
          <div
            className="grid gap-[2px]"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            onMouseUp={handleMouseUp}
          >
            {grid.map((row) =>
              row.map((node) => (
                <div
                  key={`${node.row}-${node.col}`}
                  onMouseDown={() => handleMouseDown(node.row, node.col)}
                  onMouseEnter={() => handleMouseEnter(node.row, node.col)}
                  className={`cell-transition h-5 w-5 rounded-[3px] md:h-6 md:w-6 ${cellClass(
                    node,
                    visitedSet,
                    pathSet,
                  )}`}
                />
              )),
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-white/50">
          <Legend color="bg-start" label="Başlangıç" />
          <Legend color="bg-end" label="Bitiş" />
          <Legend color="bg-wall" label="Duvar (tıkla / sürükle)" />
          <Legend color="bg-visited/60" label="Ziyaret edildi" />
          <Legend color="bg-path" label="En kısa yol" />
        </div>
      </div>
    </main>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ${color}`} />
      {label}
    </div>
  );
}
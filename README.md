# PathFinder

Interactive pathfinding algorithm visualizer — watch BFS, DFS, Dijkstra, and A* search a grid in real time.

## Overview

PathFinder lets you draw walls on a grid, choose a pathfinding algorithm, and watch step-by-step how it explores the grid to find the shortest path between a start and end node. Built to demonstrate core data structures and algorithms (queues, stacks, priority-based search, graph traversal) through an interactive, visual interface.

## Features

- 🧭 **Four algorithms** — Breadth-First Search, Depth-First Search, Dijkstra's Algorithm, and A* Search
- 🎨 **Interactive grid** — click and drag to draw or erase walls
- ⏱️ **Adjustable animation speed** — slow it down to study each step, or speed it up for a quick demo
- 📊 **Live stats** — see how many cells were visited and the resulting path length
- 🎯 **Clear visual legend** — start, end, walls, visited cells, and the final shortest path are all color-coded

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000), draw some walls, pick an algorithm, and hit **Start**.

## Project Structure

\`\`\`
app/
├── page.tsx        # Grid UI, animation logic, and controls
├── layout.tsx       # Root layout
└── globals.css       # Global styles
lib/
└── algorithms.ts      # BFS, DFS, Dijkstra, and A* implementations
\`\`\`

## How It Works

Each algorithm receives the grid, a start cell, and an end cell, and returns:
- \`visitedInOrder\` — every cell the algorithm explored, in the order it explored them
- \`path\` — the final shortest path, if one was found

The UI replays both arrays with a timed delay to animate the search and the resulting path.

| Algorithm | Guarantees shortest path? | Strategy |
|---|---|---|
| BFS | ✅ Yes (unweighted grid) | Explores level by level using a queue |
| DFS | ❌ No | Explores depth-first using a stack |
| Dijkstra | ✅ Yes | Always expands the closest unvisited node |
| A* | ✅ Yes | Like Dijkstra, but guided by a heuristic (Manhattan distance) toward the goal |

## Roadmap

- [ ] Maze generation (randomized walls)
- [ ] Weighted nodes (terrain cost)
- [ ] Diagonal movement option
- [ ] Step-by-step manual mode

## Author

Built by [Sude Suna](https://github.com/aalasudessuna) as part of a portfolio project.

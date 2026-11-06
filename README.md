# 🎯 Greedy Best-First Search (GBFS) Maze Visualizer

An interactive web-based visualization tool for **Greedy Best-First Search (GBFS)**, designed to demonstrate how heuristic-driven search algorithms navigate through a maze. The application provides step-by-step animation, real-time statistics, and a comparison with the **A\*** algorithm to illustrate the strengths and limitations of heuristic search.

---

## 📖 Overview

Greedy Best-First Search is an informed search algorithm that expands the node with the lowest heuristic value **h(n)**, attempting to reach the goal as quickly as possible. Since it ignores the actual path cost **g(n)**, it is fast but does not always produce the optimal solution.

This project visualizes every stage of the search process, making it easier to understand how GBFS explores a maze and how its behavior differs from A*.

---

## ✨ Features

- 🎲 Random Maze Generation
- 🧠 Greedy Best-First Search Visualization
- ⭐ A* Search Comparison
- ▶️ Play / Pause Animation
- ⏭ Step Forward
- ⏮ Step Back
- ⚡ Adjustable Animation Speed
- 📊 Live Statistics Panel
- 📈 Performance Comparison
- 📱 Responsive Modern UI
- 🌙 Dark Theme

---

## 🧩 Algorithm

### Greedy Best-First Search

GBFS selects the next node solely based on the heuristic value.

```
Priority = h(n)
```

where

```
h(n) = Manhattan Distance
```

Unlike A*, GBFS ignores the path cost already traveled.

---

### A* Search

For comparison, the application also implements A* Search.

```
f(n) = g(n) + h(n)
```

where

- **g(n)** = Cost from Start Node
- **h(n)** = Estimated Distance to Goal

---

## 📐 Heuristic

This project uses **Manhattan Distance**.

```
h(n) = |x₁ - x₂| + |y₁ - y₂|
```

This heuristic is well suited for grid-based maze traversal with four-directional movement.

---

## 🎮 Controls

| Control | Description |
|----------|-------------|
| Generate Maze | Creates a new random maze |
| Reset | Clears the visualization |
| Run GBFS | Starts Greedy Best-First Search |
| Run A* | Starts A* Search |
| Play | Plays animation |
| Pause | Pauses animation |
| Step Forward | Moves one step forward |
| Step Back | Moves one step backward |
| Speed Slider | Adjusts animation speed |
| Show A* Overlay | Displays A* path over GBFS path |

---

## 📊 Live Statistics

The visualization updates in real time with:

- Current Node
- Frontier Size
- Visited Nodes
- Expanded Nodes
- Current Heuristic
- Path Length
- Execution Time

---

## 📈 Performance Comparison

The application compares GBFS and A* using:

- Nodes Expanded
- Path Length
- Path Cost
- Execution Time

This comparison demonstrates why Greedy Best-First Search is often faster but may generate suboptimal paths.

---

## 🎨 Visualization

The maze uses different colors to represent search states.

| State | Color |
|--------|-------|
| Start | 🟢 Green |
| Goal | 🔴 Red |
| Wall | ⬛ Black |
| Frontier | 🔵 Blue |
| Visited | ⚪ Gray |
| Current Node | 🟠 Orange |
| GBFS Path | 🟡 Yellow |
| A* Path | 🟣 Cyan |

---

## 📂 Project Structure

```
GBFS/
│
├── index.html
├── app.js
│
├── css/
│   ├── base.css
│   ├── components.css
│   ├── main.css
│   ├── maze.css
│   ├── panels.css
│   ├── responsive.css
│   └── variables.css
│
├── js/
│   ├── algorithms/
│   │   ├── MazeGenerator.js
│   │   └── Pathfinder.js
│   │
│   ├── components/
│   │   ├── Comparison.js
│   │   ├── Controls.js
│   │   ├── MazeGrid.js
│   │   ├── StatsManager.js
│   │   └── Toast.js
│   │
│   └── core/
│       ├── Heuristics.js
│       ├── PriorityQueue.js
│       └── ...
```

---

## 💻 Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- CSS Grid
- Priority Queue
- Modular JavaScript Architecture

---

## ⚙️ How to Run

1. Clone the repository

```bash
git clone https://github.com/your-username/GBFS.git
```

2. Open the project folder.

3. Launch `index.html` in your browser.

Or run using VS Code Live Server.

---

## 📚 Learning Objectives

This project helps understand:

- Informed Search Algorithms
- Greedy Best-First Search
- Heuristic Functions
- Manhattan Distance
- A* Search
- Search Tree Expansion
- Pathfinding Visualization

---

## 📄 License

This project is intended for educational and academic purposes.

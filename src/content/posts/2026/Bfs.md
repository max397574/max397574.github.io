---
title: "Daily DSA 03: BFS"
pubDatetime: 2026-11-08
slug: daily-dsa-03-bfs
tags:
  - DSA
description: The Breadth-First-Search algorithm
---

Today we look into BFS. It's an algorithm for [graphs](./Graphs.md) using the
[queue](./Queue.md) we looked at earlier.

While it's a really simple algorithm it can already be used for quite some
problems and it really important as a subroutine in a lot of other graph
algorithms.

# Breadth First Search

BFS is an algorithm to traverse a graph. You start from a source node and then
visit all the other nodes by level. It's called _breadth_ first search because
we go through the whole _breadth_ of a level because we go to a _deeper_ one
(unlike depth first search). We do this until we've visited all the nodes in the
graph (reachable from the starting node).

In code we can accomplish this by using a queue for the next nodes we'll visit
and then for each node adding all the neighbours of it to it. Because we use a
queue (FIFO) the nodes seen earlier (closer to the source/on an earlier level)
will be visited earlier.

We also need to keep track of which nodes we've already seen so we don't end up
visiting nodes multiple times.

## Implementation

The implementation is really simple. Here we use the builtin queue from Rust and
represent the graph as adjacency list.

```rust
use std::collections::VecDeque;

fn bfs(adj: &Vec<Vec<usize>>, start_node: usize) {
    let mut q = VecDeque::new();
    let mut visited = vec![false; adj.len()];

    q.push_back(start_node);
    while let Some(node) = q.pop_front() {
        // Do something with node

        for neighbour in &adj[node] {
            if !visited[neighbour] {
                visited[neighbour] = true;
                q.push_back(neighbour);
            }
        }
    }
}
```

## Analysis

Since we look at all vertices and edges we have a **$O(n + m)$ runtime**. The
algorithm requires $O(n)$ additional space in this basic version (for `visited`
and the queue).

# Usage

Now we get to the actually interesting part of this. I'll cover here only
applications which just require BFS, not algorithms just using it as subroutine
(hopefully some of these will be covered at a later point).

## Shortest Paths in Unweighted Graphs

In an unweighted graph you can easily find shortest paths from a single source
to all other nodes using BFS. Since BFS goes through the nodes by levels, aka by
distance from the start node, the first time we see a node it also the shortest
possible way (or one of them if there is a tie) to get to the node.

We can also easily figure out the actual path by storing parents to allow us to
backtrack the path.

### Implementation

If you'd actually implement this you'd terminate early when getting to the goal
node, or just return the resulting `Vec`s. For illustration purposes I won't do
this here, so I'm also able to illustrate how to backtrack.

```rust
use std::collections::VecDeque;

fn bfs_shortest_path(adj: &Vec<Vec<usize>>, start_node: usize, end_node: usize) {
    let mut q = VecDeque::new();
    let n = adj.len();
    let mut visited = vec![false; n];
    let mut parents = vec![usize::MAX; n]
    let mut distances = vec![u32::MAX];

    distances[start_node] = 0;

    q.push_back(start_node);
    while let Some(node) = q.pop_front() {

        for neighbour in &adj[node] {
            if distances[neighbour] == u32::MAX {
                distances[neighbour] = distances[node] + 1;
                parents[neighbour] = node;
            }
            if !visited[neighbour] {
                visited[neighbour] = true;
                q.push_back(neighbour);
            }
        }
    }

    if distances[end_node] != u32::MAX {
        let mut path = VecDeque::with_capacity(distances[end_node]);
        let mut current = end_node;
        while current != u32::MAX {
            path.push_front(current);
            current = parents[current];
        }
    } else {
        // Node was unreachable from start node
    }
}
```

## Cycle Detection

We'll just look at undirected graphs. While a popular algorithm for cycle
detection for directed graphs actually also involves a BFS it would also
introduce some other topics which are out of scope for this post.

We can recognize a cycle if we visit a node again which we've seen before, but
get to it through a different edge. This we can check by keeping track of the
parents (aka the node through which we reached a certain node the first time).

### Implementation

The implementation is quite straightforward, similar to the other two
implementations we've seen so far.

I here extended it a bit to also be able to handle disconnected graphs.

```rust
use std::collections::VecDeque;

fn has_cycle_undirected(adj: &Vec<Vec<usize>>) -> bool {
    let n = adj.len();
    let mut visited = vec![false; n];
    let mut parents = vec![usize::MAX; n];

    // We go through all possible start nodes
    // to be able to deal with disconnected graphs
    for start_node in 0..n {
        if visited[start_node] {
            continue;
        }

        let mut q = VecDeque::new();
        visited[start_node] = true;
        q.push_back(start_node);

        while let Some(node) = q.pop_front() {
            for &neighbour in &adj[node] {
                if !visited[neighbour] {
                    visited[neighbour] = true;
                    parents[neighbour] = node;
                    q.push_back(neighbour);
                } else if neighbour != parents[node] {
                    return true;
                }
            }
        }
    }

    false
}
```

# Example Problem~~s~~

I'll for this post do just a single example problem. I could easily think of
quite a few different problems, but I wanted to rather do something a bit more
complex showing multiple interesting ideas that could occur in a problem.

**Problem:** You're given a grid with 100 by 100 tiles ($x$- and $y$-coordinates
0-99). Each tile can either be empty, filled with water, contain a tree, or be
on fire. Each tick the fire can spread in a plus shape (up, down, left, or
right). The fire can't go through water. If fire reaches a tree it will turn
into fire and can spread on the next tick. You're given the positions of the
trees, water, and fires. You need to figure out which tree start burning last
(or not at all) and when it starts burning. You're guaranteed there is a unique
solution.

Solving this exercise requires a few interesting concepts:

**Implicit Graph:** We aren't given a graph as input. But we can easily imagine
the grid as a graph with horizontal and vertical connections between all the
tiles. As you see in the solution we don't need to actually model this graph but
rather just "simulate" the edges while traversing it. We don't represent nodes
with just `usize`s as before, but rather with their coordinates.

**Multi-Source BFS**: Because there can be multiple fires at the start we need
to do BFS starting from multiple sources and mark the first time a fire arrives
at a tree. We can actually still do this with a single BFS, but instead of just
one starting node in the queue we have multiple ones.

## The Solution

```rust
use std::collections::VecDeque;

fn last_tree_standing(
    trees: Vec<(usize, usize)>,
    water: Vec<(usize, usize)>,
    fires: Vec<(usize, usize)>,
) -> ((usize, usize), u32) {
    // Create a lookup table for efficient checking for water in O(1)
    let mut is_water = vec![vec![false; 100]; 100];
    for (x, y) in water {
        is_water[x][y] = true;
    }

    let mut q = VecDeque::new();
    let mut distances = vec![vec![u32::MAX; 100]; 100];

    // Start the BFS with the fires as starting points
    for (x, y) in fires {
        distances[x][y] = 0;
        q.push_back((x, y));
    }

    let directions: [(isize, isize); 4] = [(-1, 0), (1, 0), (0, -1), (0, 1)];

    while let Some((x, y)) = q.pop_front() {
        for (dx, dy) in directions {
            let next_x = x as isize + dx;
            let next_y = y as isize + dy;

            if (0..100).contains(&next_x) && (0..100).contains(&next_y) {
                let next_x = next_x as usize;
                let next_y = next_y as usize;

                if !is_water[next_x][next_y] && distances[next_x][next_x] == u32::MAX {
                    distances[next_x][next_y] = distances[x][y] + 1;
                    q.push_back((next_x, next_y));
                }
            }
        }
    }

    let mut last_tree = (trees[0], u32::MAX);

    for (x, y) in trees {
        let burn_time = distances[x][y];

        // If there is a tree with u32::MAX as time it didn't ever burn
        // and therefore must be the solution
        if burn_time == u32::MAX {
            return ((x, y), u32::MAX);
        }

        if burn_time > last_tree.1 {
            last_tree = ((x, y), burn_time);
        }
    }

    last_tree
}
```

# Conclusion

While we didn't cover a lot of problems today, I hope you still got a glance at
how many and diverse applications BFS has. In the future I'll likely write about
quite a few other ones too.

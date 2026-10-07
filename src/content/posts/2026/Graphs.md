---
title: "Daily DSA 02: Graphs"
pubDatetime: 2026-10-08
slug: daily-dsa-02-graphs
tags:
  - DSA
description: An Introduction to Graphs
---

We continue with the [Daily DSA series](./DailyDSAIntro.md). The obvious choice
after the [Queue](./Queue.md) yesterday would be the stack. But because this
would again be really basic we're continuing with a bit more of an advanced
topic (but no worries, still easy to learn).

# Graphs

Simply days a graph is a bunch of points connected with lines. We call the
points _vertices_ (or a single one _vertex_) and the connecting lines _edges_.

We write this as $G = (V, E)$ where $V$ is the set of vertices and $E$ the set
of edges. For analysis we often use $n = |V|$ and $m = |E|$.

Graphs are very useful because they can represent a lot of real-world and also
other theoretical problems. Examples would be: A street network, dependencies, a
communication network, or a production chain.

## Variations

Normally we have graphs in which there is at most a single edge between two
vertices (one per direction for directed graphs) and no self loops.

In a _Multigraph_ multiple edges between two vertices are allowed. I don't even
know if there is a special name for graphs with self loops.

## Paths and Walks

A _path_ of length $k$ is a series of vertices $(v_0, v_1, ..., v_k)$ where
$\forall i,j: v_i \neq v_k$. Notice that the length is the amount of edges and
not the amount of vertices.

A _walk_ is similar, with the difference that it allows duplicate vertices.

## Vertices

Vertices are the nodes of the graph. They can theoretically be any object and
have metadata associated with them. In practical applications most often they're
just a single number. If they aren't it's really useful to have a unique key
associated with each one.

### Properties

#### Degree

Every vertex has a degree. We denote it with $deg(v)$. For an undirected graph
this is simple the amount of connected edges. For directed graphs a node can
have both an in- and an out-degree, denoting the incoming and the outgoing
edges. We can denote this with e.g. $deg^+ (v)$ and $deg^- (v)$.

In every directed graph the _Degree Sum Formula_ holds. It describes a simple
relation between the degrees and the amount of edges. It's explanation is really
easy: Every edge connects to two nodes and therefore adds two to the sum of
degrees.

For undirected graphs the sum of in-degrees must match the sum out the
out-degrees. The sum of both of them must again be twice the number of edges.

:::properties

Undirected graph:

- $\sum_{v \in V} deg(v) = 2 |E|$

Directed graph:

- $\sum_{v \in V} deg^+ (v) = \sum_{v \in V} deg^- (v)$
- $\sum_{v \in V} (deg^+ (v) + deg^- (v)) = 2 |E|$

:::

## Edges

### Properties

#### (Un)Directed

The edges can be directed (you can just go through them in one direction) or
undirected. Graphically we often illustrate this using arrows vs just simple
lines.

#### Weight

A graph can either be weighted or unweighted. In a weighted graph we associate a
_weight_ (commonly either in $\mathbb{R}$ or $\mathbb{N}$) with every edge.
Sometimes this is also called _cost_. Mathematically we do this via a weight
function $w: E \rightarrow \mathbb{R}$.

We can use this to represent e.g. a distance between nodes (for shortest path
problems) or a cost to build a connection (for MST (you'll learn about that
later) problems).

# Graph Representations

There are many different ways. They all have some advantages and disadvantages.

## Adjacency Matrix

An adjacency matrix is a matrix $A \in \mathbb{R}^{n \times n}$. $A_{i j}$
represents the edge from $u$ to $v$. In an unweighted graph we can just use the
values 0 and 1, in a weighted graph the value can be the weight of an edge. If 0
is a possible weight we can use INF (e.g. `u32::MAX`) to represent the absence
of an edge.

### Analysis

- Space $O(n^2)$
- Degree: $O(n)$
- Adding/removing edge: $O(1)$
- Adding/removing vertex: $O(n^2)$ (requires copying/shifting the whole thing)
- Checking for adjacency: $O(1)$
- Neighbours: $O(n)$

### Cool Tricks

These all work for an unweighted graph, $A \in {0,1}^{n \times n}$.

#### Counting Paths

The entry $(A^k)_{i j}$ is the exact number of walks (paths allowing repeated
edges and vertices) of length $k$ from $i$ to $j$.

#### Counting Triangles

We can count the amount of triangles $T$ in the graph using the trace of the
adjacency matrix.

$T = 1/6 \sum_{i=1}^n (A^3)_{i i}$

The reason this works is because each triangle contributes to the paths 6 times:
3 different vertices and 2 directions for the walk for each.

## Adjacency List

Here we just store for each vertex it's adjacent vertices (aka neighbours). For
undirected edges we store $u$ as neighbour of $v$ and $v$ as neighbour of $u$.

I'd say from my experience this is for most algorithms the most common and
useful representation. In Rust this can be as simple as a `Vec<Vec<usize>>`, if
you need weights make it a tuple with the weight.

### Analysis

I'll assume we do this in Rust, and use a `Vec` for this, so we can get the
length of the neighbours in constant time.

- Space $O(n + m)$
- Degree: $O(1)$
- Adding/removing edge: $O(n)$
- Adding/removing vertex: $O(m)$ (requires copying/shifting the whole thing)
- Checking for adjacency: $O(n)$
- Neighbours: $O(n)$

## Edge List

We can represent a graph with just a list of the edges, the nodes we can then
figure out from that. This has an issue that you can't directly represent
isolated nodes ($v$ with $deg(v) = 0$). Therefore you'd need some additional
data.

This is only used rarely from my experience.

# Special Graphs

There are some special graphs which have special properties and therefore are
used or allow for special algorithms.

## Tree

A _tree_ is a graph which is connected and has no cycles. For some algorithms we
also use _rooted trees_. There is a special vertex called _root_.

Vertices $v$ with $\deg(v) = 1$ we call _leaves_.

Trees have because some special properties of their form.

:::properties

The following statements are all **equivalent** for a finite graph $T = (V,E)$
with $|V| \leq 1$.

- $T$ is **connected and acyclic** (aka a tree)
- For every pair $u,v in V$ there is a **unique path**
- $T$ is **minimally connected**. Deleting any edge makes it disconnected.
- $T$ is **maximally acyclic**[^1]. That means that adding any new edge to it,
  makes it cyclic.
- $T$ is **connected with $|E| = n - 1$**.
- $T$ is **acyclic with $|E| = n - 1$**.

:::

## Others

There would be many more things which we could list here. For many I haven't yet
really found out about many specific algorithms etc. I'll perhaps make posts for
them or update this one. Examples would include

- Bipartite graphs (all trees are bipartite)
- Planar graphs

[^1]: I admit, looked that term up, but knew about the property.

---
title: "Daily DSA 04: DSU"
pubDatetime: 2026-10-10
slug: daily-dsa-04-dsu
tags:
  - DSA
description: The Disjoint Set Union Data Structure
---

Today we look at the disjoint set union (also known as union find) data
structure.

# The DSU

As the name says: This data structure is used to represent a _union_ of
_disjoint sets_. What does that mean? Two sets $A, B$ are disjoint if
$A \cap B = \emptyset$. If our data is a number of such sets we can represent it
with a DSU. As said, another name for the DSU is union-find. This is because of
the two operations the data structure allows us to do.

## Union

With the `union` operation we can combine two of the sets to create a new one.
This obviously will still be disjoint from all the other ones. The result will
still be a DSU.

This function can just take any elements of each of the sets.

## Find

For each set there is a representative. With the `find` operation we can for a
given element find it's representative.

## Analysis

We have a space complexity $O(n)$ for various arrays which you'll see later in
the implementation.

The time complexity is a bit more complicated. Creating the data structure for
some input data takes $O(n)$. In our implementation we do some optimizations and
can with that accomplish an amortized (that's a fancy term for saying average
over multiple runs [^1]) runtime of $O(\alpha(n))$. The $\alpha(n)$ is the
inverse Ackermann function. It grows really, really, slow. For any possible
input [^2] it's bounded value is $\leq 4$. So the runtime is basically constant.

## Implementation

The implementation of this is quite simple. We have an array to keep track of
the parent (isn't necessarily the representative) of each element and the size
of each component. In this implementation I decided to also keep track of how
many components there are.

As explained, each set has a representative (marked with the dashed line here)
which is directly or indirectly referenced by the elements.
![DSU](../../../../imgs/DSU.png)

To `find` the representative we just follow the parent array until we reach a
root. For the `union` we just set the parent of one of the representative to the
other one.

There are two important optimizations we need to make to reach the near linear
runtime:

- **Union by size**: When combining two components with `union` we compare the
  sizes of them and attach the smaller one to the larger one. This helps to keep
  the trees of parent relations balanced, resulting in better performance of
  `find` (expected height $log n$).
- **Path Compression:** While traversing up during the `find` operation to find
  the root we update the `parent` value for all the nodes we traverse and set
  them directly to the root. This again leads to way shorter paths and therefore
  better performance.

Now here we have the actual implementation in Rust. I also added some nice
utility functions as further example on how one would use this.

```rust
pub struct DSU {
    parent: Vec<usize>,
    size: Vec<usize>,
    components: usize
}

impl DSU {
    // for simplicity we'll just assume element are numbers from 0 up to and including n-1
    // It wouldn't be hard to adapt this for arbitrary elements
    // If the elements are more complex structs we could use HashMaps instead of vecs
    pub fn new(n: usize) -> Self {
        Self {
            parent: (0..n).collect(),
            size: vec![1; n],
            components: n,
        }
    }

    pub fn find(&mut self, i: usize) -> usize {
        if self.parent[i] == i {
            i
        } else {
            let root = self.find(self.parent[i]);
            // Path compression
            self.parent[i] = root;
            root
        }
    }

    pub fn union(&mut self, i: usize, j: usize) {
        let root_i = self.find(i);
        let root_j = self.find(j);

        if root_i == root_j {
            return;
        }

        // Union by size
        if self.size[root_i] < self.size[root_j] {
            self.parent[root_i] = root_j;
            self.size[root_j] += self.size[root_i];
        } else {
            self.parent[root_j] = root_i;
            self.size[root_i] += self.size[root_j];
        }

        self.components -= 1;
    }

    pub fn connected(&self, i: usize, j: usize) -> bool {
        self.find(i) == self.find(j)
    }

    pub fn size_of_component(&mut self, i: usize) -> usize {
        let root = self.find(i);
        self.size[root]
    }
}
```

There would be quite a straightforward space optimization possible which I
haven't done here to keep the implementation as simple as possible: It's enough
to store the size of a component once. And conveniently the root has no parent.
So we can just use negative numbers for the size and reuse the array for
parents. So if a `parent` value is negative we know we've reached the root and
the absolute value of that number is the size of the component.

[^1]:
    I know that's not exact, but from my understanding good enough [2^]: I at
    first struggled to figure out the value where it's larger than 4 because no
    calculator could handle such big numbers. Apparently it would be around
    $10^80$.

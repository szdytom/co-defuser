# 剪线谜题模块的生成算法设计

## 1. 概述

本笔记讨论如何根据一个初始种子，**程序化地**同时生成：
- 一套自洽、无矛盾且可操作的剪线规则（决策树）
- 一个具体的线束谜题实例（颜色序列）
- 对应的可读手册文本

并且保证每次使用相同种子都会得到完全相同的谜题与规则。

## 2. 核心设计目标

- **自洽性**：规则树必须在任何可能的线束配置上都能给出唯一且合法的剪线动作（完备性）。
- **无矛盾**：一条路径上的条件不能出现逻辑冲突（如前一个条件要求“没有红线”，后一个又要求“红线数量>0”）。
- **动作有效性**：叶子节点给出的剪线动作必须在其对应路径的所有配置下都能被执行（例如“剪断第一根蓝线”要求蓝线至少有一根）。
- **随机性与可控性**：整个过程由伪随机数生成器驱动，种子完全决定谜题内容。

## 3. 约束表示与可满足性求解

规则生成需要频繁判断“在给定一组条件的情况下，是否存在至少一种线束配置”。我们采用基于动态规划的记忆化搜索来实现高效且精确的约束求解。

### 3.1 状态定义

对于 `N` 根线、颜色池大小为 `C` 的问题，定义状态为每种颜色已使用数量的元组 `(c1, c2, ..., cC)`，维度为 `C`，总和不超过 `N`。同时将外部条件（如“序列号末位奇数”）作为附加的布尔变量 `s` 纳入状态空间。完整状态可表示为 `(s, c_红, c_黄, c_蓝, c_绿, c_白, ...)`。

状态总数等于 `(N+C choose C) * 2`，在 `N=6, C=5` 时仅为 `462 * 2 = 924`，极其轻微。

### 3.2 允许的颜色集合与计数上下界

每条约束都会限制某位置的颜色或某些颜色的总计数：

- **位置约束**：第 `i` 根线只能取自允许的颜色子集（由“最后一根是白线”、“第一根不是红色”等条件导出）。
- **计数约束**：为每种颜色指定下限 `min` 和上限 `max`（如“没有红线” → 红色上限为0；“不止一根蓝线” → 蓝色下限为2；“有且仅有一根黄线” → 黄色下限=上限=1）。

这些边界可以在添加条件时增量收缩。

### 3.3 动态规划求解器

采用记忆化深度优先搜索（DFS）遍历位置，同时跟踪已用颜色计数和当前序列号奇偶值。

```
function HasSolution(constraints):
    // 从约束中提取各颜色的min/max、每个位置的允许颜色集合、序列号奇偶的约束（可为null）
    // 返回是否存在满足所有约束的配置

    memo = dict()
    function dfs(pos, counts, serial_odd):
        if pos == N+1:
            return true  // 所有线已分配，计数边界在过程中已确保合规
        state_key = (pos, counts, serial_odd)
        if state_key in memo: return memo[state_key]
        for color in allowed_colors[pos]:
            if counts[color] + 1 <= max_count[color]:
                new_counts = counts.copy()
                new_counts[color] += 1
                // 可在此处检查部分分配是否会导致剩余位置无法满足下限（剪枝）
                if dfs(pos+1, new_counts, serial_odd):
                    memo[state_key] = true
                    return true
        memo[state_key] = false
        return false

    // 处理serial_odd约束：若约束未固定奇偶，则尝试两种可能性；若已固定则只试一种
    for each possible_serial in [0,1] that is compatible with serial constraint:
        if dfs(1, empty_counts, possible_serial):
            return true
    return false
```

通过提前剪枝（例如剩余未分配位置数小于还需满足的某种颜色下限），该搜索在强约束下几乎瞬间返回结果。此求解器既能判定约束集是否有解，也可统计解的数量（将 `dfs` 返回值改为方案数），后者可用于评估条件划分的均匀性。

## 4. 决策树的自动生成

决策树是一棵二叉树，内部节点为条件判断，叶子节点为剪线动作。生成过程是一个递归划分配置空间的过程。

### 4.1 原子条件池

我们预先定义一组可用的原子条件，每个条件都可独立求值且容易给出逻辑否定。条件分为三类：

- **颜色计数条件**：`count(C) == 0`、`count(C) > 0`、`count(C) == 1`、`count(C) > 1` 等。
- **位置相关条件**：`first_color == C`、`last_color == C`、`color_at(k) == C`。
- **外部条件**：`serial_odd == true`。

条件池可以按需扩展，例如加入比较条件（`count(红) > count(蓝)`），但需确保否定形式易于构造。

### 4.2 递归生成节点

```
function GenerateNode(constraints):
    // 随机打乱条件池（基于种子控制的PRNG）
    for each condition C in shuffled_pool:
        // 检查划分有效性
        true_solvable = HasSolution(constraints ∧ C)
        false_solvable = HasSolution(constraints ∧ ¬C)
        if true_solvable and false_solvable:
            // 可选：根据解空间大小评估划分质量，鼓励均匀划分
            true_node = GenerateNode(constraints ∧ C)
            false_node = GenerateNode(constraints ∧ ¬C)
            return InternalNode(C, true_node, false_node)

    // 没有条件能有效划分当前约束集 → 创建叶子节点
    return CreateLeafNode(constraints)
```

**划分有效性**保证真分支和假分支都至少有一种线束存在，从而避免产生恒真或恒假的条件，直接根除了逻辑矛盾。

**叶子创建**将在第5节详述。如果当前约束集仍有大量配置无法被进一步划分，我们可以直接将其标记为叶子，并通过启发式指定一个剪线位置。

### 4.3 启发式挑选条件

为增加谜题的平衡性与趣味性，可在候选条件中挑选“划分最均匀”的一个（即满足 `C` 和 `¬C` 的解数尽量接近）。通过 `CountSolutions(constraints)` 可获得解空间大小。这种做法可避免生成的规则过于偏斜（例如一个分支只剩极少数特例，导致规则冗长）。

## 5. 叶子动作的可行性保证

叶子节点给出的动作必须在其对应的约束集 `leaf_constraints` 下**总是可执行**。动作模板分为两类：

- **绝对位置动作**：剪断第 `k` 根线（或“最后一根”），只要 `1 ≤ k ≤ N` 就永远可行。
- **颜色定位动作**：剪断第一根/最后一根/第 `m` 根颜色为 `C` 的线。这要求约束集必须**蕴含**颜色 `C` 至少出现 `m` 次。

### 5.1 蕴含关系检查

动作“剪断第一根蓝线”在约束集 `S` 下可行，当且仅当不存在任何配置满足 `S ∧ (count(蓝) < 1)`。因此只需调用：

```
action_safe = not HasSolution(S ∧ (count(C) < m))
```

如果 `HasSolution` 返回 `false`，说明 `S` 强制蓝线数量 ≥ `m`，动作安全；否则该动作将被过滤掉。

### 5.2 叶子动作生成

```
function CreateLeafNode(constraints):
    safe_actions = []
    // 添加所有绝对位置动作
    for k in 1..N:
        safe_actions.append( CutAtAbsolute(k) )
    // 添加安全的颜色定位动作
    for color in all_colors:
        for template in [FirstOf(color), LastOf(color)]:
            if not HasSolution(constraints ∧ count(color) < 1):
                safe_actions.append(template)
    // 根据伪随机数从safe_actions中选择一个
    chosen = PRNG.choice(safe_actions)
    return LeafNode(chosen)
```

这样生成的任何叶子动作都绝对不会让操作员面对“找不到那根线”的窘境。

## 6. 生成谜题线束实例

在决策树构建完毕后，我们需要为操作员生成一个具体的线束（颜色序列），同时它必须能沿着决策树的某一分支走到一个合法的叶子动作。

最简单且可靠的方法是：**约束求解出一个满足所有规则树根节点约束的线束**。实际上，整个配置空间就是根节点的全集（所有可能的线束）。我们可以用与 `HasSolution` 相同的 DP 框架，随机选择一个完整的合法配置。

```
function GenerateWireInstance(seed_offset):
    // 使用独立的 PRNG 流
    config = []
    counts = empty
    serial_odd = PRNG.choice([true, false])
    // 逐位随机选择颜色，同时保证后续仍有解（前瞻检查）
    for pos = 1 to N:
        for color in shuffled_colors:
            if counts[color] + 1 <= max_count[color] and
               exists_solution_for_remainder(pos+1, counts with color+1, serial_odd):
                config.append(color)
                counts[color] += 1
                break
    return (config, serial_odd)
```

这个线束配置就是玩家 A 在屏幕上看到的谜题。因为生成过程使用了同样的全局约束边界（来自决策树的根节点，即无额外条件），所以该实例一定属于某个有效配置，从而能被规则手册覆盖。

## 7. 手册文本的自动生成

决策树需要转换为玩家 B 可读的规则文本。采用递归的“如果…否则…”链式描述。

### 7.1 条件与动作的自然语言模板

为每个原子条件预先设计人类可读的模板。例如：

| 条件 | 文字描述 |
|------|----------|
| `count(red) == 0` | “如果没有红线” |
| `last_color == white` | “当最后一根线为白线时” |
| `count(blue) > 1` | “当有不止一根蓝线时” |
| `serial_odd == true` | “如果序列号末位为奇数” |
| 组合条件（AND） | 自动将多个原子条件用“且”连接 |

动作模板：

| 动作 | 文字描述 |
|------|----------|
| `CutAtAbsolute(2)` | “剪断第二根线” |
| `CutFirstOf(blue)` | “剪断第一根蓝线” |
| `CutLastOf(red)`  | “剪断最后一根红线” |

### 7.2 树到文本的转换

遍历决策树，使用类似以下逻辑：

```
function TreeToText(node):
    if node is Leaf:
        return "则" + ActionText(node.action) + "。"
    else:
        true_text = TreeToText(node.true_child)
        false_text = TreeToText(node.false_child)
        // 简化输出：如果假分支是叶子且真分支复杂，可调整结构
        return ConditionText(node.condition) + "，" + true_text + "否则，" + false_text
```

最终生成一段连贯的条件判断段落，确保每个“如果”都有对应的“否则”收尾。为了提升可读性，可以限制嵌套深度，将深层规则拆分成编号列表，但基本的嵌套文本已足够用于语音沟通。

## 8. 序列号奇偶的整合

序列号是一个与线束本身无关的外部输入，必须由操作员查看并告知专家。在生成框架中，它只是一个额外的布尔变量，处理方法如下：

- 在约束状态空间中加入 `serial_odd` 维度。
- 当条件涉及序列号时（如 `serial_odd == true`），划分的有效性检查会对两种奇偶情况分别处理，并确保两个分支均有解。
- 在生成线束实例时，也随机产生一个序列号奇偶值，并显示在操作员界面上。
- 手册的规则文本中会自然出现序列号的条件语句。

## 9. 性能与扩展性

### 9.1 性能

在 `N=6, C=5` 的典型配置下，状态总数约 1000 个，单次 `HasSolution` 调用耗时不超过 1ms。整棵决策树生成（包含数十次调用）可在 100ms 内完成，完全适合网页端实时生成。

### 9.2 扩展更多条件类型

框架支持任意可形式化为计数/位置约束的条件。例如：
- “前两根线颜色相同”
- “存在至少一种颜色出现两次以上”
- “红蓝相邻”

只需实现对应的约束收缩逻辑和否定形式，并纳入条件池即可。更复杂的条件可能需要定制求解器，但 DP 的灵活性足以覆盖大多数实用场景。

### 9.3 多谜题类型

虽然本笔记聚焦于剪线模块，但该“约束空间划分 + 动作可行性验证”的生成范式可迁移至其他基于规则的合作解谜（如按钮序列、信号调制等），只需更换条件池与动作模板。

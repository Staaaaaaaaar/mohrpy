# mohrpy

`mohrpy` 是一个轻量级 Python 工具包，用于 2D / 3D Mohr 圆分析与应力参数处理。
当前版本使用 `numpy` 进行张量表示与主应力特征值求解。

**在线交互演示：<https://staaaaaaaaar.github.io/mohrpy/>**

网页支持实时输入应力分量、调整 2D 法向角或 3D 方位角/俯仰角、查看斜截面应力，并将图形导出为 SVG 或 PNG。浏览器版本位于 [`web/`](web/)，其公式和符号约定与 Python 包保持一致。

## 功能概览

- 封装 2D 平面应力状态 `StressState2D` 与 `MohrCircle2D`
- 封装 3D 应力状态 `StressState3D` 与 `MohrCircle3D`
- 基于应力参数初始化，计算：
  - 主应力（2D: $\sigma_1, \sigma_2$；3D: $\sigma_1, \sigma_2, \sigma_3$）
  - 最大剪应力
  - 2D 单圆 `(center, radius)`
  - 3D 三圆 `((c12,r12), (c23,r23), (c13,r13))`
  - 3D 应力不变量 $I_1, I_2, I_3$
- 可视化绘图（二维直角坐标系）：
  - 横轴：正应力 `sigma`
  - 纵轴：剪应力 `tau`
  - 2D：绘制单 Mohr 圆，并标注主应力点
  - 3D：绘制三个 Mohr 圆，并标注主应力点
- 支持按法向方向计算斜截面应力：
  - Python API：支持向量或弧度角输入
  - Web 界面：角度控件使用度数输入

## 安装

从 PyPI 安装：

```bash
pip install mohrpy
```

开发模式下在项目根目录执行：

```bash
pip install -e .
```

### Web 界面本地开发

需要 Node.js 22 或更高版本：

```bash
cd web
npm install
npm run dev
```

生产构建使用 `npm run build`，输出位于 `web/dist/`。合并到 `main` 后，[GitHub Pages workflow](.github/workflows/pages.yml) 会自动运行前端测试、构建并部署网站。

## 快速开始

### 2D 示例

```python
from mohrpy import StressState2D, MohrCircle2D

state = StressState2D(sigma_x=80, sigma_y=20, tau_xy=30)
circle = MohrCircle2D(state)

print("tensor:\n", state.tensor)
print("principal stresses:", state.principal_stresses)
print("max shear:", state.max_shear_stress)
print("circle (center, radius):", circle.circle)
```

### 3D 示例

```python
from mohrpy import StressState3D, MohrCircle3D

state = StressState3D(
    sigma_x=80,
    sigma_y=50,
    sigma_z=20,
    tau_xy=10,
    tau_yz=5,
    tau_zx=0,
)
circle = MohrCircle3D(state)

print("tensor:\n", state.tensor)
print("invariants:", state.invariants)
print("principal:", state.principal_stresses)
print("max shear:", state.max_shear_stress)
print("circles (c,r):", circle.circles)  # (12), (23), (13)
```

## API 说明

- `StressState2D(sigma_x, sigma_y, tau_xy)`
  - `.tensor`
  - `.principal_stresses -> tuple[float, float]`
  - `.max_shear_stress`
  - `.stress_on(normal: PlaneNormal2D) -> (sigma_n, tau)`
- `PlaneNormal2D(nx, ny)`
  - `.from_vector(x, y)`
  - `.from_angle(angle_rad)`
  - `.vector / .angle`
- `MohrCircle2D(state)`
  - `.circle -> (center, radius)`
  - `.plot(normal=None, ax=None, show=True, annotate=True)`

- `StressState3D(sigma_x, sigma_y, sigma_z, tau_xy, tau_yz, tau_zx)`
  - `.tensor`
  - `.invariants -> tuple[I1, I2, I3]`
  - `.principal_stresses -> (sigma_1, sigma_2, sigma_3)`
  - `.max_shear_stress`
  - `.stress_on(normal: PlaneNormal3D) -> (sigma_n, tau)`
- `PlaneNormal3D(nx, ny, nz)`
  - `.from_vector(x, y, z)`
  - `.from_angles(azimuth_rad, elevation_rad)`
  - `.vector / .azimuth / .elevation`
- `MohrCircle3D(state)`
  - `.circles -> ((c12, r12), (c23, r23), (c13, r13))`
  - `.plot(normal=None, ax=None, show=True, annotate=True)`

## 斜截面应力示例

### 2D 法向输入（向量/角度）

```python
import numpy as np

from mohrpy import PlaneNormal2D, StressState2D

state = StressState2D(80, 20, 30)

n_vec = PlaneNormal2D.from_vector(1, 1)
sigma_n, tau = state.stress_on(n_vec)
print("2D by vector:", sigma_n, tau)

n_ang = PlaneNormal2D.from_angle(np.deg2rad(30))
sigma_n, tau = state.stress_on(n_ang)
print("2D by angle:", sigma_n, tau)
```

### 3D 法向输入（向量/方位角+俯仰角）

```python
import numpy as np

from mohrpy import PlaneNormal3D, StressState3D

state = StressState3D(80, 50, 20, 10, 5, 0)

n_vec = PlaneNormal3D.from_vector(1, 1, 1)
sigma_n, tau = state.stress_on(n_vec)
print("3D by vector:", sigma_n, tau)

n_ang = PlaneNormal3D.from_angles(np.deg2rad(45), np.deg2rad(20))
sigma_n, tau = state.stress_on(n_ang)
print("3D by angles:", sigma_n, tau)
```

## 可视化示例

### 2D 单圆

```python
from mohrpy import StressState2D, MohrCircle2D

state = StressState2D(sigma_x=80, sigma_y=20, tau_xy=30)
circle = MohrCircle2D(state)
circle.plot()  # 显示 2D Mohr 圆与主应力点/数值标签

import numpy as np
from mohrpy import PlaneNormal2D
normal = PlaneNormal2D.from_angle(np.deg2rad(30))
circle.plot(normal=normal)  # 额外显示该法向对应的应力点
```

### 3D 三圆

```python
from mohrpy import StressState3D, MohrCircle3D

state = StressState3D(
    sigma_x=80,
    sigma_y=50,
    sigma_z=20,
    tau_xy=10,
    tau_yz=5,
    tau_zx=0,
)
circle = MohrCircle3D(state)
circle.plot()  # 显示 3D Mohr 三圆与主应力点/数值标签

import numpy as np
from mohrpy import PlaneNormal3D
normal = PlaneNormal3D.from_angles(np.deg2rad(45), np.deg2rad(20))
circle.plot(normal=normal)  # 额外显示该法向对应的应力点
```

## 数学约定

- 应力正号采用拉应力为正。
- 所有应力分量必须使用相同单位；库和网页均不执行单位换算。
- 2D `PlaneNormal2D.from_angle()` 与 3D `PlaneNormal3D.from_angles()` 接收弧度；网页滑块使用度数并在内部换算。
- 2D `stress_on()` 返回相对法向逆时针切向的有符号剪应力；2D `.max_shear_stress` 是面内最大剪应力。
- 3D `stress_on()` 的第二个返回值是剪应力向量的模长，因此始终大于或等于零。一般截面点位于 $\sigma_1$–$\sigma_3$ 外圆内部，不一定落在某个圆周上。
- 3D 主应力按降序返回：$\sigma_1 \ge \sigma_2 \ge \sigma_3$。

## 测试

Python：

```bash
pytest
```

Web：

```bash
cd web
npm test
npm run lint
npm run build
```

## 后续可扩展方向

- [x] 增加 Mohr Circle 2D / 3D 的可视化模块
- [x] 计算任意斜截面的正应力和剪应力
- [x] 增加 GitHub Pages 交互式 2D / 3D Mohr 圆
- [ ] 计算 2D/3D 主应力方向
- [ ] 增加 Tresca / von Mises 等效应力计算
- [ ] 增加破坏准则（Mohr-Coulomb / Drucker-Prager）
- [ ] 增加命令行接口（CLI）

## 许可证

MIT，详见 [LICENSE](LICENSE)。

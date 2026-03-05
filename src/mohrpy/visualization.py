from __future__ import annotations

from typing import Optional

import numpy as np

from .mohr2d import MohrCircle2D
from .mohr3d import MohrCircle3D


def _base_axes(ax):
    ax.axhline(0.0, color="0.4", linewidth=0.8)
    ax.axvline(0.0, color="0.4", linewidth=0.8)
    ax.grid(True, linestyle="--", linewidth=0.6, alpha=0.5)
    ax.set_xlabel("Normal stress (sigma)")
    ax.set_ylabel("Shear stress (tau)")


def plot_mohr_circle_2d(
    circle: MohrCircle2D,
    ax: Optional[object] = None,
    show: bool = True,
    annotate: bool = True,
):
    import matplotlib.pyplot as plt

    if ax is None:
        _, ax = plt.subplots(figsize=(6, 6))

    center, radius = circle.circle
    theta = np.linspace(0.0, 2.0 * np.pi, 400)

    x = center + radius * np.cos(theta)
    y = radius * np.sin(theta)

    ax.plot(x, y, color="tab:blue", linewidth=2.0, label="Mohr circle")

    sx = circle.state.sigma_x
    sy = circle.state.sigma_y
    txy = circle.state.tau_xy
    points = np.array([[sx, txy], [sy, -txy]], dtype=float)
    ax.scatter(points[:, 0], points[:, 1], color="tab:red", zorder=3, label="State points")

    if annotate:
        ax.annotate("(sigma_x, tau_xy)", (sx, txy), xytext=(6, 6), textcoords="offset points")
        ax.annotate("(sigma_y, -tau_xy)", (sy, -txy), xytext=(6, -12), textcoords="offset points")

    _base_axes(ax)
    ax.set_aspect("equal", adjustable="box")
    ax.set_title("Mohr Circle (2D)")
    ax.legend(loc="best")

    if show:
        plt.show()
    return ax


def plot_mohr_circle_3d(
    circle: MohrCircle3D,
    ax: Optional[object] = None,
    show: bool = True,
    annotate: bool = True,
):
    import matplotlib.pyplot as plt

    if ax is None:
        _, ax = plt.subplots(figsize=(7, 6))

    theta = np.linspace(0.0, 2.0 * np.pi, 400)
    circles = circle.circles
    specs = [
        (circles[0], "tab:orange", "Circle 1-2"),
        (circles[1], "tab:green", "Circle 2-3"),
        (circles[2], "tab:blue", "Circle 1-3"),
    ]

    for (center, radius), color, label in specs:
        x = center + radius * np.cos(theta)
        y = radius * np.sin(theta)
        ax.plot(x, y, color=color, linewidth=2.0, label=label)

    sx = circle.state.sigma_x
    sy = circle.state.sigma_y
    sz = circle.state.sigma_z
    txy = circle.state.tau_xy
    tyz = circle.state.tau_yz
    tzx = circle.state.tau_zx

    state_points = {
        "(sigma_x, tau_xy)": (sx, txy),
        "(sigma_y, -tau_xy)": (sy, -txy),
        "(sigma_y, tau_yz)": (sy, tyz),
        "(sigma_z, -tau_yz)": (sz, -tyz),
        "(sigma_z, tau_zx)": (sz, tzx),
        "(sigma_x, -tau_zx)": (sx, -tzx),
    }

    px = np.array([p[0] for p in state_points.values()], dtype=float)
    py = np.array([p[1] for p in state_points.values()], dtype=float)
    ax.scatter(px, py, color="tab:red", s=24, zorder=4, label="State points")

    if annotate:
        for label, (xv, yv) in state_points.items():
            ax.annotate(label, (xv, yv), xytext=(5, 5), textcoords="offset points", fontsize=8)

    _base_axes(ax)
    ax.set_aspect("equal", adjustable="box")
    ax.set_title("Mohr Circles (3D)")
    ax.legend(loc="best")

    if show:
        plt.show()
    return ax
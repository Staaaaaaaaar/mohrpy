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


def _corner_text(ax, text: str):
    ax.text(
        0.02,
        0.98,
        text,
        transform=ax.transAxes,
        va="top",
        ha="left",
        fontsize=9,
        bbox={"boxstyle": "round", "facecolor": "white", "alpha": 0.85, "edgecolor": "0.6"},
    )


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

    if annotate:
        s1, s2 = circle.state.principal_stresses
        # Principal stresses lie on the sigma-axis where tau = 0.
        ax.scatter([s1, s2], [0.0, 0.0], color="tab:red", s=40, zorder=4, label="Principal stresses")
        ax.annotate("sigma1", (s1, 0.0), xytext=(6, 8), textcoords="offset points", fontsize=9)
        ax.annotate("sigma2", (s2, 0.0), xytext=(6, -12), textcoords="offset points", fontsize=9)
        _corner_text(ax, f"sigma1 = {s1:.3f}\nsigma2 = {s2:.3f}")

    _base_axes(ax)
    ax.set_aspect("equal", adjustable="datalim")
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

    if annotate:
        s1, s2, s3 = circle.state.principal_stresses
        # Principal stresses are x-intercepts in Mohr space.
        ax.scatter([s1, s2, s3], [0.0, 0.0, 0.0], color="tab:red", s=40, zorder=4, label="Principal stresses")
        ax.annotate("sigma1", (s1, 0.0), xytext=(6, 8), textcoords="offset points", fontsize=9)
        ax.annotate("sigma2", (s2, 0.0), xytext=(6, -12), textcoords="offset points", fontsize=9)
        ax.annotate("sigma3", (s3, 0.0), xytext=(6, 8), textcoords="offset points", fontsize=9)
        _corner_text(ax, f"sigma1 = {s1:.3f}\nsigma2 = {s2:.3f}\nsigma3 = {s3:.3f}")
    
    _base_axes(ax)
    ax.set_aspect("equal", adjustable="datalim")
    ax.set_title("Mohr Circles (3D)")
    ax.legend(loc="best")

    if show:
        plt.show()
    return ax
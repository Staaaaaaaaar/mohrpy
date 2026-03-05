from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Tuple

import numpy as np


@dataclass(frozen=True)
class PlaneNormal2D:
    nx: float
    ny: float

    def __post_init__(self):
        mag = float(np.hypot(self.nx, self.ny))
        if mag == 0.0:
            raise ValueError("2D normal direction cannot be zero.")
        object.__setattr__(self, "nx", float(self.nx / mag))
        object.__setattr__(self, "ny", float(self.ny / mag))

    @classmethod
    def from_vector(cls, x: float, y: float) -> "PlaneNormal2D":
        return cls(nx=x, ny=y)

    @classmethod
    def from_angle_rad(cls, angle_rad: float) -> "PlaneNormal2D":
        return cls(nx=math.cos(angle_rad), ny=math.sin(angle_rad))

    @classmethod
    def from_angle_deg(cls, angle_deg: float) -> "PlaneNormal2D":
        return cls.from_angle_rad(math.radians(angle_deg))

    @property
    def vector(self) -> np.ndarray:
        return np.array([self.nx, self.ny], dtype=float)

    @property
    def angle_rad(self) -> float:
        return float(math.atan2(self.ny, self.nx))

    @property
    def angle_deg(self) -> float:
        return float(math.degrees(self.angle_rad))


@dataclass(frozen=True)
class StressState2D:
    sigma_x: float
    sigma_y: float
    tau_xy: float

    @property
    def tensor(self) -> np.ndarray:
        return np.array(
            [[self.sigma_x, self.tau_xy], [self.tau_xy, self.sigma_y]],
            dtype=float,
        )

    @property
    def principal_stresses(self) -> Tuple[float, float]:
        eigvals = np.linalg.eigvalsh(self.tensor)
        s1, s2 = eigvals[::-1]
        return float(s1), float(s2)

    @property
    def max_shear_stress(self) -> float:
        s1, s2 = self.principal_stresses
        return 0.5 * (s1 - s2)

    def stress_on(self, normal: PlaneNormal2D) -> Tuple[float, float]:
        """Return (normal_stress, shear_stress) on the plane with the given unit normal."""

        n = normal.vector
        t = self.tensor @ n
        sigma_n = float(n @ t)

        # Tangent direction is 90-degree CCW from normal.
        m = np.array([-normal.ny, normal.nx], dtype=float)
        tau = float(m @ t)
        return sigma_n, tau


@dataclass(frozen=True)
class MohrCircle2D:
    state: StressState2D

    @property
    def circle(self) -> Tuple[float, float]:
        center = 0.5 * (self.state.sigma_x + self.state.sigma_y)
        radius = float(np.hypot(0.5 * (self.state.sigma_x - self.state.sigma_y), self.state.tau_xy))
        return float(center), radius

    def plot(self, normal: PlaneNormal2D | None = None, ax=None, show: bool = True, annotate: bool = True):
        from .visualization import plot_mohr_circle_2d

        return plot_mohr_circle_2d(self, normal=normal, ax=ax, show=show, annotate=annotate)
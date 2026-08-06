from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

from ._validation import finite_float, normalized_components


@dataclass(frozen=True)
class PlaneNormal2D:
    nx: float
    ny: float

    def __post_init__(self):
        nx, ny = normalized_components(
            (self.nx, self.ny),
            ("nx", "ny"),
            "2D normal",
        )
        object.__setattr__(self, "nx", nx)
        object.__setattr__(self, "ny", ny)

    @classmethod
    def from_vector(cls, x: float, y: float) -> PlaneNormal2D:
        return cls(nx=x, ny=y)

    @classmethod
    def from_angle(cls, angle_rad: float) -> PlaneNormal2D:
        angle_rad = finite_float(angle_rad, "angle_rad")
        return cls(nx=math.cos(angle_rad), ny=math.sin(angle_rad))

    @property
    def vector(self) -> np.ndarray:
        return np.array([self.nx, self.ny], dtype=float)

    @property
    def angle(self) -> float:
        return float(math.atan2(self.ny, self.nx))


@dataclass(frozen=True)
class StressState2D:
    sigma_x: float
    sigma_y: float
    tau_xy: float

    def __post_init__(self):
        for name in ("sigma_x", "sigma_y", "tau_xy"):
            object.__setattr__(self, name, finite_float(getattr(self, name), name))

    @property
    def _circle_parameters(self) -> tuple[float, float]:
        center = self.sigma_x / 2.0 + self.sigma_y / 2.0
        half_difference = self.sigma_x / 2.0 - self.sigma_y / 2.0
        radius = math.hypot(half_difference, self.tau_xy)
        return center, radius

    @property
    def tensor(self) -> np.ndarray:
        return np.array(
            [[self.sigma_x, self.tau_xy], [self.tau_xy, self.sigma_y]],
            dtype=float,
        )

    @property
    def principal_stresses(self) -> tuple[float, float]:
        center, radius = self._circle_parameters
        return center + radius, center - radius

    @property
    def max_shear_stress(self) -> float:
        """Return the maximum in-plane shear stress."""

        return self.max_in_plane_shear_stress

    @property
    def max_in_plane_shear_stress(self) -> float:
        return self._circle_parameters[1]

    def stress_on(self, normal: PlaneNormal2D) -> tuple[float, float]:
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
    def circle(self) -> tuple[float, float]:
        return self.state._circle_parameters

    def plot(
        self,
        normal: PlaneNormal2D | None = None,
        ax=None,
        show: bool = False,
        annotate: bool = True,
    ):
        from .visualization import plot_mohr_circle_2d

        return plot_mohr_circle_2d(self, normal=normal, ax=ax, show=show, annotate=annotate)

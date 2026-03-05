from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Tuple

import numpy as np


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
    def principal_angle_rad(self) -> float:
        return 0.5 * math.atan2(2.0 * self.tau_xy, self.sigma_x - self.sigma_y)

    @property
    def principal_angle_deg(self) -> float:
        return math.degrees(self.principal_angle_rad)

    @property
    def max_shear_stress(self) -> float:
        s1, s2 = self.principal_stresses
        return 0.5 * (s1 - s2)


@dataclass(frozen=True)
class MohrCircle2D:
    state: StressState2D

    @property
    def circle(self) -> Tuple[float, float]:
        center = 0.5 * (self.state.sigma_x + self.state.sigma_y)
        radius = float(np.hypot(0.5 * (self.state.sigma_x - self.state.sigma_y), self.state.tau_xy))
        return float(center), radius
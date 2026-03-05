from __future__ import annotations

from dataclasses import dataclass
from typing import Tuple

import numpy as np


@dataclass(frozen=True)
class StressState3D:
    sigma_x: float
    sigma_y: float
    sigma_z: float
    tau_xy: float
    tau_yz: float
    tau_zx: float

    @property
    def tensor(self) -> np.ndarray:
        return np.array(
            [
                [self.sigma_x, self.tau_xy, self.tau_zx],
                [self.tau_xy, self.sigma_y, self.tau_yz],
                [self.tau_zx, self.tau_yz, self.sigma_z],
            ],
            dtype=float,
        )

    @property
    def invariants(self) -> Tuple[float, float, float]:
        sx, sy, sz = self.sigma_x, self.sigma_y, self.sigma_z
        txy, tyz, tzx = self.tau_xy, self.tau_yz, self.tau_zx
        i1 = sx + sy + sz
        i2 = sx * sy + sy * sz + sz * sx - txy**2 - tyz**2 - tzx**2
        i3 = (
            sx * sy * sz
            + 2.0 * txy * tyz * tzx
            - sx * tyz**2
            - sy * tzx**2
            - sz * txy**2
        )
        return float(i1), float(i2), float(i3)

    @property
    def principal_stresses(self) -> Tuple[float, float, float]:
        eigvals = np.linalg.eigvalsh(self.tensor)
        s1, s2, s3 = eigvals[::-1]
        return float(s1), float(s2), float(s3)

    @property
    def max_shear_stress(self) -> float:
        s1, _, s3 = self.principal_stresses
        return 0.5 * (s1 - s3)


@dataclass(frozen=True)
class MohrCircle3D:
    state: StressState3D

    @property
    def circles(self) -> Tuple[Tuple[float, float], Tuple[float, float], Tuple[float, float]]:
        s1, s2, s3 = self.state.principal_stresses
        c12 = 0.5 * (s1 + s2)
        c23 = 0.5 * (s2 + s3)
        c13 = 0.5 * (s1 + s3)
        r12 = 0.5 * (s1 - s2)
        r23 = 0.5 * (s2 - s3)
        r13 = 0.5 * (s1 - s3)
        return (float(c12), float(r12)), (float(c23), float(r23)), (float(c13), float(r13))
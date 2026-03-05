from __future__ import annotations

from dataclasses import dataclass
from typing import Tuple

import numpy as np


@dataclass(frozen=True)
class PlaneNormal3D:
    nx: float
    ny: float
    nz: float

    def __post_init__(self):
        mag = float(np.linalg.norm([self.nx, self.ny, self.nz]))
        if mag == 0.0:
            raise ValueError("3D normal direction cannot be zero.")
        object.__setattr__(self, "nx", float(self.nx / mag))
        object.__setattr__(self, "ny", float(self.ny / mag))
        object.__setattr__(self, "nz", float(self.nz / mag))

    @classmethod
    def from_vector(cls, x: float, y: float, z: float) -> "PlaneNormal3D":
        return cls(nx=x, ny=y, nz=z)

    @classmethod
    def from_angles_rad(cls, azimuth_rad: float, elevation_rad: float) -> "PlaneNormal3D":
        """Create normal from azimuth/elevation angles.

        azimuth: angle in x-y plane from +x.
        elevation: angle from x-y plane toward +z.
        """

        ce = float(np.cos(elevation_rad))
        return cls(
            nx=ce * float(np.cos(azimuth_rad)),
            ny=ce * float(np.sin(azimuth_rad)),
            nz=float(np.sin(elevation_rad)),
        )

    @classmethod
    def from_angles_deg(cls, azimuth_deg: float, elevation_deg: float) -> "PlaneNormal3D":
        return cls.from_angles_rad(np.radians(azimuth_deg), np.radians(elevation_deg))

    @property
    def vector(self) -> np.ndarray:
        return np.array([self.nx, self.ny, self.nz], dtype=float)


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

    def stress_on(self, normal: PlaneNormal3D) -> Tuple[float, float]:
        """Return (normal_stress, shear_stress_magnitude) on the plane with the given unit normal."""

        n = normal.vector
        t = self.tensor @ n
        sigma_n = float(n @ t)
        shear_vec = t - sigma_n * n
        tau = float(np.linalg.norm(shear_vec))
        return sigma_n, tau


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

    def plot(self, normal: PlaneNormal3D | None = None, ax=None, show: bool = True, annotate: bool = True):
        from .visualization import plot_mohr_circle_3d

        return plot_mohr_circle_3d(self, normal=normal, ax=ax, show=show, annotate=annotate)
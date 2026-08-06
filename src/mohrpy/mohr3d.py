from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from ._validation import finite_float, normalized_components


@dataclass(frozen=True)
class PlaneNormal3D:
    nx: float
    ny: float
    nz: float

    def __post_init__(self):
        nx, ny, nz = normalized_components(
            (self.nx, self.ny, self.nz),
            ("nx", "ny", "nz"),
            "3D normal",
        )
        object.__setattr__(self, "nx", nx)
        object.__setattr__(self, "ny", ny)
        object.__setattr__(self, "nz", nz)

    @classmethod
    def from_vector(cls, x: float, y: float, z: float) -> PlaneNormal3D:
        return cls(nx=x, ny=y, nz=z)

    @classmethod
    def from_angles(cls, azimuth_rad: float, elevation_rad: float) -> PlaneNormal3D:
        """Create normal from azimuth/elevation angles.

        azimuth: angle in x-y plane from +x.
        elevation: angle toward +z.
        """

        azimuth_rad = finite_float(azimuth_rad, "azimuth_rad")
        elevation_rad = finite_float(elevation_rad, "elevation_rad")
        ce = float(np.cos(elevation_rad))
        return cls(
            nx=ce * float(np.cos(azimuth_rad)),
            ny=ce * float(np.sin(azimuth_rad)),
            nz=float(np.sin(elevation_rad)),
        )

    @property
    def vector(self) -> np.ndarray:
        return np.array([self.nx, self.ny, self.nz], dtype=float)

    @property
    def azimuth(self) -> float:
        return float(np.arctan2(self.ny, self.nx))

    @property
    def elevation(self) -> float:
        return float(np.arctan2(self.nz, np.hypot(self.nx, self.ny)))


@dataclass(frozen=True)
class StressState3D:
    sigma_x: float
    sigma_y: float
    sigma_z: float
    tau_xy: float
    tau_yz: float
    tau_zx: float

    def __post_init__(self):
        for name in (
            "sigma_x",
            "sigma_y",
            "sigma_z",
            "tau_xy",
            "tau_yz",
            "tau_zx",
        ):
            object.__setattr__(self, name, finite_float(getattr(self, name), name))

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
    def invariants(self) -> tuple[float, float, float]:
        sx, sy, sz = self.sigma_x, self.sigma_y, self.sigma_z
        txy, tyz, tzx = self.tau_xy, self.tau_yz, self.tau_zx
        i1 = sx + sy + sz
        i2 = sx * sy + sy * sz + sz * sx - txy**2 - tyz**2 - tzx**2
        i3 = sx * sy * sz + 2.0 * txy * tyz * tzx - sx * tyz**2 - sy * tzx**2 - sz * txy**2
        return float(i1), float(i2), float(i3)

    @property
    def principal_stresses(self) -> tuple[float, float, float]:
        tensor = self.tensor
        scale = float(np.max(np.abs(tensor)))
        if scale == 0.0:
            return 0.0, 0.0, 0.0
        eigvals = np.linalg.eigvalsh(tensor / scale) * scale
        s1, s2, s3 = eigvals[::-1]
        return float(s1), float(s2), float(s3)

    @property
    def max_shear_stress(self) -> float:
        s1, _, s3 = self.principal_stresses
        return 0.5 * (s1 - s3)

    def stress_on(self, normal: PlaneNormal3D) -> tuple[float, float]:
        """Return normal stress and shear-stress magnitude on a plane."""

        sigma_n, shear_vec = self.traction_on(normal)
        return sigma_n, float(np.linalg.norm(shear_vec))

    def traction_on(self, normal: PlaneNormal3D) -> tuple[float, np.ndarray]:
        """Return normal stress and the in-plane shear vector for a plane."""

        n = normal.vector
        t = self.tensor @ n
        sigma_n = float(n @ t)
        shear_vec = t - sigma_n * n
        shear_magnitude = float(np.linalg.norm(shear_vec))
        traction_scale = float(np.linalg.norm(t))
        if shear_magnitude <= 8.0 * np.finfo(float).eps * traction_scale:
            shear_vec = np.zeros(3, dtype=float)
        return sigma_n, shear_vec


@dataclass(frozen=True)
class MohrCircle3D:
    state: StressState3D

    @property
    def circles(self) -> tuple[tuple[float, float], tuple[float, float], tuple[float, float]]:
        s1, s2, s3 = self.state.principal_stresses
        c12 = s1 / 2.0 + s2 / 2.0
        c23 = s2 / 2.0 + s3 / 2.0
        c13 = s1 / 2.0 + s3 / 2.0
        r12 = s1 / 2.0 - s2 / 2.0
        r23 = s2 / 2.0 - s3 / 2.0
        r13 = s1 / 2.0 - s3 / 2.0
        return (float(c12), float(r12)), (float(c23), float(r23)), (float(c13), float(r13))

    def plot(
        self,
        normal: PlaneNormal3D | None = None,
        ax=None,
        show: bool = False,
        annotate: bool = True,
    ):
        from .visualization import plot_mohr_circle_3d

        return plot_mohr_circle_3d(self, normal=normal, ax=ax, show=show, annotate=annotate)

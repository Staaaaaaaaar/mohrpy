"""mohrpy: 2D/3D Mohr circle analysis utilities."""

from importlib.metadata import PackageNotFoundError, version

from .mohr2d import MohrCircle2D, PlaneNormal2D, StressState2D
from .mohr3d import MohrCircle3D, PlaneNormal3D, StressState3D
from .visualization import plot_mohr_circle_2d, plot_mohr_circle_3d

try:
    __version__ = version("mohrpy")
except PackageNotFoundError:
    __version__ = "0.1.0"

__all__ = [
    "__version__",
    "StressState2D",
    "StressState3D",
    "PlaneNormal2D",
    "PlaneNormal3D",
    "MohrCircle2D",
    "MohrCircle3D",
    "plot_mohr_circle_2d",
    "plot_mohr_circle_3d",
]

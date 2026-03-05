import pytest

matplotlib = pytest.importorskip("matplotlib")
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from mohrpy import MohrCircle2D, MohrCircle3D, PlaneNormal2D, PlaneNormal3D, StressState2D, StressState3D


def test_plot_2d_smoke():
    state = StressState2D(sigma_x=80.0, sigma_y=20.0, tau_xy=30.0)
    circle = MohrCircle2D(state)
    ax = circle.plot(show=False, annotate=False)

    assert ax.get_xlabel() == "Normal stress (sigma)"
    assert ax.get_ylabel() == "Shear stress (tau)"
    plt.close(ax.figure)


def test_plot_2d_with_normal_smoke():
    state = StressState2D(sigma_x=80.0, sigma_y=20.0, tau_xy=30.0)
    circle = MohrCircle2D(state)
    normal = PlaneNormal2D.from_angle_deg(30.0)
    ax = circle.plot(normal=normal, show=False, annotate=True)

    assert ax.get_xlabel() == "Normal stress (sigma)"
    assert ax.get_ylabel() == "Shear stress (tau)"
    plt.close(ax.figure)


def test_plot_3d_smoke():
    state = StressState3D(
        sigma_x=80.0,
        sigma_y=50.0,
        sigma_z=20.0,
        tau_xy=10.0,
        tau_yz=5.0,
        tau_zx=0.0,
    )
    circle = MohrCircle3D(state)
    ax = circle.plot(show=False, annotate=False)

    assert ax.get_xlabel() == "Normal stress (sigma)"
    assert ax.get_ylabel() == "Shear stress (tau)"
    plt.close(ax.figure)


def test_plot_3d_with_normal_smoke():
    state = StressState3D(
        sigma_x=80.0,
        sigma_y=50.0,
        sigma_z=20.0,
        tau_xy=10.0,
        tau_yz=5.0,
        tau_zx=0.0,
    )
    circle = MohrCircle3D(state)
    normal = PlaneNormal3D.from_angles_deg(45.0, 20.0)
    ax = circle.plot(normal=normal, show=False, annotate=True)

    assert ax.get_xlabel() == "Normal stress (sigma)"
    assert ax.get_ylabel() == "Shear stress (tau)"
    plt.close(ax.figure)
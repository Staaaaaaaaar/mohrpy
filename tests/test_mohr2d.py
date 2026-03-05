import math
import numpy as np

from mohrpy import MohrCircle2D, PlaneNormal2D, StressState2D


def test_stress_state_2d_properties():
    state = StressState2D(sigma_x=80.0, sigma_y=20.0, tau_xy=30.0)

    tensor = state.tensor
    assert isinstance(tensor, np.ndarray)
    assert tensor.shape == (2, 2)

    s1, s2 = state.principal_stresses
    assert math.isclose(s1, 92.4264068712, rel_tol=1e-9)
    assert math.isclose(s2, 7.5735931288, rel_tol=1e-9)
    assert math.isclose(state.max_shear_stress, 42.4264068712, rel_tol=1e-9)


def test_mohr2d_circle():
    state = StressState2D(sigma_x=80.0, sigma_y=20.0, tau_xy=30.0)
    circle = MohrCircle2D(state)
    center, radius = circle.circle
    assert math.isclose(center, 50.0, rel_tol=1e-9)
    assert math.isclose(radius, 42.4264068712, rel_tol=1e-9)


def test_plane_normal_2d_builders_and_stress_projection():
    n1 = PlaneNormal2D.from_vector(3.0, 4.0)
    assert math.isclose(float(np.linalg.norm(n1.vector)), 1.0, rel_tol=1e-9)

    n2 = PlaneNormal2D.from_angle(math.pi / 2.0)
    assert math.isclose(n2.nx, 0.0, abs_tol=1e-12)
    assert math.isclose(n2.ny, 1.0, rel_tol=1e-9)
    assert math.isclose(n2.angle, math.pi / 2.0, rel_tol=1e-9)

    state = StressState2D(sigma_x=80.0, sigma_y=20.0, tau_xy=30.0)
    sigma_n_x, tau_x = state.stress_on(PlaneNormal2D.from_angle(0.0))
    assert math.isclose(sigma_n_x, 80.0, rel_tol=1e-9)
    assert math.isclose(tau_x, 30.0, rel_tol=1e-9)

    sigma_n_y, tau_y = state.stress_on(PlaneNormal2D.from_angle(math.pi / 2.0))
    assert math.isclose(sigma_n_y, 20.0, rel_tol=1e-9)
    assert math.isclose(tau_y, -30.0, rel_tol=1e-9)

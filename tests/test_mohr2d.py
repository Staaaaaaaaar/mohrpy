import math
import numpy as np

from mohrpy import MohrCircle2D, StressState2D


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


def test_stress_state_2d_principal_angle():
    state = StressState2D(sigma_x=100.0, sigma_y=40.0, tau_xy=20.0)
    expected = 0.5 * math.atan2(40.0, 60.0)
    assert math.isclose(state.principal_angle_rad, expected, rel_tol=1e-9)
    assert math.isclose(state.principal_angle_deg, math.degrees(expected), rel_tol=1e-9)

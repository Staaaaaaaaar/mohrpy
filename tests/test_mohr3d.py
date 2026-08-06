import math

import numpy as np
import pytest

from mohrpy import MohrCircle3D, PlaneNormal3D, StressState3D


def test_stress_state_3d_principal_stresses_and_tensor():
    state = StressState3D(
        sigma_x=120.0,
        sigma_y=90.0,
        sigma_z=30.0,
        tau_xy=0.0,
        tau_yz=0.0,
        tau_zx=0.0,
    )
    tensor = state.tensor
    assert isinstance(tensor, np.ndarray)
    assert tensor.shape == (3, 3)

    s1, s2, s3 = state.principal_stresses
    assert math.isclose(s1, 120.0, rel_tol=1e-9)
    assert math.isclose(s2, 90.0, rel_tol=1e-9)
    assert math.isclose(s3, 30.0, rel_tol=1e-9)
    assert math.isclose(state.max_shear_stress, 45.0, rel_tol=1e-9)


def test_stress_state_3d_invariants():
    state = StressState3D(
        sigma_x=80.0,
        sigma_y=50.0,
        sigma_z=20.0,
        tau_xy=10.0,
        tau_yz=5.0,
        tau_zx=0.0,
    )

    i1, i2, i3 = state.invariants
    assert math.isclose(i1, 150.0, rel_tol=1e-9)
    assert math.isclose(i2, 6475.0, rel_tol=1e-9)
    assert math.isclose(i3, 76000.0, rel_tol=1e-9)


def test_mohr3d_circles_from_state_principals():
    state = StressState3D(
        sigma_x=80.0,
        sigma_y=50.0,
        sigma_z=20.0,
        tau_xy=10.0,
        tau_yz=5.0,
        tau_zx=0.0,
    )
    circle = MohrCircle3D(state)

    c12, c23, c13 = circle.circles
    s1, s2, s3 = state.principal_stresses
    assert c12 == pytest.approx((s1 / 2.0 + s2 / 2.0, s1 / 2.0 - s2 / 2.0))
    assert c23 == pytest.approx((s2 / 2.0 + s3 / 2.0, s2 / 2.0 - s3 / 2.0))
    assert c13 == pytest.approx((s1 / 2.0 + s3 / 2.0, s1 / 2.0 - s3 / 2.0))
    assert c13[1] >= c12[1] >= 0.0
    assert c13[1] >= c23[1] >= 0.0


def test_plane_normal_3d_builders_and_stress_projection():
    n1 = PlaneNormal3D.from_vector(2.0, 0.0, 0.0)
    assert math.isclose(float(np.linalg.norm(n1.vector)), 1.0, rel_tol=1e-9)
    assert math.isclose(n1.nx, 1.0, rel_tol=1e-9)

    n2 = PlaneNormal3D.from_angles(0.0, 0.0)
    assert math.isclose(n2.nx, 1.0, rel_tol=1e-9)
    assert math.isclose(n2.ny, 0.0, abs_tol=1e-12)
    assert math.isclose(n2.nz, 0.0, abs_tol=1e-12)
    assert math.isclose(n2.azimuth, 0.0, abs_tol=1e-12)
    assert math.isclose(n2.elevation, 0.0, abs_tol=1e-12)

    state = StressState3D(
        sigma_x=80.0,
        sigma_y=50.0,
        sigma_z=20.0,
        tau_xy=10.0,
        tau_yz=5.0,
        tau_zx=0.0,
    )
    sigma_n, tau = state.stress_on(PlaneNormal3D.from_vector(1.0, 0.0, 0.0))
    assert math.isclose(sigma_n, 80.0, rel_tol=1e-9)
    assert math.isclose(tau, 10.0, rel_tol=1e-9)

    sigma_n, shear_vector = state.traction_on(PlaneNormal3D.from_vector(1.0, 0.0, 0.0))
    assert math.isclose(sigma_n, 80.0, rel_tol=1e-9)
    assert shear_vector == pytest.approx((0.0, 10.0, 0.0))


@pytest.mark.parametrize("value", [math.nan, math.inf, -math.inf])
def test_stress_state_3d_rejects_non_finite_values(value):
    with pytest.raises(ValueError, match="finite"):
        StressState3D(value, 50.0, 20.0, 10.0, 5.0, 0.0)


@pytest.mark.parametrize(
    "components",
    [(0.0, 0.0, 0.0), (math.nan, 1.0, 0.0)],
)
def test_plane_normal_3d_rejects_invalid_directions(components):
    with pytest.raises(ValueError):
        PlaneNormal3D.from_vector(*components)


def test_plane_normal_3d_normalizes_large_values():
    normal = PlaneNormal3D.from_vector(1e308, 1e308, 1e308)
    assert math.isclose(float(np.linalg.norm(normal.vector)), 1.0, rel_tol=1e-15)


def test_plane_normal_3d_normalizes_subnormal_values():
    normal = PlaneNormal3D.from_vector(5e-324, 5e-324, 5e-324)
    assert math.isclose(float(np.linalg.norm(normal.vector)), 1.0, rel_tol=1e-15)


def test_hydrostatic_state_has_zero_shear_on_every_plane():
    state = StressState3D(42.0, 42.0, 42.0, 0.0, 0.0, 0.0)
    sigma_n, tau = state.stress_on(PlaneNormal3D.from_vector(1.0, 2.0, 3.0))
    assert math.isclose(sigma_n, 42.0, rel_tol=1e-15)
    assert tau == 0.0


def test_invariants_match_principal_stresses():
    state = StressState3D(80.0, 50.0, 20.0, 10.0, 5.0, -3.0)
    i1, i2, i3 = state.invariants
    s1, s2, s3 = state.principal_stresses

    assert i1 == pytest.approx(s1 + s2 + s3)
    assert i2 == pytest.approx(s1 * s2 + s2 * s3 + s3 * s1)
    assert i3 == pytest.approx(s1 * s2 * s3)

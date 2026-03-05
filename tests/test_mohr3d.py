import math
import numpy as np

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
    assert c13[1] >= c12[1] >= 0.0
    assert c13[1] >= c23[1] >= 0.0


def test_plane_normal_3d_builders_and_stress_projection():
    n1 = PlaneNormal3D.from_vector(2.0, 0.0, 0.0)
    assert math.isclose(float(np.linalg.norm(n1.vector)), 1.0, rel_tol=1e-9)
    assert math.isclose(n1.nx, 1.0, rel_tol=1e-9)

    n2 = PlaneNormal3D.from_angles_deg(0.0, 0.0)
    assert math.isclose(n2.nx, 1.0, rel_tol=1e-9)
    assert math.isclose(n2.ny, 0.0, abs_tol=1e-12)
    assert math.isclose(n2.nz, 0.0, abs_tol=1e-12)

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

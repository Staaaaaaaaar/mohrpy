from mohrpy import StressState2D, MohrCircle2D

state = StressState2D(sigma_x=80, sigma_y=20, tau_xy=30)
circle = MohrCircle2D(state)

print("tensor:\n", state.tensor)
print("principal stresses:", state.principal_stresses)
print("principal angle (deg):", state.principal_angle_deg)
print("max shear:", state.max_shear_stress)
print("circle (center, radius):", circle.circle)

from mohrpy import StressState3D, MohrCircle3D

state = StressState3D(
    sigma_x=80,
    sigma_y=50,
    sigma_z=20,
    tau_xy=10,
    tau_yz=5,
    tau_zx=0,
)
circle = MohrCircle3D(state)

print("================================")
print("tensor:\n", state.tensor)
print("invariants:", state.invariants)
print("principal:", state.principal_stresses)
print("max shear:", state.max_shear_stress)
print("circles (c,r):", circle.circles)  # (12), (23), (13)
from __future__ import annotations

import math
from collections.abc import Iterable


def finite_float(value: float, name: str) -> float:
    """Convert a scalar to float and reject non-finite values."""

    try:
        result = float(value)
    except (TypeError, ValueError) as exc:
        raise TypeError(f"{name} must be a real scalar.") from exc
    if not math.isfinite(result):
        raise ValueError(f"{name} must be finite.")
    return result


def normalized_components(
    values: Iterable[float],
    names: Iterable[str],
    direction_name: str,
) -> tuple[float, ...]:
    """Return robustly normalized finite components."""

    value_tuple = tuple(values)
    name_tuple = tuple(names)
    if len(value_tuple) != len(name_tuple):
        raise ValueError("Each vector component must have a name.")
    components = tuple(finite_float(value, name) for value, name in zip(value_tuple, name_tuple))
    scale = max(abs(value) for value in components)
    if scale == 0.0:
        raise ValueError(f"{direction_name} direction cannot be zero.")

    scaled = tuple(value / scale for value in components)
    magnitude = math.hypot(*scaled)
    normalized = tuple(value / magnitude for value in scaled)
    normalized_magnitude = math.hypot(*normalized)
    if not math.isclose(normalized_magnitude, 1.0, rel_tol=1e-15, abs_tol=1e-15):
        raise ValueError(f"{direction_name} direction could not be normalized reliably.")
    return normalized

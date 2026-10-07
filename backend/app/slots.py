"""Cupos del diagnóstico gratuito que se muestran en el sitio.

Empiezan en 4 de 10 disponibles; cada formulario recibido resta uno hasta 0
y el siguiente vuelve a empezar en 4.
"""

TOTAL_SLOTS = 10
STARTING_REMAINING = 4


def slots_for(submissions: int) -> dict:
    if submissions < 0:
        raise ValueError("El número de formularios no puede ser negativo")
    remaining = STARTING_REMAINING - submissions % (STARTING_REMAINING + 1)
    return {"remaining": remaining, "taken": TOTAL_SLOTS - remaining, "total": TOTAL_SLOTS}

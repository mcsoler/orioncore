from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.slots import slots_for


@pytest.mark.parametrize(
    "submissions, remaining",
    [(0, 4), (1, 3), (2, 2), (3, 1), (4, 0), (5, 4), (6, 3), (9, 0), (10, 4)],
)
def test_quedan_4_cupos_cada_formulario_resta_uno_y_despues_de_0_vuelve_a_4(submissions, remaining):
    slots = slots_for(submissions)
    assert slots == {"remaining": remaining, "taken": 10 - remaining, "total": 10}


def test_rechaza_un_numero_negativo_de_formularios():
    with pytest.raises(ValueError):
        slots_for(-1)


def test_get_api_slots_usa_el_numero_de_contactos_guardados(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "x" * 40)
    monkeypatch.setenv("ADMIN_PASSWORD", "clave-de-prueba-123")
    collection = AsyncMock()
    collection.count_documents.return_value = 6

    with patch("app.routes.slots.get_contacts_collection", AsyncMock(return_value=collection)):
        from app.main import app

        with TestClient(app) as client:
            response = client.get("/api/slots")

    assert response.status_code == 200
    assert response.json() == {"remaining": 3, "taken": 7, "total": 10}
    assert response.headers["cache-control"] == "no-store"

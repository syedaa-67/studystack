def test_register_and_login(client):
    res = client.post("/auth/register", json={"email": "test@test.com", "password": "test1234"})
    assert res.status_code == 200
    assert res.json()["email"] == "test@test.com"

    res = client.post(
        "/auth/login",
        data={"username": "test@test.com", "password": "test1234"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_register_duplicate_email_fails(client):
    client.post("/auth/register", json={"email": "dup@test.com", "password": "test1234"})
    res = client.post("/auth/register", json={"email": "dup@test.com", "password": "test1234"})
    assert res.status_code == 400


def test_login_wrong_password_fails(client):
    client.post("/auth/register", json={"email": "wrong@test.com", "password": "test1234"})
    res = client.post(
        "/auth/login",
        data={"username": "wrong@test.com", "password": "bad_password"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert res.status_code == 400


def test_unauthenticated_request_rejected(client):
    res = client.get("/study-groups/")
    assert res.status_code == 401

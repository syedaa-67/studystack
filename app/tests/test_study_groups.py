def test_create_and_list_study_group(client, auth_headers):
    headers = auth_headers("owner@test.com")
    res = client.post("/study-groups/", json={"name": "Calc II", "subject": "Math"}, headers=headers)
    assert res.status_code == 200
    group_id = res.json()["id"]

    res = client.get("/study-groups/", headers=headers)
    assert res.status_code == 200
    assert any(g["id"] == group_id for g in res.json())


def test_creator_is_owner_member(client, auth_headers):
    headers = auth_headers("owner2@test.com")
    res = client.post("/study-groups/", json={"name": "Chem", "subject": "Chemistry"}, headers=headers)
    group_id = res.json()["id"]

    res = client.get(f"/study-groups/{group_id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["my_role"] == "owner"
    assert len(res.json()["members"]) == 1


def test_non_member_cannot_access_group(client, auth_headers):
    owner_headers = auth_headers("owner3@test.com")
    res = client.post("/study-groups/", json={"name": "Bio", "subject": "Biology"}, headers=owner_headers)
    group_id = res.json()["id"]

    stranger_headers = auth_headers("stranger@test.com")
    res = client.get(f"/study-groups/{group_id}", headers=stranger_headers)
    assert res.status_code == 404


def test_member_cannot_create_deadline(client, auth_headers):
    owner_headers = auth_headers("owner4@test.com")
    res = client.post("/study-groups/", json={"name": "Physics", "subject": "Physics"}, headers=owner_headers)
    group_id = res.json()["id"]

    reg_res = client.post("/auth/register", json={"email": "plainmember@test.com", "password": "test1234"})
    plain_user_id = reg_res.json()["id"]
    login_res = client.post(
        "/auth/login",
        data={"username": "plainmember@test.com", "password": "test1234"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    member_headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    client.post(
        "/members/",
        json={"name": "Plain", "email": "plainmember@test.com", "group_id": group_id, "role": "member", "user_id": plain_user_id},
        headers=owner_headers,
    )

    res = client.post(
        "/deadlines/",
        json={"title": "Homework", "due_date": "2026-12-01T00:00:00", "group_id": group_id},
        headers=member_headers,
    )
    assert res.status_code == 403


def test_complete_assigned_deadline_awards_points(client, auth_headers):
    owner_headers = auth_headers("gowner1@test.com")
    res = client.post("/study-groups/", json={"name": "Group A", "subject": "Math"}, headers=owner_headers)
    group_id = res.json()["id"]

    group = client.get(f"/study-groups/{group_id}", headers=owner_headers).json()
    owner_member_id = group["members"][0]["id"]

    res = client.post(
        "/deadlines/",
        json={
            "title": "Read chapter 1",
            "due_date": "2099-01-01T00:00:00",
            "group_id": group_id,
            "assigned_to_id": owner_member_id,
        },
        headers=owner_headers,
    )
    deadline_id = res.json()["id"]

    res = client.patch(f"/deadlines/{deadline_id}/complete", headers=owner_headers)
    assert res.status_code == 200
    assert res.json()["completed"] is True

    leaderboard = client.get(f"/study-groups/{group_id}/leaderboard", headers=owner_headers).json()
    entry = next(e for e in leaderboard["entries"] if e["member_id"] == owner_member_id)
    assert entry["points"] == 15
    assert "First Deadline" in entry["badges"]


def test_complete_unassigned_deadline_awards_completer(client, auth_headers):
    owner_headers = auth_headers("gowner2@test.com")
    res = client.post("/study-groups/", json={"name": "Group B", "subject": "Math"}, headers=owner_headers)
    group_id = res.json()["id"]

    group = client.get(f"/study-groups/{group_id}", headers=owner_headers).json()
    owner_member_id = group["members"][0]["id"]

    res = client.post(
        "/deadlines/",
        json={"title": "Unassigned task", "due_date": "2099-01-01T00:00:00", "group_id": group_id},
        headers=owner_headers,
    )
    deadline_id = res.json()["id"]

    client.patch(f"/deadlines/{deadline_id}/complete", headers=owner_headers)

    leaderboard = client.get(f"/study-groups/{group_id}/leaderboard", headers=owner_headers).json()
    entry = next(e for e in leaderboard["entries"] if e["member_id"] == owner_member_id)
    assert entry["points"] == 15


def test_completing_already_completed_deadline_does_not_double_award(client, auth_headers):
    owner_headers = auth_headers("gowner3@test.com")
    res = client.post("/study-groups/", json={"name": "Group C", "subject": "Math"}, headers=owner_headers)
    group_id = res.json()["id"]
    group = client.get(f"/study-groups/{group_id}", headers=owner_headers).json()
    owner_member_id = group["members"][0]["id"]

    res = client.post(
        "/deadlines/",
        json={"title": "Task", "due_date": "2099-01-01T00:00:00", "group_id": group_id},
        headers=owner_headers,
    )
    deadline_id = res.json()["id"]

    client.patch(f"/deadlines/{deadline_id}/complete", headers=owner_headers)
    client.patch(f"/deadlines/{deadline_id}/complete", headers=owner_headers)

    leaderboard = client.get(f"/study-groups/{group_id}/leaderboard", headers=owner_headers).json()
    entry = next(e for e in leaderboard["entries"] if e["member_id"] == owner_member_id)
    assert entry["points"] == 15


def test_five_completions_awards_5_completed_badge(client, auth_headers):
    owner_headers = auth_headers("gowner4@test.com")
    res = client.post("/study-groups/", json={"name": "Group D", "subject": "Math"}, headers=owner_headers)
    group_id = res.json()["id"]
    group = client.get(f"/study-groups/{group_id}", headers=owner_headers).json()
    owner_member_id = group["members"][0]["id"]

    for i in range(5):
        res = client.post(
            "/deadlines/",
            json={"title": f"Task {i}", "due_date": "2099-01-01T00:00:00", "group_id": group_id},
            headers=owner_headers,
        )
        deadline_id = res.json()["id"]
        client.patch(f"/deadlines/{deadline_id}/complete", headers=owner_headers)

    leaderboard = client.get(f"/study-groups/{group_id}/leaderboard", headers=owner_headers).json()
    entry = next(e for e in leaderboard["entries"] if e["member_id"] == owner_member_id)
    assert "5 Completed" in entry["badges"]

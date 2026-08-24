def test_create_resource_awards_points(client, auth_headers):
    owner_headers = auth_headers("rowner1@test.com")
    res = client.post("/study-groups/", json={"name": "Group R", "subject": "Math"}, headers=owner_headers)
    group_id = res.json()["id"]
    group = client.get(f"/study-groups/{group_id}", headers=owner_headers).json()
    owner_member_id = group["members"][0]["id"]

    res = client.post(
        "/resources/",
        json={
            "group_id": group_id,
            "title": "Notes",
            "resource_type": "note",
            "content": "Some content",
            "created_by_id": owner_member_id,
        },
        headers=owner_headers,
    )
    assert res.status_code == 200

    leaderboard = client.get(f"/study-groups/{group_id}/leaderboard", headers=owner_headers).json()
    entry = next(e for e in leaderboard["entries"] if e["member_id"] == owner_member_id)
    assert entry["points"] == 5


def test_resource_versioning_and_rollback(client, auth_headers):
    owner_headers = auth_headers("rowner2@test.com")
    res = client.post("/study-groups/", json={"name": "Group S", "subject": "Math"}, headers=owner_headers)
    group_id = res.json()["id"]

    res = client.post(
        "/resources/",
        json={"group_id": group_id, "title": "Doc", "resource_type": "note", "content": "v1 content"},
        headers=owner_headers,
    )
    resource_id = res.json()["id"]

    res = client.patch(
        f"/resources/{resource_id}",
        json={"content": "v2 content", "change_summary": "Updated"},
        headers=owner_headers,
    )
    assert res.json()["current_version_number"] == 2

    res = client.post(f"/resources/{resource_id}/rollback/1", headers=owner_headers)
    assert res.status_code == 200
    assert res.json()["current_content"] == "v1 content"
    assert res.json()["current_version_number"] == 3

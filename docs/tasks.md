# Tasks API (MVP)

## List
`GET /api/tasks?status=todo|doing|done`

## Create
`POST /api/tasks` body:
```json
{ "title": "Do X", "status": "todo", "dueAt": "2025-09-11T12:00:00Z", "assignee": "user1" }
```

## Update
`PATCH /api/tasks/{id}` body = partial Task

## Delete
`DELETE /api/tasks/{id}`

Headers:
- `x-autonomy`: 0|1|2 (policy)
- Response includes `correlationId` and `explanation`.

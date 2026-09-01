# API Documents

This directory holds the interface documents for `apps/api`. Per the repository
convention every API document lives in `.docs/api/`, which is **internal**
material — it is not rendered by the public documentation site in `docs/`.

## Adding an API document

1. Create `.docs/api/<resource>.md`.
2. Start it with a `# <Resource>` heading.
3. Keep one file per resource or per module.

## Suggested layout

Inside each file, keep one section per endpoint:

````markdown
## POST /sys/login

Authenticate a user and return a JWT.

### Request

| Field      | Type   | Required | Description       |
| ---------- | ------ | -------- | ----------------- |
| `username` | string | yes      | account name      |
| `password` | string | yes      | plaintext password|

### Response

```json
{ "success": true, "code": 200, "result": { "token": "..." } }
```
````

## Runtime references

The API service is `apps/api` (JeecgBoot / Spring Boot), exposed on port `8080`
by both compose files. See `docs/content/docker.md` for how it is built and run.

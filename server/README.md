# StatNexus Backend

Express API with JWT auth and CockroachDB.

## Setup

1. Create a CockroachDB cluster and database named `statnexus`.
2. Copy env file and fill in values:

```bash
cp .env.example .env
```

3. Install dependencies and run migration:

```bash
npm install
npm run migrate
```

4. Start the API:

```bash
npm run dev
```

The API runs on `http://localhost:3001`.

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account + profile |
| POST | `/api/auth/login` | No | Sign in, returns JWT |
| GET | `/api/auth/me` | Yes | Current user + profile |
| DELETE | `/api/auth/account` | Yes | Delete account and all data |
| GET | `/api/profile` | Yes | Get profile |
| PATCH | `/api/profile` | Yes | Update profile |
| GET | `/api/test-results` | Yes | List results (`?withQuestions=true` for review data) |
| POST | `/api/test-results` | Yes | Save exam result |

## Migrate data from Supabase

Export from Supabase SQL editor:

```sql
COPY (SELECT id, email, encrypted_password FROM auth.users) TO STDOUT WITH CSV HEADER;
```

Since Supabase stores bcrypt hashes, you cannot reuse passwords directly unless you export and map them. Easier approach: ask users to re-register, or export profiles/test_results only and create new user records manually.

Export app data:

```sql
COPY (SELECT * FROM public.profiles) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM public.test_results) TO STDOUT WITH CSV HEADER;
```

Then import into CockroachDB after creating matching `users` rows.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { pool } from '../src/db.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const importDir = path.join(__dirname, '../import-data');

function readJson(filename) {
  const filePath = path.join(importDir, filename);

  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping ${filename} — file not found`);
    return [];
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : parsed.data || [];
}

function parseCsv(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map((line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    values.push(current);

    return headers.reduce((row, header, index) => {
      row[header] = values[index]?.replace(/^"|"$/g, '') ?? null;
      return row;
    }, {});
  });
}

function readCsv(filename) {
  const filePath = path.join(importDir, filename);

  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping ${filename} — file not found`);
    return [];
  }

  return parseCsv(fs.readFileSync(filePath, 'utf8'));
}

function loadDataset(baseName) {
  const jsonPath = path.join(importDir, `${baseName}.json`);
  const csvPath = path.join(importDir, `${baseName}.csv`);

  if (fs.existsSync(jsonPath)) return readJson(`${baseName}.json`);
  if (fs.existsSync(csvPath)) return readCsv(`${baseName}.csv`);
  console.warn(`No ${baseName}.json or ${baseName}.csv found`);
  return [];
}

function toBool(value) {
  if (typeof value === 'boolean') return value;
  if (value == null) return false;
  return ['true', 't', '1', 'yes'].includes(String(value).toLowerCase());
}

async function importUsers(client, users) {
  let count = 0;

  for (const user of users) {
    const passwordHash = user.password_hash || user.encrypted_password;

    if (!user.id || !user.email || !passwordHash) {
      console.warn('Skipping user with missing id/email/password_hash:', user.email || user.id);
      continue;
    }

    await client.query(
      `INSERT INTO users (id, email, password_hash, created_at, email_verified)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         password_hash = EXCLUDED.password_hash,
         email_verified = EXCLUDED.email_verified`,
      [
        user.id,
        user.email.toLowerCase().trim(),
        passwordHash,
        user.created_at || new Date().toISOString(),
        toBool(user.email_verified),
      ]
    );

    count += 1;
  }

  return count;
}

async function importProfiles(client, profiles) {
  let count = 0;

  for (const profile of profiles) {
    if (!profile.id) continue;

    await client.query(
      `INSERT INTO profiles (id, full_name, updated_at, syllabus_focus, account_tier)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         updated_at = EXCLUDED.updated_at,
         syllabus_focus = EXCLUDED.syllabus_focus,
         account_tier = EXCLUDED.account_tier`,
      [
        profile.id,
        profile.full_name || null,
        profile.updated_at || new Date().toISOString(),
        profile.syllabus_focus || 'NCLEX-RN',
        profile.account_tier || 'STANDARD',
      ]
    );

    count += 1;
  }

  return count;
}

async function importTestResults(client, results) {
  let count = 0;

  for (const result of results) {
    if (!result.id || !result.user_id) continue;

    const userAnswers = result.user_answers
      ? (typeof result.user_answers === 'string' ? result.user_answers : JSON.stringify(result.user_answers))
      : null;

    const questions = result.questions
      ? (typeof result.questions === 'string' ? result.questions : JSON.stringify(result.questions))
      : null;

    await client.query(
      `INSERT INTO test_results
        (id, user_id, exam_type, score, questions_count, duration_minutes, user_answers, questions, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [
        result.id,
        result.user_id,
        result.exam_type,
        Number(result.score),
        Number(result.questions_count),
        Number(result.duration_minutes || 0),
        userAnswers,
        questions,
        result.completed_at || new Date().toISOString(),
      ]
    );

    count += 1;
  }

  return count;
}

async function main() {
  if (!fs.existsSync(importDir)) {
    fs.mkdirSync(importDir, { recursive: true });
    console.log(`Created ${importDir}`);
    console.log('Export data from Supabase, save CSV/JSON files there, then rerun.');
    process.exit(0);
  }

  const users = loadDataset('users');
  const profiles = loadDataset('profiles');
  const testResults = loadDataset('test_results');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userCount = await importUsers(client, users);
    const profileCount = await importProfiles(client, profiles);
    const resultCount = await importTestResults(client, testResults);

    await client.query('COMMIT');

    console.log(`Imported ${userCount} users`);
    console.log(`Imported ${profileCount} profiles`);
    console.log(`Imported ${resultCount} test results`);
    console.log('Done. Existing Supabase passwords should work unchanged.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Import failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

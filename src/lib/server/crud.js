import { json } from '@sveltejs/kit';
import { getPool } from './db.js';

export async function nextId(table, prefix) {
  const pool = getPool();
  const [rows] = await pool.query(`SELECT COUNT(*) as c FROM \`${table}\``);
  const n = rows[0].c + 1;
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

export async function crudList(table, orderBy = 'created_at DESC') {
  const pool = getPool();
  const [rows] = await pool.query(`SELECT * FROM \`${table}\` ORDER BY ${orderBy}`);
  return json(rows);
}

export async function crudCreate(event, table, prefix, fields) {
  const body = await event.request.json();
  const pool = getPool();
  const id = await nextId(table, prefix);
  let availableFields = [...fields];
  while (true) {
    const cols = ['id', ...availableFields];
    const vals = [id, ...availableFields.map((f) => (body[f] === undefined ? null : body[f]))];
    const placeholders = cols.map(() => '?').join(',');
    try {
      await pool.query(`INSERT INTO \`${table}\` (${cols.map(c=>`\`${c}\``).join(',')}) VALUES (${placeholders})`, vals);
      break;
    } catch (error) {
      const missingField = error.message?.match(/Unknown column '([^']+)'/)?.[1];
      if (!missingField || !availableFields.includes(missingField)) throw error;
      availableFields = availableFields.filter((field) => field !== missingField);
    }
  }
  return json({ id, ...body });
}

export async function crudUpdate(event, table, fields) {
  const id = event.params.id;
  const body = await event.request.json();
  const pool = getPool();
  let availableFields = [...fields];
  while (true) {
    const setClause = availableFields.map((f) => `\`${f}\` = ?`).join(', ');
    const vals = [...availableFields.map((f) => (body[f] === undefined ? null : body[f])), id];
    try {
      await pool.query(`UPDATE \`${table}\` SET ${setClause} WHERE id = ?`, vals);
      break;
    } catch (error) {
      const missingField = error.message?.match(/Unknown column '([^']+)'/)?.[1];
      if (!missingField || !availableFields.includes(missingField)) throw error;
      availableFields = availableFields.filter((field) => field !== missingField);
    }
  }
  return json({ id, ...body });
}

export async function crudDelete(event, table) {
  const id = event.params.id;
  const pool = getPool();
  await pool.query(`DELETE FROM \`${table}\` WHERE id = ?`, [id]);
  return json({ deleted: true, id });
}

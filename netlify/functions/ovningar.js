const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS ovningar (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        format TEXT,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    if (event.httpMethod === 'GET') {
      const rows = await sql`
        SELECT id, name, format, data, created_at
        FROM ovningar
        ORDER BY created_at DESC
        LIMIT 100
      `;
      return { statusCode: 200, headers, body: JSON.stringify(rows) };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { name, format, ...rest } = body;
      if (!name) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name required' }) };
      const [row] = await sql`
        INSERT INTO ovningar (name, format, data)
        VALUES (${name}, ${format || '4v4'}, ${JSON.stringify(rest)})
        RETURNING id, name, format, created_at
      `;
      return { statusCode: 201, headers, body: JSON.stringify(row) };
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID required' }) };
      await sql`DELETE FROM ovningar WHERE id = ${parseInt(id)}`;
      return { statusCode: 200, headers, body: JSON.stringify({ deleted: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

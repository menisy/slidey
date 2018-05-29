const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/b2b';

const lala = async function(){
const client = new pg.Client(connectionString);
await client.connect();
const query = await client.query(
  'CREATE TABLE brochures(id SERIAL PRIMARY KEY, name VARCHAR(40) not null, s3id VARCHAR(40) not null)');
//query.on('end', () => { client.end(); });
await client.end();
}();

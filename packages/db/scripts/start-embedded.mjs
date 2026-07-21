import EmbeddedPostgres from 'embedded-postgres';
import path from 'node:path';
import os from 'node:os';

// Workspace path contains non-ASCII chars (Turkish ı) which breaks Postgres initdb on Windows.
const databaseDir = path.join(os.homedir(), '.ai-fabrikasi', 'pgdata');

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir,
    user: 'postgres',
    password: 'postgres',
    port: 54329,
    persistent: true,
    initdbFlags: ['--locale=C', '--encoding=UTF8'],
  });

  await pg.initialise();
  await pg.start();
  try {
    await pg.createDatabase('ai_fabrikasi');
  } catch {
    // already exists
  }

  console.log(`Embedded Postgres data dir: ${databaseDir}`);
  console.log('Embedded Postgres ready on postgresql://postgres:postgres@localhost:54329/ai_fabrikasi');
  console.log('Keep this process running while developing.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
  return result;
}

function output(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
  return result.stdout.trim();
}

const message = process.argv.slice(2).join(' ').trim();
if (!message) {
  console.error('Usage: npm run ship -- "Describe the completed change"');
  process.exit(2);
}
if (message.length > 120) {
  console.error('Keep the commit message under 120 characters.');
  process.exit(2);
}

if (output('git', ['rev-parse', '--is-inside-work-tree']) !== 'true') {
  console.error('Run this command from inside the project repository.');
  process.exit(2);
}

const status = output('git', ['status', '--porcelain']);
if (!status) {
  console.log('No changes to validate or ship.');
  process.exit(0);
}
const staged = spawnSync('git', ['diff', '--cached', '--quiet']);
if (staged.error) throw staged.error;
if (staged.status === 1) {
  console.error('The Git index already contains staged changes. Commit or unstage them first; this script will not alter existing staged work.');
  process.exit(2);
}
if (staged.status !== 0) process.exit(staged.status ?? 1);

console.log('Running all project quality gates before staging changes…');
run('npm', ['run', 'validate']);
run('git', ['add', '--all']);
run('git', ['diff', '--cached', '--check']);

const files = output('git', ['diff', '--cached', '--name-only']).split('\n').filter(Boolean);
const sensitive = files.filter((file) => /(^|\/)\.env(?!\.example$)|(^|\/)(credentials?|secrets?)(\.|\/|$)|\.(pem|key|p12|pfx)$/i.test(file));
if (sensitive.length) {
  run('git', ['reset', '--mixed', 'HEAD']);
  console.error('Refusing to commit possible secret files:');
  for (const file of sensitive) console.error(`  ${file}`);
  process.exit(2);
}

console.log('Files included in this commit:');
for (const file of files) console.log(`  ${file}`);
run('git', ['commit', '-m', message]);
const branch = output('git', ['branch', '--show-current']);
if (!branch) {
  console.error('Commit created, but the current checkout has no branch to push.');
  process.exit(1);
}
run('git', ['push', '-u', 'origin', branch]);

const { spawn } = require('child_process');

// Run next dev with stdin ignored so it never auto-exits on stdin EOF
const child = spawn('npx', ['next', 'dev', '--webpack', '-p', '3000'], {
  stdio: ['ignore', 'inherit', 'inherit'],
  shell: true,
});

child.on('close', (code) => {
  console.log(`Next.js server exited with code ${code}`);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit();
});

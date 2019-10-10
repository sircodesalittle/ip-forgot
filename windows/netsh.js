const exec = require( 'child_process' ).exec;
const netsh = exec( 'netsh.exe interface ip show config', { shell: true });

netsh.stdout.on( 'data', data => console.log( `stdout: ${data}` ) );
netsh.stderr.on( 'data', data => console.log( `stderr: ${data}` ) );
netsh.on( 'close', code => console.log( `child process exited with code ${code}` ) );


// TODO get interface names

// TODO get current configuration
// list adapter's current configs

// netsh int ip set address "NIC name" static 10.0.0.1 255.255.255.0 10.0.0.254


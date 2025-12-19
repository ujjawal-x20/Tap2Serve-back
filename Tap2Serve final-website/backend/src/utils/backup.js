const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const backupDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

const dbName = process.env.MONGODB_URI.split('/').pop().split('?')[0];
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `${dbName}-backup-${timestamp}`);

const backupCommand = `mongodump --uri="${process.env.MONGODB_URI}" --out="${backupFile}"`;

console.log(`Starting backup for database: ${dbName}...`);

exec(backupCommand, (error, stdout, stderr) => {
    if (error) {
        console.error(`Backup failed: ${error.message}`);
        return;
    }
    console.log(`Backup completed successfully! Saved to: ${backupFile}`);
});

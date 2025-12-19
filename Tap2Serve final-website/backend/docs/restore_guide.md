# Restore Guide - Tap2Serve Backend

This guide covers the restoration of the MongoDB database from backups created by `src/utils/backup.js`.

## 1. Locate the Backup
Identify the backup directory you wish to restore from within the `backups/` folder. The folder name will follow the format: `<db_name>-backup-<timestamp>`.

## 2. Restoration Process
Use the `mongorestore` utility to restore the data:

### Restore to Local MongoDB
```bash
mongorestore --db <db_name> backups/<backup_folder_name>/<db_name>
```

### Restore to MongoDB Atlas
```bash
mongorestore --uri="mongodb+srv://<user>:<password>@cluster.mongodb.net" --nsInclude="<db_name>.*" backups/<backup_folder_name>/<db_name>
```

## 3. Verification
After restoration, verify the data by running the application and checking the dashboard or using a MongoDB GUI like Compass.
```bash
npm start
```

## 4. Troubleshooting
- **Command not found**: Ensure `mongo-database-tools` are installed on your system.
- **Authentication failed**: Check your MongoDB URI and ensure the user has `restore` privileges.

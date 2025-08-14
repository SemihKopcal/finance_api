import { exec } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const BACKUP_PATH = "C:\\Users\\MONSTER\\Desktop";

// Veritabanını yedekle
export const backupDatabase = () => {
  const command = `mongodump --uri="${MONGO_URI}" --out="${BACKUP_PATH}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Backup error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Backup stderr: ${stderr}`);
      return;
    }
    console.log('✅ Backup completed!');
    console.log(stdout);
  });
};

// Yedeği geri yükle
export const restoreDatabase = () => {
  const command = `mongorestore --uri="${MONGO_URI}" "${BACKUP_PATH}/finance"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Restore error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Restore stderr: ${stderr}`);
      return;
    }
    console.log('✅ Restore completed!');
    console.log(stdout);
  });
};

backupDatabase();      // Yedek almak için
// restoreDatabase();  // Yedeği geri yüklemek için
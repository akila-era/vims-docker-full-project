# VIMS Automated Backup with SMTP Email Service

## 🚀 Features

✅ **Automated Daily Database Backups**  
✅ **SMTP Email Delivery**  
✅ **Compressed Backup Files (.zip)**  
✅ **Automatic Old Backup Cleanup**  
✅ **Health Check Monitoring**  
✅ **Multiple Email Recipients**  
✅ **File Size Management**  
✅ **24/7 Service Running**

## 📧 SMTP Configuration

### 1. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account Settings → Security → 2-Step Verification
   - Generate App Password for "Mail"
   - Use this password (not your regular password)

3. **Update .env file:**
```env
# SMTP Configuration for Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_USE_TLS=true

# Email Recipients
EMAIL_FROM=vims-backup@your-domain.com
EMAIL_TO=admin@company.com,manager@company.com
EMAIL_CC=it-support@company.com
```

### 2. Other Email Providers

| Provider | SMTP Host | Port | TLS |
|----------|-----------|------|-----|
| **Gmail** | smtp.gmail.com | 587 | Yes |
| **Outlook** | smtp-mail.outlook.com | 587 | Yes |
| **Yahoo** | smtp.mail.yahoo.com | 587 | Yes |
| **Custom** | your-smtp-server.com | 587/465 | Yes |

## 🗄️ Backup Configuration

### Environment Variables

```env
# Backup Schedule (Cron format)
BACKUP_SCHEDULE=0 2 * * *  # Daily at 2 AM

# Email Settings
EMAIL_ENABLED=true
EMAIL_TO=admin@company.com,backup@company.com
EMAIL_CC=it@company.com

# Retention & Size
BACKUP_RETENTION_DAYS=30        # Keep backups for 30 days
MAX_EMAIL_ATTACHMENT_MB=25      # Gmail limit is 25MB

# Immediate Backup (for testing)
RUN_BACKUP_NOW=true
```

### Schedule Options

| Schedule | Cron Expression | Description |
|----------|----------------|-------------|
| **Daily 2 AM** | `0 2 * * *` | Recommended |
| **Every 6 hours** | `0 */6 * * *` | High frequency |
| **Weekly Sunday 2 AM** | `0 2 * * 0` | Low frequency |
| **Every 4 hours** | `0 */4 * * *` | Very active systems |

## 🚀 Setup Instructions

### 1. Copy Environment Configuration
```bash
cp .env.example .env
```

### 2. Update SMTP Settings in .env
```bash
nano .env
# Configure your SMTP credentials
```

### 3. Start Services
```bash
docker-compose up -d --build
```

### 4. Test Backup Service
```bash
# View backup service logs
docker-compose logs -f backup

# Test immediate backup
docker-compose exec backup python backup-mailer.py
```

## 📊 Service Monitoring

### Check Service Status
```bash
# Service status
docker-compose ps backup

# Live logs
docker-compose logs -f backup

# Backup files
ls -la ./backup/

# Email logs
docker-compose exec backup cat /app/logs/backup.log
```

### Email Report Contents

**Daily Backup Email includes:**
- ✅ Backup file attachment (if < 25MB)
- 📊 Database size and compression info
- ⏰ Backup timestamp
- 🔧 System status
- ⚠️ Any warnings or errors

**Weekly Health Check Email includes:**
- 💚 Service status confirmation
- 📈 Backup count and storage usage
- 🔌 Database and SMTP connectivity
- 📅 Next scheduled backup time

## 🛠️ Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| **No emails received** | Check SMTP credentials and Gmail App Password |
| **"SMTP connection failed"** | Verify SMTP_HOST, PORT, and TLS settings |
| **"Database connection failed"** | Check DB_HOST, DB_USER, DB_PASSWORD |
| **Backup files too large** | Files >25MB won't be emailed (saved locally) |
| **Service not running** | Check: `docker-compose restart backup` |

### Debug Commands

```bash
# Test SMTP connection manually
docker-compose exec backup python3 -c "
import smtplib
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
server.login('your-email@gmail.com', 'your-app-password')
print('SMTP works!')
server.quit()
"

# Test database connection
docker-compose exec backup python3 -c "
import mysql.connector
conn = mysql.connector.connect(
    host='mysql', user='admin', 
    password='your-password', database='hexa_vims_db_development'
)
print('Database works!')
conn.close()
"

# Manual backup
docker-compose exec backup python3 backup-mailer.py

# View backup directory
docker-compose exec backup ls -la /app/backup/
```

## 🔐 Security Best Practices

1. **Use App Passwords** (not regular passwords)
2. **Limit Email Recipients** to authorized personnel only
3. **Set Reasonable Retention** (30 days default)
4. **Monitor Backup Logs** regularly
5. **Test Restore Process** periodically

## 📋 Email Templates

### Sample Backup Success Email

```
Subject: VIMS Database Backup - 2026-02-15 02:00:15

VIMS Database Backup Report
========================

Backup Details:
- Date: 2026-02-15 02:00:15
- Database: hexa_vims_db_development
- File: vims_backup_20260215_020015.zip
- Size: 12.45 MB
- Status: Successful

This is an automated backup from the VIMS system.
The database backup is attached to this email.

System Information:
- Database Host: mysql
- Backup Service: Running
- SMTP Connection: Active
```

### Sample Health Check Email

```
Subject: VIMS Backup Service - Health Check

VIMS Backup Service Health Check
===============================

Service Status: ✅ Running
Timestamp: 2026-02-15 09:00:00

Component Status:
- Database Connection: ✅ Connected
- SMTP Connection: ✅ Active
- Backup Directory: ✅ Accessible
- Recent Backups: 7 files

Configuration:
- Database: mysql:3306/hexa_vims_db_development
- SMTP: smtp.gmail.com:587
- Retention: 30 days
- Max Email Size: 25 MB
```

## 🎯 Production Recommendations

1. **Set up dedicated backup email** (e.g., `vims-backup@yourcompany.com`)
2. **Use multiple email recipients** for redundancy
3. **Monitor backup logs** weekly
4. **Test email delivery** monthly
5. **Verify backup integrity** periodically
6. **Set up backup retention** based on compliance needs

## 📞 Support

If you encounter issues:

1. Check service logs: `docker-compose logs backup`
2. Verify .env configuration
3. Test SMTP manually (see debug commands)
4. Ensure Gmail App Password is correctly set
5. Check firewall/network settings for SMTP ports

**Your VIMS backup system now runs 24/7 and automatically emails backups!** 🎉
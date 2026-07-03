# DesiTracker Backend — DigitalOcean Deployment (Easy Step-by-Step)

This guide takes the Node/Express backend live on a DigitalOcean Droplet (Ubuntu)
with **PM2** (keeps it running), **Nginx** (reverse proxy), and **HTTPS** (free SSL).

> The mobile app talks to this server over **HTTPS**. A plain `http://` server
> will NOT work (Apple/Google block it). So a domain + SSL is **required**, not optional.

---

## 0. What you need before starting
- A DigitalOcean account.
- A **domain name** you control (e.g. `api.desitracker.com`). You'll point it at the server.
- The **MongoDB connection string** (MongoDB Atlas recommended — free tier is fine).
- **Cloudinary** account (name, API key, API secret) — image uploads use it.
- An email account for sending mail (SMTP user/pass) — optional but used for invites/reset.
- The `.env` values (ask the developer for the current ones).

---

## 1. Create the server (Droplet)
1. DigitalOcean → **Create → Droplet**.
2. Image: **Ubuntu 24.04 LTS**.
3. Plan: **Basic → Regular → 2 GB RAM / 1 CPU** ($12/mo) is enough to start. (1 GB also works.)
4. Choose a region close to your users.
5. Authentication: **SSH key** (recommended) or password.
6. Create. Note the server's **public IP address**.

---

## 2. Point your domain at the server
In your domain DNS settings (where you bought the domain), add an **A record**:

| Type | Host / Name | Value (points to)   |
|------|-------------|---------------------|
| A    | `api`       | `<your droplet IP>` |

So `api.desitracker.com` → your server. DNS can take a few minutes to update.

---

## 3. Log into the server
On your computer's terminal:
```bash
ssh root@<your droplet IP>
```

---

## 4. Install the tools (copy-paste the whole block)
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git nginx

# Install PM2 (keeps the app running 24/7) and pnpm/npm tools
npm install -g pm2

# Verify
node -v   # should print v20.x
```

---

## 5. Get the code onto the server
**Option A — via Git (recommended):**
```bash
cd /var/www
git clone <YOUR_BACKEND_GIT_URL> desitracker-backend
cd desitracker-backend
```

**Option B — no Git:** zip the `desitracker-backend-main` folder, upload with
`scp`, and unzip into `/var/www/desitracker-backend`.

> The repo already contains a compiled `dist/` folder, so you can run it even
> without building. But building on the server is safest (step 7).

---

## 6. Create the `.env` file
```bash
nano /var/www/desitracker-backend/.env
```
Paste this and fill in the real values (get them from the developer):

```env
NODE_ENV=production
PORT=5000

# Database (MongoDB Atlas connection string)
DB_URL=mongodb+srv://USER:PASS@cluster.mongodb.net/desitracker

# Auth secrets — use long random strings
JWT_ACCESS_SECRET=change_me_long_random
JWT_REFRESH_SECRET=change_me_long_random
JWT_SECRET=change_me_long_random
MEMBER_JWT_SECRET=change_me_long_random
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
MEMBER_JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# Cloudinary (image uploads)
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
IMAGE_FOLDER_NAME=deshi-tracker
CLOUDINARY_FOLDER=deshi-tracker

# Email (SMTP)
SMPT_HOST=smtp.gmail.com
SMPT_PORT=465
NODEMAILER_USER=your_email@gmail.com
NODEMAILER_PASS=your_app_password

# App info
COMPANY_NAME=DesiTracker
ROOT_UI_URL=https://desitracker.com
FRONTEND_BASE_URL=https://desitracker.com
ADMIN_EMAIL=admin@desitracker.com
DEFAULT_PASS=change_me
SUPER_ADMIN_PASSWORD=change_me
```
Save: `Ctrl+O`, `Enter`, then `Ctrl+X`.

> ⚠️ `PORT` MUST be set (the app has no default). `5000` is used in this guide.

---

## 7. Install dependencies & build
```bash
cd /var/www/desitracker-backend
npm install
npm run build        # compiles TypeScript into dist/
mkdir -p uploads     # multer needs this folder for temp image uploads
```

---

## 8. Start the app with PM2
```bash
pm2 start dist/server.js --name desitracker-api
pm2 save             # remember this app
pm2 startup          # run the command it prints, so it auto-starts on reboot
```
Check it's alive:
```bash
pm2 logs desitracker-api      # should show "server running" with no errors
curl http://localhost:5000/api/v1   # should respond
```

---

## 9. Put Nginx in front (reverse proxy)
```bash
nano /etc/nginx/sites-available/desitracker
```
Paste (change the domain to yours):
```nginx
server {
    listen 80;
    server_name api.desitracker.com;

    client_max_body_size 20M;   # allow image uploads

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;        # for socket.io
        proxy_set_header Connection "upgrade";          # for socket.io
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable it:
```bash
ln -s /etc/nginx/sites-available/desitracker /etc/nginx/sites-enabled/
nginx -t            # test config — must say "OK"
systemctl restart nginx
```

---

## 10. Add free HTTPS (SSL) 🔒
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.desitracker.com
```
Follow the prompts (enter an email, agree, choose **redirect HTTP→HTTPS**).
Certbot auto-renews. Done — your API is now at:

```
https://api.desitracker.com/api/v1/
```

Test in a browser: opening `https://api.desitracker.com/api/v1` should respond.

---

## 11. Firewall (optional but recommended)
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## 12. Tell the mobile team the final URL
Give them exactly:
```
https://api.desitracker.com/api/v1/
```
They will put it into the app config and rebuild. **This must match (with the
trailing slash).**

---

## Updating the backend later (after code changes)
```bash
cd /var/www/desitracker-backend
git pull                 # (or re-upload files)
npm install              # only if dependencies changed
npm run build
pm2 restart desitracker-api
```

---

## Quick troubleshooting
| Problem | Fix |
|---------|-----|
| `pm2 logs` shows DB error | Check `DB_URL`; in MongoDB Atlas, allow the droplet IP under Network Access. |
| 502 Bad Gateway | App isn't running — `pm2 restart desitracker-api`, check `pm2 logs`. |
| Image upload fails | `mkdir -p uploads` and check Cloudinary keys in `.env`. |
| HTTPS not working | DNS A record must point to the server; re-run `certbot --nginx`. |
| App can't reach API | Confirm the app uses the **https** URL with the trailing slash. |

---

**Summary:** Droplet → DNS → install Node/Nginx/PM2 → upload code → `.env` →
`npm install && npm run build` → PM2 start → Nginx → Certbot SSL → give the
`https://.../api/v1/` URL to the app team. That's it. 🚀

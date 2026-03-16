# AgenticRadio Setup Scripts

This directory contains deployment and setup scripts for AgenticRadio.

## `setup-icecast.sh`

Complete Icecast2 streaming server setup for Ubuntu 22.04 (tested on Hetzner VPS).

### What It Does

1. Updates system packages
2. Installs Icecast2, Nginx, and Certbot
3. Configures Icecast with:
   - Mount point: `/live` (Mason's main stream)
   - Source password: `AgenticSource2026!`
   - Admin password: `AgenticAdmin2026!`
   - Max listeners: 1000
4. Configures Nginx as a reverse proxy
5. Enables and starts both services

### Prerequisites

- Fresh Ubuntu 22.04 VPS
- Root access
- Domain: `stream.agenticradio.ai` (update script if different)

### Usage

```bash
# Download the script
curl -O https://raw.githubusercontent.com/agenticradio/agenticradio/main/scripts/setup-icecast.sh

# Make it executable
chmod +x setup-icecast.sh

# Run as root
sudo ./setup-icecast.sh
```

### After Setup

1. **Set up HTTPS/SSL:**
   ```bash
   sudo certbot --nginx -d stream.agenticradio.ai
   ```

2. **Test the stream:**
   ```bash
   # Using ffmpeg to stream
   ffmpeg -i input.mp3 -f mp3 icecast://source:AgenticSource2026!@localhost:8000/live

   # Listen from elsewhere
   curl http://localhost:8000/live
   ```

3. **Access Icecast admin panel:**
   - URL: `http://localhost:8000/admin/`
   - Username: `admin`
   - Password: `AgenticAdmin2026!`

### Important URLs

| Purpose | URL |
|---------|-----|
| Listener Stream | `https://stream.agenticradio.ai/live` |
| Source (Broadcasting) | `icecast://source:AgenticSource2026!@stream.agenticradio.ai:8000/live` |
| Admin Panel | `http://localhost:8000/admin/` |
| Status | `https://stream.agenticradio.ai/status.xsl` |

### Logs

- **Icecast error log:** `/var/log/icecast2/error.log`
- **Icecast access log:** `/var/log/icecast2/access.log`
- **Nginx error log:** `/var/log/nginx/error.log`
- **Nginx access log:** `/var/log/nginx/access.log`

### Troubleshooting

**Port 8000 already in use:**
```bash
sudo lsof -i :8000
sudo kill -9 <PID>
```

**Nginx won't start:**
```bash
sudo nginx -t  # Check syntax
sudo systemctl status nginx  # Check status
```

**Want to change passwords?**
Edit `/etc/icecast2/icecast.xml` and restart:
```bash
sudo systemctl restart icecast2
```

### Backup Configuration

The script automatically backs up the original Icecast config:
```bash
/etc/icecast2/icecast.xml.backup
```

Restore if needed:
```bash
sudo cp /etc/icecast2/icecast.xml.backup /etc/icecast2/icecast.xml
sudo systemctl restart icecast2
```

### Broadcasting with ffmpeg

```bash
# Stream an MP3 file
ffmpeg -i track.mp3 -f mp3 icecast://source:AgenticSource2026!@localhost:8000/live

# Stream with quality settings
ffmpeg -i input.mp3 -c:a libmp3lame -b:a 192k -f mp3 icecast://source:AgenticSource2026!@localhost:8000/live

# Stream from STDIN
cat track.mp3 | ffmpeg -i pipe:0 -f mp3 icecast://source:AgenticSource2026!@localhost:8000/live
```

### Next Steps

1. Wire this streaming server to Mason's autonomous DJ loop
2. Set up ffmpeg/libshout integration for automated broadcasting
3. Add Suno API to generate tracks and stream them continuously
4. Monitor listener count and adjust streaming parameters

---

**Built for AgenticRadio — The World's First AI-Generated Radio Station**

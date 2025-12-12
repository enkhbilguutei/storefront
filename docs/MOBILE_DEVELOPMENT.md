# 📱 Mobile Local Development Guide

## Quick Start

```bash
# Setup for mobile access
pnpm mobile:setup

# Start desktop dev server (localhost-only)
pnpm dev

# Start mobile dev server (LAN-accessible)
pnpm dev:mobile

# When done, restore localhost-only settings
pnpm mobile:restore
```

## What Does This Do?

The mobile development script automatically configures your local servers to be accessible from mobile devices on the same WiFi network by:

1. **Detecting your local IP address** (e.g., 192.168.1.100)
2. **Updating CORS settings** in backend to allow mobile requests
3. **Configuring Next.js** to use the network IP instead of localhost
4. **Creating backups** of your environment files before making changes

## Commands

### Setup Mobile Development
```bash
pnpm mobile:setup
# or
./scripts/mobile-dev.sh setup
```
This configures your environment for mobile access.

### Generate QR Codes for Easy Access
```bash
pnpm mobile:qr
# or
./scripts/mobile-qr.sh
```
Generates QR codes you can scan with your mobile device to quickly access:
- Storefront
- Admin panel

Optional: Install `qrencode` for terminal QR codes:
```bash
brew install qrencode  # macOS
apt install qrencode   # Linux
```

### Start Development Servers
```bash
pnpm dev
```
After running `mobile:setup`, your dev servers will be accessible at:
- **Storefront (mobile)**: `http://<your-ip>:3001`
- **Backend API**: `http://<your-ip>:9000`
- **Admin Panel**: `http://<your-ip>:9000/app`

### Restore Local-Only Configuration
```bash
pnpm mobile:restore
# or
./scripts/mobile-dev.sh restore
```
Reverts settings back to localhost-only access.

### Get Your Local IP
```bash
./scripts/mobile-dev.sh ip
```

## What Gets Changed?

### Backend Environment (`backend/.env`)
```bash
# Before
STORE_CORS=http://localhost:8000,http://localhost:3000
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:8000,http://localhost:3000

# After (example with IP 192.168.1.100)
STORE_CORS=http://localhost:8000,http://localhost:3000,http://192.168.1.100:3000
ADMIN_CORS=http://localhost:5173,http://localhost:9000,http://192.168.1.100:9000
AUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:8000,http://localhost:3000,http://192.168.1.100:3000,http://192.168.1.100:9000
MEDUSA_BACKEND_URL=http://192.168.1.100:9000
```

### Storefront Environment (`storefront/.env.local`)
```bash
# Before
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXTAUTH_URL=http://localhost:3000

# After (example with IP 192.168.1.100)
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://192.168.1.100:9000
NEXTAUTH_URL=http://192.168.1.100:3001
```

## Troubleshooting

### Mobile Device Can't Connect

1. **Verify same WiFi network**: Ensure your mobile device and computer are on the same WiFi
2. **Check firewall**: macOS firewall may block incoming connections
   ```bash
   # Temporarily disable firewall (macOS)
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
   ```
3. **Restart servers**: After running `mobile:setup`, restart with `pnpm dev`

### IP Address Changed

If your local IP changes (e.g., reconnected to WiFi):
```bash
pnpm mobile:setup  # Re-run setup with new IP
pnpm dev           # Restart servers
```

### Auth/Cookie Issues

Mobile browsers may have stricter security settings. If you experience auth issues:
- Use the same browser on mobile that you tested with on desktop
- Clear mobile browser cache and cookies
- Try incognito/private mode first

### Can't Auto-Detect IP

The script will prompt you to manually enter your IP. To find it:

**macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
```

**Linux:**
```bash
ip addr show
# Look for inet under your network interface
```

## Testing Mobile Features

### Test Responsive Design
Access the site from various mobile devices to test:
- Touch interactions
- Mobile navigation
- Responsive layouts
- Mobile payment flows (QPay)

### Test on Real Devices
- iOS Safari
- Chrome on Android
- Different screen sizes (phones, tablets)

### Browser DevTools Mobile Emulation
While not a replacement for real devices, it's useful for quick checks:
1. Open Chrome DevTools (F12)
2. Click the device toolbar icon (or Ctrl+Shift+M)
3. Select a device preset or set custom dimensions

## Security Notes

- **Local network only**: Your servers are only accessible on your local network
- **No HTTPS**: Mobile development uses HTTP (not secure for production)
- **Backups created**: Original environment files are backed up with timestamps
- **Easy restore**: Run `pnpm mobile:restore` to revert all changes

## Advanced Usage

### Manual Configuration

If you prefer manual setup, edit these files:

**backend/.env:**
```bash
STORE_CORS=http://localhost:3000,http://<YOUR_IP>:3000
ADMIN_CORS=http://localhost:9000,http://<YOUR_IP>:9000
AUTH_CORS=http://localhost:3000,http://<YOUR_IP>:3000,http://<YOUR_IP>:9000
MEDUSA_BACKEND_URL=http://<YOUR_IP>:9000
```

**storefront/.env.local:**
```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://<YOUR_IP>:9000
NEXTAUTH_URL=http://<YOUR_IP>:3000
```

### Custom Port Configuration

If you're using custom ports, update the script at `scripts/mobile-dev.sh` or manually configure environment files.

## Tips

1. **Pin your IP**: Configure your router to assign a static IP to your development machine to avoid frequent changes
2. **Use QR codes**: Generate a QR code for your mobile URL for quick access
3. **Network monitoring**: Use tools like Charles Proxy or Proxyman to inspect mobile traffic
4. **Keep servers running**: Don't restart servers unless necessary - they maintain state

## Related Documentation

- [Next.js Environment Variables](https://nextjs.org/docs/app/api-reference/config/next-config-js/env)
- [Medusa CORS Configuration](https://docs.medusajs.com/resources/references/medusa-config)
- [Network Debugging on Mobile](https://developers.google.com/web/tools/chrome-devtools/remote-debugging)

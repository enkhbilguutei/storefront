# 📱 Mobile Development - Quick Reference

## Setup (One Time)

```bash
pnpm mobile:setup
```

## Start Dev Servers

```bash
pnpm dev
```

Your servers will be available at:
- 📱 Storefront (mobile): `http://<your-ip>:3001`
- 🔧 Backend: `http://<your-ip>:9000`
- ⚙️ Admin: `http://<your-ip>:9000/app`

## Quick Mobile Access (QR Codes)

```bash
pnpm mobile:qr
```

Scan the QR code with your phone for instant access!

## Restore Localhost

```bash
pnpm mobile:restore
```

## Tips

✓ **Same WiFi**: Ensure mobile and computer on same network  
✓ **Restart required**: Run `pnpm dev` after setup  
✓ **IP changed?**: Re-run `pnpm mobile:setup`  
✓ **Backups saved**: Original files backed up automatically  

See [docs/MOBILE_DEVELOPMENT.md](./MOBILE_DEVELOPMENT.md) for full guide.

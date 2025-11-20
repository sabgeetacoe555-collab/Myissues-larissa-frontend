# 🚀 Larissa Interface - Quick Reference

## 📦 Installation (First Time)
```bash
npm install
copy .env.local.example .env.local
# Edit .env.local with your Volcano SDK credentials
npm run dev
```

## 🔑 Required Environment Variables
```env
VOLCANO_BASE_URL=https://your-volcano-proxy-url.com
VOLCANO_API_KEY=your_api_key_here
```

## 🛠️ Common Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run type-check   # Check TypeScript errors
```

## 🐳 Docker Commands
```bash
docker-compose up --build    # Build and start
docker-compose down          # Stop and remove
docker-compose logs -f       # View logs
```

## 🌐 URLs
- **Local Dev**: http://localhost:3000
- **Chat API**: http://localhost:3000/api/chat
- **Router API**: http://localhost:3000/api/router
- **Accountant API**: http://localhost:3000/api/accountant
- **Browser API**: http://localhost:3000/api/browser

## 📁 Key Files
- **Main UI**: `components/ChatUI.tsx`
- **SDK Wrapper**: `lib/volcano.ts`
- **API Routes**: `app/api/*/route.ts`
- **Config**: `next.config.js`, `.env.local`
- **Styles**: `app/globals.css`, `tailwind.config.js`

## 🔧 Troubleshooting
| Issue | Solution |
|-------|----------|
| Module not found | Run `npm install` |
| Port 3000 in use | Change port or kill process |
| API errors | Check `.env.local` credentials |
| Build fails | Run `npm run type-check` |
| Docker fails | Check `docker-compose.yml` |

## 📝 Testing API Endpoints
```powershell
# PowerShell
Invoke-RestMethod -Uri http://localhost:3000/api/chat `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"message":"Hello!"}'
```

```bash
# curl
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!"}'
```

## 🎨 Customization Quick Tips
- **Colors**: Edit `tailwind.config.js` → `theme.extend.colors.primary`
- **Layout**: Edit `components/ChatUI.tsx`
- **Styling**: Edit `app/globals.css`
- **API Logic**: Edit files in `app/api/*/route.ts`
- **SDK Functions**: Edit `lib/volcano.ts`

## 📚 File Structure
```
larissa-interface/
├── app/               # Next.js app router
│   ├── api/          # API endpoints
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── components/        # React components
├── lib/              # Utilities & SDK
├── public/           # Static assets
├── Dockerfile        # Docker config
├── .env.local        # Environment (create this!)
└── package.json      # Dependencies
```

## ⚡ Performance Tips
- Use Edge runtime (already configured)
- Enable streaming for long responses
- Implement caching if needed
- Optimize images in `public/`
- Monitor bundle size with `npm run build`

## 🔐 Security Checklist
- [ ] Never commit `.env.local`
- [ ] Use HTTPS in production
- [ ] Rotate API keys regularly
- [ ] Validate all inputs (already done)
- [ ] Enable rate limiting (add if needed)

## 🎯 Next Steps
1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Start dev server
4. ⬜ Test chat functionality
5. ⬜ Customize UI (optional)
6. ⬜ Deploy to production

## 📞 Need Help?
- Check `README.md` for detailed docs
- Review `PROJECT_SUMMARY.md` for overview
- See `CHECKLIST.md` for complete status
- Inspect code comments in files

---

**Quick Start**: `npm install && npm run dev`  
**Quick Docker**: `docker-compose up --build`  
**Documentation**: See `README.md`

🎉 **Happy Coding!**

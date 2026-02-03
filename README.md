# TradeTax - UK Sole Trader Finance App

A simple, privacy-focused finance tracker for UK sole traders.

## Features

- 📝 Quick income/expense logging (3 seconds)
- 📷 Receipt scanning with auto-categorisation
- 🧮 Real-time UK tax calculator
- 📊 Financial summary dashboard
- 📤 CSV export for accountants
- 🍎 Apple Watch integration
- 🔒 Private by default (data on device)

## Tech Stack

- **Framework:** React Native + Expo
- **Database:** Supabase (optional) / AsyncStorage (local)
- **UI:** React Native Paper
- **AI Coding:** Claude Code / Cursor
- **Hosting:** Vercel (free)
- **Database:** Supabase (free tier)

## Quick Start

### 1. Install on Mac

```bash
# Clone the project
cd /path/to/TradeTax

# Install dependencies
npm install

# Start development server
npx expo start
```

### 2. Run on iPhone

1. Download "Expo Go" from App Store
2. Scan QR code from terminal
3. App loads instantly!

## Project Structure

```
TradeTax/
├── App.js                    # Main app with navigation
├── index.js                  # Entry point
├── package.json              # Dependencies
├── app-tabs/
│   ├── HomeScreen.tsx        # Dashboard
│   ├── IncomeScreen.tsx      # Add income
│   ├── ExpensesScreen.tsx    # Add expense
│   └── SettingsScreen.tsx    # Settings & export
├── app-lib/
│   ├── supabase.ts           # Database client
│   ├── tax.ts                # UK tax calculations
│   └── storage.ts            # Local storage (AsyncStorage)
├── app-types/
│   └── index.ts              # TypeScript types
└── assets/
    └── (images, fonts)
```

## Required Dependencies

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs \
  react-native-paper @supabase/supabase-js \
  react-native-safe-area-context react-native-screens \
  @react-native-async-storage/async-storage \
  expo-file-system expo-sharing react-native-vector-icons
```

## Setting Up Supabase (Optional)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run SQL:
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```
4. Copy URL and anon key to `app-lib/supabase.ts`

## Building for App Store

### Option 1: EAS Build (Free Tier)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for iOS
eas build --platform ios --profile preview
```

### Option 2: Local Build (Requires Mac)

```bash
# Build for simulator
xcodebuild -workspace TradeTax.xcworkspace -scheme TradeTax -configuration Debug -sdk iphonesimulator

# Or use Expo
eas build --platform ios --local
```

## AI Coding Setup

### Using Claude Code

```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Run in project folder
claude-code
```

### Using Cursor

1. Download [Cursor IDE](https://cursor.sh)
2. Open TradeTax folder
3. Use Cmd+K to generate code

### Example Prompts

```
"Create a screen for adding income with amount input, 
category dropdown, and save button"

"Fix this error: [paste error log]"

"Add dark mode support to the app theme"
```

## App Store Submission

1. Create Apple Developer Account (£99/year)
2. Set up App Store Connect
3. Upload build via Xcode or Transporter
4. Fill in app metadata
5. Submit for review

## Roadmap

### MVP (Week 1-2)
- [x] Income logging
- [x] Expense logging
- [x] Receipt scanning (basic)
- [x] Tax calculator
- [x] CSV export

### Version 1.1 (Week 3-4)
- [ ] Bank integration (Plaid)
- [ ] Invoice builder
- [ ] Subscription paywall
- [ ] Apple Watch app

### Version 2.0 (Month 2)
- [ ] VAT tracking
- [ ] Multi-currency
- [ ] Accountant portal
- [ ] Android release

## Revenue Projections

| Month | Downloads | Subscribers | MRR |
|-------|-----------|-------------|-----|
| 1 | 500 | 25 | £75 |
| 3 | 2,000 | 140 | £420 |
| 6 | 10,000 | 800 | £2,400 |
| 12 | 50,000 | 5,000 | £15,000 |

## Costs (Year 1)

| Item | Cost |
|------|------|
| Apple Developer | £99 |
| Google Play | £25 |
| Hosting | £0 |
| **Total** | **£124** |

## License

MIT License - Build what you want!

---

Built with ❤️ by James and Marv

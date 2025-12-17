# Mint Prints - Print Shop Management System

A comprehensive dashboard for custom apparel print shops to manage quotes, jobs, customers, inventory, and production workflows.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`

## 📚 Documentation

### Core Documentation
- **[API_DOCS_INDEX.md](API_DOCS_INDEX.md)** - 📍 Navigation guide for all API docs
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Complete project documentation
- **[PRD.md](PRD.md)** - Product requirements & design philosophy
- **[API_ARCHITECTURE.md](API_ARCHITECTURE.md)** - Visual architecture & flow diagrams
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference & integration guide
- **[API_SETUP_GUIDE.md](API_SETUP_GUIDE.md)** - Step-by-step API setup instructions
- **[API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)** - Developer cheat sheet

### Support Documentation
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues & solutions
- **[SECURITY.md](SECURITY.md)** - Security best practices
- **[AUDIT.md](AUDIT.md)** - Code audit logs

## ✨ Features

- **Quote Management** - Create, send, and track customer quotes
- **Job Production** - Convert quotes to jobs with artwork approval workflows
- **Customer Management** - Track customer history, artwork libraries, and preferences
- **Product Catalog** - S&S Activewear & SanMar API integration
- **Purchase Orders** - Consolidate orders and track inventory receiving
- **Payment Tracking** - Record payments and send automated reminders
- **Email Templates** - Customizable notifications for all events
- **Pricing Rules** - Automatic discounts based on customer tier and volume
- **Reports & Analytics** - Revenue metrics, customer rankings, and more

## 🔧 Technology Stack

- **React 19.2.0** + **TypeScript 5.7.3**
- **Vite 7.2.6** - Build tool
- **Tailwind CSS 4.1.17** - Styling
- **shadcn/ui v4** - Component library
- **Spark Runtime** - Persistent storage & AI features

## 📖 API Integration

### Supplier APIs
- **S&S Activewear** - Product catalog & inventory
- **SanMar** - Product catalog & inventory

### Spark Runtime
- **KV Store** - Persistent data storage
- **LLM API** - AI-powered features
- **User API** - GitHub user integration

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete details.

## 🎨 Design

Dark-mode first design with Apple Pro App aesthetics. High contrast, premium feel, refined interactions.

**Theme Colors:**
- Primary: Emerald (`oklch(0.7 0.17 166)`)
- Background: Dark Slate (`oklch(0.15 0.01 249)`)
- Accent: Bright Emerald (`oklch(0.78 0.15 166)`)

## ⌨️ Keyboard Shortcuts

- `Cmd+N` - New quote/job (context-aware)
- `Cmd+S` - Save quote/job
- `Cmd+K` - Focus search
- `Cmd+1-7` - Navigate views
- `Shift+?` - Show shortcuts
- `Esc` - Close modals/exit views

## 🛠️ Development

### Adding Features
1. Update [PRD.md](PRD.md) with feature spec
2. Add types to `/src/lib/types.ts`
3. Create component in `/src/components/`
4. Wire to `App.tsx`
5. Test keyboard navigation and persistence

### State Management
Always use functional updates with `useKV`:

```typescript
// ✅ CORRECT
setQuotes((current) => [...current, newQuote])

// ❌ WRONG - Will cause data loss
setQuotes([...quotes, newQuote])
```

### Styling
- Tailwind first
- Use theme variables from `index.css`
- Mobile-first responsive design
- No inline styles

## 📊 Data Persistence

All data stored in Spark KV store. No external database required.

**Storage Keys:**
- `quotes` - All customer quotes
- `jobs` - All production jobs
- `customers` - All customer records
- `purchase-orders` - Supplier purchase orders
- And 15+ more (see [DOCUMENTATION.md](DOCUMENTATION.md))

## 🔐 Security

- API credentials stored in Spark KV (encrypted)
- No secrets in source code
- Customer data persisted locally
- See [SECURITY.md](SECURITY.md) for details

## 📝 License

MIT License - Copyright (c) 2024

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

---

**Version**: 1.0.0 (46 iterations)  
**Last Updated**: 2024  
**Maintained By**: Mint Prints Development Team

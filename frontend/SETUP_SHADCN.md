# shadcn/Tailwind/TypeScript Environment Setup

## Environment Check Results

### ✅ Current Status

1. **Base Path**: `src/` folder exists
   - BASE = "src"
   - COMPONENT_DIR = "src/components/ui" ✅ (already exists)

2. **Framework**: Vite + React + TypeScript ✅
   - This is NOT a Next.js project
   - Using Vite as build tool
   - TypeScript is already configured

3. **Tailwind CSS**: ✅ Installed
   - `tailwind.config.js` exists
   - Global CSS has Tailwind directives
   - ⚠️ Needs content paths update (see below)

4. **TypeScript**: ✅ Configured
   - `tsconfig.json` exists
   - Path aliases already set up (`@/*` → `./src/*`)
   - Vite config has matching aliases

5. **shadcn**: ❌ Not initialized
   - No `components.json` found
   - Need to initialize

6. **Dependencies**: ⚠️ Some missing
   - ✅ `lucide-react` - installed
   - ✅ `class-variance-authority` - installed
   - ✅ `framer-motion` - installed
   - ❌ `@radix-ui/react-slot` - missing
   - ❌ `@radix-ui/react-checkbox` - missing
   - ❌ `@radix-ui/react-label` - missing

---

## Setup Instructions

### Step 1: Update Tailwind Config

Update `tailwind.config.js` to include all content paths:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ... your existing theme config
    },
  },
  plugins: [],
}
```

### Step 2: Install Missing Dependencies

Run this command to install all required packages:

```bash
npm install lucide-react @radix-ui/react-slot class-variance-authority @radix-ui/react-checkbox @radix-ui/react-label framer-motion
```

**Note**: `lucide-react`, `class-variance-authority`, and `framer-motion` are already installed, but the command will skip them.

### Step 3: Initialize shadcn

Since this is a Vite project (not Next.js), you'll need to manually set up shadcn:

1. **Create `components.json`** in the root directory:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

2. **Create utility file** for `cn()` function:

Create `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

3. **Ensure `src/components/ui` directory exists**:
   - ✅ Already exists at `src/components/ui/`

### Step 4: Verify Path Aliases

Your `tsconfig.json` already has:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Your `vite.config.ts` already has matching aliases. ✅

### Step 5: Verify Global CSS

Your `src/index.css` already contains:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
✅

---

## Summary

### ✅ Already Configured:
- TypeScript setup
- Path aliases (`@/*`)
- Tailwind CSS installed
- Global CSS with Tailwind directives
- Component directory exists (`src/components/ui`)
- Vite configured with path aliases

### ⚠️ Needs Action:
1. Update `tailwind.config.js` content paths (add `./components/**/*` and `./pages/**/*`)
2. Install missing Radix UI packages
3. Create `components.json` for shadcn
4. Create `src/lib/utils.ts` for `cn()` utility

---

## Next Steps

After completing the setup above, you can:

1. **Add shadcn components** using:
   ```bash
   npx shadcn-ui@latest add [component-name]
   ```

2. **Or manually create components** in `src/components/ui/`

3. **Components will be available** via:
   ```typescript
   import { Button } from "@/components/ui/button"
   ```

---

## Quick Setup Commands

Run these commands in order:

```bash
# 1. Install missing dependencies
npm install @radix-ui/react-slot @radix-ui/react-checkbox @radix-ui/react-label

# 2. Create lib/utils.ts (if not exists)
mkdir -p src/lib
# Then create src/lib/utils.ts with the cn() function (see above)

# 3. Create components.json (see content above)

# 4. Update tailwind.config.js content paths (see above)
```

**Setup complete! Now you can add shadcn components to `src/components/ui/`**


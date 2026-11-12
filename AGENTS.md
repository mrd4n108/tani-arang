<laravel-boost-guidelines>
# Laravel Application

This repository contains a Laravel application. Complete the following setup before working on the user's request.

## Prerequisites

Verify that PHP and Composer are available:

```sh
php -v
composer -V
```

If either command is unavailable, detect the user's operating system and install the prerequisites with the appropriate command:

macOS:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.5)"
```

Windows PowerShell:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.5'))
```

Linux:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"
```

After installation, ask the user to restart their terminal. If the agent needs the restarted shell to continue, ask the user to reopen their terminal and rerun their original prompt.

## Agent Setup

Install Laravel Boost from the application root before making application changes:

```sh
composer require laravel/boost --dev
php artisan boost:install
```

Boost replaces these bootstrap instructions with guidelines tailored to the application. After installation, read `AGENTS.md` again and continue with the user's original request using the generated guidelines.
</laravel-boost-guidelines>

# MANDATORY FRONTEND RULES (ALWAYS ACTIVE FOR UI/FRONTEND WORK)

Whenever working on frontend code (including Blade templates in `resources/views`, CSS in `resources/css`, React/Inertia components in `resources/js`, layouts, pages, or Tailwind config), you MUST ALWAYS load, activate, and strictly follow the 5 core frontend skills:
1. **ponytail**: Simplest, cleanest, shortest code. YAGNI. Platform & standard Tailwind features before custom bloated scripts.
2. **ui-ux-pro-max**: Rigorous design systems, cohesive colors, purposeful typography scales, and WCAG AA accessibility.
3. **impeccable**: High-craft execution, purposeful mode alignment (Operate vs Persuade), state polish (hover/active/focus/empty/loading), and crisp layout rhythm.
4. **frontend-design**: Root aesthetics deeply in TaniArang's agricultural & biochar domain (carbon, soil, foliage, organic clarity) rather than generic tech templates.
5. **anti-slop**: Zero AI design clichés — eliminate excessive frosted glass, glowing orbs, indiscriminate pill shapes, over-used neon pulses, and unnecessary 3D tilt novelties.


<!-- frontend-skills:start -->
# Frontend Design & Engineering Rules (Always Active on Frontend)

Whenever working on frontend tasks (HTML, CSS, Tailwind CSS, Blade templates, React, Vue, Inertia.js, JavaScript/TypeScript components, views, UI layouts, pages, and interactive features), you MUST ALWAYS activate and adhere strictly to the following 5 integrated skills:

1. **`ponytail`** (`.agents/skills/ponytail/SKILL.md`):
   - **Radical Simplicity & YAGNI**: Reject speculative features, over-abstraction, and unnecessary component splitting.
   - **Reuse Over Reinvention**: Check existing components, Tailwind utility classes, and project helpers before adding new code.
   - **Native Web Features**: Favor native HTML elements (`<dialog>`, `<input type="date">`, HTML5 validation) and native CSS over bulky third-party libraries.
   - **Minimum Diff**: Write the tightest, cleanest code that satisfies requirements.

2. **`ui-ux-pro-max`** (`.agents/skills/ui-ux-pro-max/SKILL.md`):
   - **Accessibility (Priority 1)**: Minimum WCAG AA 4.5:1 text-to-background contrast; all interactive controls must have visible `:focus-visible` rings; all icon buttons must have `aria-label`.
   - **Touch & Targets (Priority 2)**: Minimum 44x44px touch targets with >= 8px spacing on mobile.
   - **Mobile-First Layout**: Design responsive layouts starting from mobile viewports (375px) upwards; strictly avoid horizontal scroll (`overflow-x`).
   - **Systematic Spacing & Type**: Consistent 4px/8px spacing grid; base font size >= 16px for body copy.

3. **`impeccable`** (`.agents/skills/impeccable/SKILL.md`):
   - **Craft Floor**: Deliver complete, polished, production-grade interfaces without shortcuts.
   - **Surface Mode Awareness**:
     - *Persuade* (Landing pages, showcases): Bold, memorable visual identity and hero experience.
     - *Operate* (Dashboards, admin, data tables): High scannability, native affordances, calm precision.
     - *Read* (Documentation, content): Optimized typography, readability (< 80 char line length).
   - **Comprehensive States**: Every interactive component must cleanly handle Loading, Empty, Error, and Success states.

4. **`frontend-design`** (`.agents/skills/frontend-design/SKILL.md`):
   - **Bespoke Character**: Ground UI aesthetics in the project's actual subject matter (e.g., Tani Arang: agriculture, biochar, carbon credits, eco-sustainability).
   - **Reject AI Templates**:
     - Do NOT use generic warm cream + terracotta or near-black + acid-neon defaults.
     - Do NOT use the generic "SaaS card kit" (identical rounded cards with identical faint gray blur shadows).
     - Do NOT scatter tracked-out all-caps badges above every heading.
   - **Intentional Copy**: Active, descriptive verbs for CTAs ("Kirim Laporan", "Simpan Perubahan"); clear, human feedback messages.

5. **`anti-slop`** (`.agents/skills/anti-slop/SKILL.md`):
   - **The Purpose Test**: Every gradient, shadow, border, badge, and animation must serve an articulated functional or hierarchy purpose. If it's just decorative filler, remove it.
   - **Hard Gates**:
     - Absolutely NO em dashes (`—`) in UI copy.
     - Absolutely NO non-functional buttons or dead placeholder links.
     - Absolutely NO gratuitous stacked trends (e.g., glassmorphism + mesh gradient + floating glow orbs + dot grids).
     - Absolutely NO fake statistics or fabricated trust badges.
     - Absolutely NO nested cards-inside-cards ("Russian doll" layout).
<!-- frontend-skills:end -->


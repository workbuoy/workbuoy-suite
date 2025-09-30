## Unreleased

- Add: Include `@rollup/rollup-linux-x64-gnu` dev dependency so CI has a native Rollup build available for Vitest/Storybook runs.
- Fix: Ensure `ROLLUP_SKIP_NODEJS_NATIVE`/`ROLLUP_SKIP_NATIVE` are set before Vitest and Storybook load Rollup to prefer the JS fallback.
- Fix: Vitest/Storybook use Rollup JS fallback in CI; add framer-motion devDependency.
- Improved: FlipCard and ProactivitySwitch expose richer accessibility affordances (roles, focus rings, reduced motion) and ship matching Storybook docs.
- Feat: Added `BuoyDock`, a fixed dock widget combining chat (front) and Navi (back) with accessible flip/expand controls and reduced-motion aware animations.
- Docs: Storybook + README document the BuoyDock keyboard model, focus trap, and usage as a chat/Navi launcher.

## PR9 – Release & polish

### Features
- Introduced `FlipCard` for animated two-sided content reveals.
- Added `ProactivitySwitch` with controlled and uncontrolled modes for navigation between proactive/reactive workflows.

### Docs
- Documented component usage patterns directly in the package README.

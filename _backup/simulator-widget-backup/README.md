# Simulator & Widget Backup

**Date:** 2026-03-02
**Reason:** Temporarily removed from production site for future use

## Backed Up Components

### Attack Simulator
- `src/components/attack-simulator/` - AttackSimulatorWidget, NetworkTopologyDiagram, PhaseStepperBar, PhaseDetailPanel
- `src/hooks/useAttackSimulatorData.js` - Supabase data hook
- `src/pages/admin/SimulatorEditor.jsx` - Admin editor

### Tactic Widgets
- `src/components/tactic-widgets/` - TacticWidgetTemplate, AnimationPresets, GlossarySidebar
- `src/pages/admin/widget-editor/` - WidgetFormEditor, AttackCaseForm, etc.
- `src/data/tactic-widgets/` - 14 tactic JSON data files (t1~t14)

### Animation Lab (워크플로우 페이지)
- `src/pages/lab/AnimationLab.jsx` - Widget/Simulator playback page (route: /lab/animation/:id)

## Supabase Tables (NOT deleted)
- `widget_data` - Widget JSON data per tactic
- `attack_simulator` - Simulator phase data per sub-technique

## To Restore
1. Copy files back to original paths
2. Re-add imports in AdminPage.jsx
3. Restore AnimationLab.jsx to `src/pages/lab/`
4. Re-add `const AnimationLab = lazy(() => import('./pages/lab/AnimationLab'))` in App.jsx
5. Re-add `<Route path="/lab/animation/:id" element={<AnimationLab />} />` in App.jsx
6. Re-add admin TABS entries for 'simulator' and 'widgets' in AdminPage.jsx
7. Re-add widget loading logic in IntroMatrix.jsx workflow (if needed)

# Orion Echo V2 Visualization

This directory contains visualization-only specifications for the Orion Echo V2 scenario.

Scenario and red-team flow decisions live one level up in `v2`. Renderer behavior, layout rules, visual language, component mapping, and implementation guidance live here.

## Documents

- `01_orion_2_visualization_requirements.md` - product-level visualization requirements.
- `02_orion_2_renderer_spec.md` - renderer, layout, and data-shape specification.
- `03_stage_narrative_and_detail_template.md` - red-team stage copy and southern 3D detail content template.

## Scope

The visualization should present one screen with:

- a network topology view as the primary spatial model
- a southern active-stage detail bay for services, components, evidence, and trust relationships
- stage controls that update both views together

The original `/three/orion` view should remain available for comparison. V2 visualization work should target `/three/orion_2`.

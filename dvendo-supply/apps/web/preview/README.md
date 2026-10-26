# Editable UI preview

The selected current UI is imported from the agreed role redesign, with its original typography and custom mark. It is a synthetic prototype, not the live application.

- `supplier-redesign-model.js`: fictional SIMs, planning state and forecast calculations.
- `supplier-redesign-ui.js`: role-based rendering and demo interactions.
- `supplier-redesign.css`: current redesign styles.
- `base/`: selected original theme styles used by the renderer.
- `fonts/`: local Inter fonts and their SIL Open Font License.
- `dvendo-supply-mark.svg`: selected custom mark.

Run `npm run build` from the project root after edits. The [builder](../../../scripts/build-preview.mjs) embeds the sources into [the public page](../public/index.html); it uses no files outside this project. The preview's CSP blocks API and other network requests. Replacing demo roles, state and UI actions with authenticated backend operations is a later phase.

The model is a legacy-compatible CommonJS/browser script; this subdirectory's package setting preserves that behavior for its imported tests while the API and tooling use ES modules. Do not introduce additional parallel preview variants.

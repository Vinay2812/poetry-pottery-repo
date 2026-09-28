# Architecture diagram sources

Every page in `architecture/` except `index.html` is rendered by the Archify skill from the JSON here.
Edit the JSON, never the HTML.

```bash
A=~/.agents/skills/archify/bin/archify.mjs      # installed with: npx skills add tt-a1i/archify -g
node $A validate <type> architecture/specs/<page>.<type>.json --quality showcase --json
node $A deliver  <type> architecture/specs/<page>.<type>.json architecture/<page>.html --quality showcase --json
node $A visual-check architecture/<page>.html --json   # sidecars are gitignored
```

A page is accepted when `validate` reports 9 of 9 checks with no composition errors or warnings,
`deliver` exits 0, and `visual-check` passes at 1440×900, 1600×1000, 1920×1080 and 2048×1320.
Keep the viewBox at most 1080 wide so node text stays readable on a laptop, and keep the diagram
short enough that the cards still fit on a 1440×900 screen.

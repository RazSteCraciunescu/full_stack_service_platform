# Accessibility notes

Accessibility is treated as part of the implementation rather than a decorative checklist.

## Included patterns

- A skip link moves focus to the main content.
- Navigation, main content, sections, tables and forms use semantic elements.
- Inputs have programmatic labels; placeholder text is not the only label.
- The request table uses column headers and scope attributes.
- The create form uses the native `<dialog>` element.
- The request detail drawer exposes dialog semantics when open.
- Loading, result-count and toast regions use appropriate live-region behavior.
- Validation sets `aria-invalid` and moves focus to the first invalid field.
- Buttons have text or accessible names.
- Visible focus styles are retained.
- Layouts reflow for smaller screens instead of relying on fixed desktop widths.
- Reduced-motion preferences disable non-essential transitions.
- Status and priority information is presented with text, not color alone.

## Known limitations

- The detail drawer does not implement a complete focus trap. It moves focus to the close button and supports Escape, but a production implementation should contain tab focus until the drawer closes and restore focus to the triggering row.
- The analytics chart is represented by labeled rows and counts rather than a canvas, but it does not provide a separate long description.
- Automated accessibility scanning is not bundled into the zero-dependency path.

## Suggested checks

1. Navigate the complete create and update flow using Tab, Shift+Tab, Enter, Space and Escape.
2. Test at 200% browser zoom.
3. Use a screen reader to verify dialog names, table headers and live feedback.
4. Run axe or Lighthouse after installing the preferred browser tooling.
5. Verify contrast after changing any design token.

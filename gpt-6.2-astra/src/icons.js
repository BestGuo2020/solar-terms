const paths = {
  orbit:
    '<ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-32 12 12)"/><circle cx="12" cy="12" r="2"/><circle cx="19.4" cy="6.2" r="1.5" fill="currentColor"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M7.5 3v4m9-4v4m-13 3h17"/>',
  sliders:
    '<path d="M3 7h6m4 0h8M3 17h10m4 0h4"/><circle cx="11" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
  reset: '<path d="M4 10a8 8 0 1 1 .5 6M4 4v6h6"/>',
  chevron: '<path d="m8 10 4 4 4-4"/>',
  next: '<path d="m9 5 7 7-7 7"/>',
  prev: '<path d="m15 5-7 7 7 7"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  play: '<path d="m8 4 12 8-12 8z" stroke-width="0" fill="currentColor"/>',
  pause: '<path d="M7 5v14m10-14v14" stroke-width="4"/>',
  expand: '<path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5"/>',
  book: '<path d="M3 5c4-1 7-.5 9 2 2-2.5 5-3 9-2v14c-4-1-7-.5-9 2-2-2.5-5-3-9-2zm9 2v14"/>',
  leaf: '<path d="M5 19C1 8 10 5 21 3c-3 11-5 18-14 14m-2 4L16 9"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  close: '<path d="m6 6 12 12m0-12L6 18"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  layers: '<path d="m2 8 10-5 10 5-10 5zm1 5 9 5 9-5m-18 5 9 4 9-4"/>',
  crosshair:
    '<circle cx="12" cy="12" r="7"/><path d="M12 1v5m0 12v5M1 12h5m12 0h5"/>',
  drag: '<path d="M12 3v18M3 12h18M9 6l3-3 3 3m-6 12 3 3 3-3M6 9l-3 3 3 3m12-6 3 3-3 3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v2"/>',
  snow: '<path d="M12 2v20M3.3 7l17.4 10m-17.4 0L20.7 7M9 4l3 3 3-3M9 20l3-3 3 3"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16.5 7.5-3 6-6 3 3-6z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  music:
    '<path d="M10 18V6l10-2v12"/><ellipse cx="7" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',
};
export function icon(name, size = 16) {
  return (
    '<svg aria-hidden="true" class="icon" width="' +
    size +
    '" height="' +
    size +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    (paths[name] || "") +
    "</svg>"
  );
}

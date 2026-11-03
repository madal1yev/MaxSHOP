export const Ms = ({ name, size = 20, className = '', filled = false }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontSize: size,
      ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}),
    }}
  >
    {name}
  </span>
);

export const MsIcon = {
  location: 'location_on',
  search: 'search',
};

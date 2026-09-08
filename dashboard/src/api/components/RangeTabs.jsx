const RANGES = [
  { key: 'daily', label: 'Day' },
  { key: 'weekly', label: 'Week' },
  { key: 'monthly', label: 'Month' },
  { key: 'yearly', label: 'Year' }
];

export default function RangeTabs({ selected, onSelect }) {
  return (
    <div style={styles.track}>
      {RANGES.map(r => {
        const active = r.key === selected;
        return (
          <button
            key={r.key}
            onClick={() => onSelect(r.key)}
            style={{ ...styles.tab, ...(active ? styles.tabActive : {}) }}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  track: {
    display: 'inline-flex',
    background: 'var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: 4,
    gap: 2
  },
  tab: {
    border: 'none',
    background: 'transparent',
    color: 'var(--ink-soft)',
    fontSize: 14,
    fontWeight: 600,
    padding: '7px 14px',
    borderRadius: 8,
    cursor: 'pointer'
  },
  tabActive: {
    background: 'var(--ink)',
    color: '#fff'
  }
};
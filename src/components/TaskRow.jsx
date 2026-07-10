import './TaskRow.css';

export default function TaskRow({ label, from, to, accent, checked, onToggle }) {
  return (
    <label
      className="task-row"
      style={{
        '--task-from': from,
        '--task-to': to,
        '--task-accent': accent,
      }}
    >
      <input
        type="checkbox"
        className="task-checkbox"
        checked={checked}
        onChange={onToggle}
      />
      <span className="task-check" aria-hidden="true">
        {checked ? '✓' : ''}
      </span>
      <span className={`task-label${checked ? ' task-label--done' : ''}`}>
        {label}
      </span>
    </label>
  );
}

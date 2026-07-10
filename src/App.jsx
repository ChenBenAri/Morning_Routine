import TaskList from './components/TaskList';
import { useRoutine } from './hooks/useRoutine';
import './App.css';

export default function App() {
  const { dayKey, checks, toggleTask, completedCount, total } = useRoutine();

  return (
    <div className="app">
      <section className="progress">
        <p className="progress-text">
          <span className="progress-count">{completedCount}</span>
          <span className="progress-slash"> / </span>
          <span className="progress-total">{total}</span>
        </p>
        <p className="progress-label">completed today</p>
        <p className="progress-key" aria-hidden="true">
          {dayKey}
        </p>
      </section>

      <TaskList checks={checks} onToggle={toggleTask} />

      <footer className="reset-footer">
        Resets daily at 3:00 AM Israel time
      </footer>
    </div>
  );
}

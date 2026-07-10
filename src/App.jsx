import TaskList from './components/TaskList';
import { useRoutine } from './hooks/useRoutine';
import './App.css';

export default function App() {
  const { dayKey, checks, toggleTask, completedCount, total } = useRoutine();

  return (
    <div className="app">
      <div className="app-logo" aria-hidden="true">
        <img
          src={`${import.meta.env.BASE_URL}icons/icon-192.png`}
          alt=""
          className="logo-image"
        />
      </div>

      <section className="progress">
        <p className="progress-text">
          {completedCount} / {total} completed today
        </p>
        <p className="progress-day">Resets daily at 3:00 AM Israel time</p>
        <p className="progress-key" aria-hidden="true">
          {dayKey}
        </p>
      </section>

      <TaskList checks={checks} onToggle={toggleTask} />
    </div>
  );
}

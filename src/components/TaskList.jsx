import { TASKS } from '../data/tasks';
import TaskRow from './TaskRow';
import './TaskList.css';

export default function TaskList({ checks, onToggle }) {
  return (
    <ul className="task-list">
      {TASKS.map((task, index) => (
        <li key={task.id}>
          <TaskRow
            label={task.label}
            from={task.from}
            to={task.to}
            accent={task.accent}
            checked={checks[index]}
            onToggle={() => onToggle(index)}
          />
        </li>
      ))}
    </ul>
  );
}

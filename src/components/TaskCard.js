import React from 'react';
import { format } from 'date-fns';

const statusLabels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };
const priorityLabels = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  return (
    <div className={`task-card priority-${task.priority}`}>
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <button
            className="btn btn-secondary btn-sm"
            title="Edit task"
            onClick={() => onEdit(task)}
          >✏️</button>
          <button
            className="btn btn-danger btn-sm"
            title="Delete task"
            onClick={() => onDelete(task.id)}
          >🗑️</button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-footer">
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className={`badge badge-${task.status.toLowerCase()}`}>
            {statusLabels[task.status]}
          </span>
          <span className={`badge badge-${task.priority.toLowerCase()}`}>
            {priorityLabels[task.priority]}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {task.dueDate && (
            <span className="due-date">
              📅 {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
          {task.status !== 'COMPLETED' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onStatusChange(task.id, task.status === 'TODO' ? 'IN_PROGRESS' : 'COMPLETED')}
              style={{ fontSize: '0.72rem' }}
            >
              {task.status === 'TODO' ? '▶ Start' : '✓ Done'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskApi } from '../services/api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import toast from 'react-hot-toast';

const FILTERS = ['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'];
const filterLabels = { ALL: 'All', TODO: 'To Do', IN_PROGRESS: 'In Progress', COMPLETED: 'Done' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await taskApi.getAll();
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSave = (savedTask, action) => {
    if (action === 'created') {
      setTasks(prev => [savedTask, ...prev]);
      toast.success('Task created! 🎉');
    } else {
      setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t));
      toast.success('Task updated!');
    }
    setShowModal(false);
    setEditingTask(null);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskApi.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskApi.update(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? res.data : t));
      toast.success(newStatus === 'COMPLETED' ? 'Task completed! ✅' : 'Task started!');
    } catch {
      toast.error('Status update failed');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'COMPLETED').length,
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-logo">⚡ TaskMaster</div>
        <div className="nav-user">
          <span className="nav-username">👤 {user?.fullName || user?.username}</span>
          <button className="btn btn-secondary btn-sm" onClick={logout}>
            Sign Out
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Tasks</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">To Do</div>
            <div className="stat-value" style={{ color: 'var(--text-muted)' }}>{stats.todo}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Progress</div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.inProgress}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.done}</div>
          </div>
        </div>

        {/* Board header */}
        <div className="board-header">
          <h2 className="board-title">My Tasks</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="filter-row">
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {filterLabels[f]}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={openCreate}>
              + New Task
            </button>
          </div>
        </div>

        {/* Tasks */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        ) : (
          <div className="tasks-grid">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <div className="empty-text">
                  {filter === 'ALL' ? 'No tasks yet' : `No ${filterLabels[filter]} tasks`}
                </div>
                <div className="empty-sub">
                  {filter === 'ALL' ? 'Create your first task to get started!' : 'Try a different filter'}
                </div>
              </div>
            ) : (
              filtered.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        )}
      </main>

      {showModal && (
        <TaskModal
          task={editingTask}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

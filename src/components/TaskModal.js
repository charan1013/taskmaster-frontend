import React, { useState, useEffect } from 'react';
import { taskApi } from '../services/api';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'TODO',
  dueDate: ''
};

export default function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const isEdit = Boolean(task);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
      });
    }
  }, [task]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAiGenerate = async () => {
    if (!form.title.trim()) {
      toast.error('Enter a task title first!');
      return;
    }
    setAiLoading(true);
    try {
      const res = await taskApi.generateDescription(form.title);
      setForm(prev => ({ ...prev, description: res.data.description }));
      toast.success('AI description generated! ✨');
    } catch (err) {
      toast.error('AI generation failed. Check your API key in backend config.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        ...(isEdit && { status: form.status })
      };

      if (isEdit) {
        const res = await taskApi.update(task.id, payload);
        onSave(res.data, 'updated');
      } else {
        const res = await taskApi.create(payload);
        onSave(res.data, 'created');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              name="title"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Description</label>
              <button
                type="button"
                className="btn btn-ai"
                onClick={handleAiGenerate}
                disabled={aiLoading}
              >
                {aiLoading ? <><span className="spinner" /> Generating...</> : '✨ AI Generate'}
              </button>
            </div>
            <textarea
              className="form-input"
              name="description"
              placeholder="Task description (or use AI to generate it!)"
              value={form.description}
              onChange={handleChange}
              rows={4}
              style={{ resize: 'vertical' }}
            />
            <p className="ai-hint">💡 Enter a title then click "AI Generate" to auto-write the description</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" name="priority" value={form.priority} onChange={handleChange}>
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🔴 High</option>
              </select>
            </div>

            {isEdit && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" name="status" value={form.status} onChange={handleChange}>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                className="form-input"
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
              {loading ? <span className="spinner" /> : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  CheckSquare,
  Plus,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const TasksView: React.FC = () => {
  const { tasks, addTask, toggleTask, staffList, currentUser } = useCRM();

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [assignedFilter, setAssignedFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form
  const [title, setTitle] = useState('');
  const [relatedType, setRelatedType] = useState<'lead' | 'booking' | 'guest' | 'operations'>('lead');
  const [relatedName, setRelatedName] = useState('');
  const [dueDate, setDueDate] = useState('2026-09-18');
  const [assignedTo, setAssignedTo] = useState(currentUser.name);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');

  const filteredTasks = tasks.filter(t => {
    const matchesStatus =
      filter === 'all' || (filter === 'pending' ? !t.completed : t.completed);
    const matchesStaff = assignedFilter === 'all' || t.assignedTo === assignedFilter;
    return matchesStatus && matchesStaff;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      relatedType,
      relatedName,
      dueDate,
      assignedTo,
      priority,
      completed: false
    });

    setTitle('');
    setRelatedName('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900">
              Tasks & Reminders
            </h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
              {tasks.filter(t => !t.completed).length} Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Follow-ups, guest requirements, and operational checklists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="all">All Tasks</option>
          </select>

          <select
            value={assignedFilter}
            onChange={e => setAssignedFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          >
            <option value="all">All Staff</option>
            {staffList.map(s => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 italic bg-zinc-50 rounded-lg">
            No tasks found for current filter.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-colors flex items-start justify-between gap-3 ${
                task.completed
                  ? 'bg-zinc-50 border-zinc-200 opacity-60'
                  : 'bg-white border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors border ${
                    task.completed
                      ? 'bg-zinc-900 border-zinc-900 text-white'
                      : 'border-zinc-300 hover:border-zinc-500 bg-white'
                  }`}
                >
                  {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${
                        task.completed ? 'line-through text-zinc-400' : 'text-zinc-900'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.2 rounded ${
                        task.priority === 'high'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : task.priority === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      <span>Due {formatDate(task.dueDate)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-400" />
                      <span>{task.assignedTo}</span>
                    </span>
                    {task.relatedName && (
                      <span className="text-zinc-700 font-medium">
                        Ref: {task.relatedName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-zinc-400 whitespace-nowrap pt-1">
                {task.completed ? 'Completed' : 'Pending'}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full border border-zinc-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">New Task</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Assign an operational duty or guest reminder</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-zinc-700 block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow up on villa quote with Devraj Oberoi"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-zinc-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="font-medium text-zinc-700 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-zinc-700 block mb-1">Assignee</label>
                  <select
                    value={assignedTo}
                    onChange={e => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    {staffList.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-zinc-700 block mb-1">Related Guest/Lead</label>
                  <input
                    type="text"
                    placeholder="Guest / Suite name"
                    value={relatedName}
                    onChange={e => setRelatedName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-zinc-700 hover:bg-zinc-100 border border-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-xs transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Target, X, Check, Clock } from 'lucide-react';
import './GoalModal.css';

const PRESETS = [
  { label: '4 Hours', seconds: 4 * 3600 },
  { label: '6 Hours', seconds: 6 * 3600 },
  { label: '8 Hours', seconds: 8 * 3600 },
  { label: '10 Hours', seconds: 10 * 3600 },
  { label: '12 Hours', seconds: 12 * 3600 },
];

export default function GoalModal({ isOpen, onClose, currentGoalSeconds, onSave }) {
  if (!isOpen) return null;

  const currentHours = Math.floor(currentGoalSeconds / 3600);
  const currentMinutes = Math.floor((currentGoalSeconds % 3600) / 60);

  const [hours, setHours] = useState(currentHours);
  const [minutes, setMinutes] = useState(currentMinutes);

  const handleSave = (e) => {
    e.preventDefault();
    const totalSec = Math.max(30 * 60, hours * 3600 + minutes * 60);
    onSave(totalSec);
    onClose();
  };

  const selectPreset = (sec) => {
    setHours(Math.floor(sec / 3600));
    setMinutes(Math.floor((sec % 3600) / 60));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card goal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header__identity">
            <div className="goal-modal__icon">
              <Target size={22} />
            </div>
            <div>
              <h2 className="modal-title">Daily Screen Time Goal</h2>
              <p className="goal-modal__subtitle">
                Set your target active screen-time limit for today.
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="goal-modal__presets">
          {PRESETS.map((p) => {
            const isSelected = hours * 3600 + minutes * 60 === p.seconds;
            return (
              <button
                key={p.seconds}
                type="button"
                className={`goal-preset-btn ${isSelected ? 'goal-preset-btn--active' : ''}`}
                onClick={() => selectPreset(p.seconds)}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSave} className="goal-modal__form">
          <div className="goal-input-row">
            <div className="goal-input-group">
              <label htmlFor="goal-hours">Hours</label>
              <div className="goal-input-wrapper">
                <input
                  id="goal-hours"
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                />
                <span className="goal-input-unit">h</span>
              </div>
            </div>

            <div className="goal-input-group">
              <label htmlFor="goal-minutes">Minutes</label>
              <div className="goal-input-wrapper">
                <input
                  id="goal-minutes"
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                />
                <span className="goal-input-unit">m</span>
              </div>
            </div>
          </div>

          <p className="goal-disclaimer">
            Note: Your daily goal is a personal target for visual tracking progress, not a medical or health recommendation.
          </p>

          <div className="goal-modal__actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              <Check size={16} /> Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// HistoryModal.js
import React, { useState } from 'react';
import "../../css/again/HistoryModal.css";
import { FaTimes } from "react-icons/fa";

const HistoryModal = ({ isOpen, onClose, history }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Handle expand/collapse toggle
  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index); // Toggle between expanded and collapsed
  };

  const sortedHistory = history ? [...history].reverse() : [];

  if (!isOpen) return null;

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div
        className="history-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="history-modal-close" onClick={onClose}>
         ×
        </button>

        <h2 className="history-modal-title">Edit History</h2>

        <div className="history-modal-body">
          {sortedHistory && sortedHistory.length > 0 ? (
            <ul className="history-list">
              {sortedHistory.map((item, index) => (
                <li
                  key={index}
                  className={`history-item ${expandedIndex === index ? "expanded" : ""}`}
                >
                  <div className="history-content">
                    {/* Date */}
                    <div><strong>Date:</strong> {item.date}</div>
                    
                    {/* Action */}
                    <div><strong>Action:</strong> {item.action}</div>
                    
                    {/* User */}
                    <div><strong>Edited by</strong> {item.user}</div>

                    {/* Changes (Initially hidden and displayed when expanded) */}
                    <div className="changes">
                      <strong>Changes</strong>
                      <ul className="changes-list">
                        {item.changes && item.changes.length > 0 ? (
                          item.changes.map((change, changeIndex) => (
                            <li key={changeIndex}>
                              <div className="change-field">
                                <strong>{change.field}</strong>
                              </div>
                              <div><strong>Before:</strong> {change.before}</div>
                              <div><strong>After:</strong> {change.after}</div>
                            </li>
                          ))
                        ) : (
                          <li>No changes available</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Read More / Less toggle button */}
                  <div className="ellipsis" onClick={() => toggleExpand(index)}>
                    {expandedIndex === index ? "Show Less" : "View More"}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No activity history available.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default HistoryModal;

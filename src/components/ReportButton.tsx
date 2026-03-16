'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';

interface ReportButtonProps {
  contentType: 'track' | 'channel' | 'playlist';
  contentId: string;
}

const REPORT_REASONS = [
  'Inappropriate content',
  'Copyright violation',
  'Spam',
  'Misleading',
  'Other',
];

export function ReportButton({ contentType, contentId }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async () => {
    if (!selectedReason) {
      setFeedback({ type: 'error', message: 'Please select a reason' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          reason: `${selectedReason}${details ? ': ' + details : ''}`,
          reporter_email: email || undefined,
        }),
      });

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Report submitted. Thank you!' });
        setTimeout(() => {
          setIsOpen(false);
          setSelectedReason('');
          setDetails('');
          setEmail('');
          setFeedback(null);
        }, 2000);
      } else {
        setFeedback({ type: 'error', message: 'Failed to submit report. Try again.' });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Error submitting report. Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Report Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1 text-sm"
        title="Report this content"
      >
        <Flag className="w-4 h-4" />
        Report
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-white">Report Content</h3>

            {/* Reason Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-[#080c14] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7c3aed]"
              >
                <option value="">Select a reason...</option>
                {REPORT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Details Text Area */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Additional Details (Optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide more context..."
                maxLength={500}
                className="w-full bg-[#080c14] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7c3aed] resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">{details.length}/500</p>
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[#080c14] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            {/* Feedback Message */}
            {feedback && (
              <div
                className={`mb-4 p-3 rounded text-sm ${
                  feedback.type === 'success'
                    ? 'bg-green-900 bg-opacity-30 text-green-400 border border-green-700'
                    : 'bg-red-900 bg-opacity-30 text-red-400 border border-red-700'
                }`}
              >
                {feedback.message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-[#1e2d45] hover:bg-[#2a3f57] text-white rounded text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedReason}
                className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded text-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

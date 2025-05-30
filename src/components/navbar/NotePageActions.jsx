import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

// Navbar action buttons for note
const NotePageActions = ({
  showSummary,
  onToggleSummary,
  onSummarize,
  onPublishToggle,
  isSummarizing,
  isProcessing,
  isPublished,
  readonly
}) => {
  return (
    <div className="flex items-center gap-4">
      {showSummary ? (
        <button
          onClick={onToggleSummary}
          className="flex items-center justify-center w-10 h-10 rounded text-secondary cursor-pointer"
          aria-label="Close summary panel"
        >
          <ChevronRight size={18} />
        </button>
      ) : (
        <button
          onClick={onToggleSummary}
          className="flex items-center justify-center w-10 h-10 rounded text-secondary cursor-pointer"
          aria-label="Open summary panel"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      <button
        onClick={onSummarize}
        className="flex items-center px-4 h-10 rounded text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
        disabled={isSummarizing}
      >
      Summarize
      </button>

      <button
        onClick={onPublishToggle}
        className={`flex items-center px-4 h-10 ${readonly ? 'bg-primary/40 !cursor-not-allowed' : 'bg-primary hover:bg-primary/90'} text-white rounded transition-colors cursor-pointer`}
        disabled={isProcessing || readonly}
      >
        {isProcessing
          ? isPublished
            ? "Unpublishing..."
            : "Publishing..."
          : isPublished
          ? "Published"
          : "Publish"}
      </button>
    </div>
  );
};

export default NotePageActions;

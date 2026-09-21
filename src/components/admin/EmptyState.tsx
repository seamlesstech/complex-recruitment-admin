interface EmptyStateProps {
  title: string;
  message: string;
  onReset: () => void;
}

export function EmptyState({ title, message, onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-surface-secondary bg-card px-6 py-16 text-center">
      <p className="text-sm font-semibold text-fg">{title}</p>
      <p className="text-sm text-fg-muted">{message}</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 rounded text-sm font-medium text-complex-red outline-none transition-colors duration-150 hover:text-complex-red/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
      >
        Reset filters
      </button>
    </div>
  );
}

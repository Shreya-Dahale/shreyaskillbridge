export function BridgeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 18h18" />
      <path d="M4 18C4 12 7.5 8 12 8s8 4 8 10" />
      <path d="M8 18v-6" />
      <path d="M12 18V8" />
      <path d="M16 18v-6" />
    </svg>
  );
}
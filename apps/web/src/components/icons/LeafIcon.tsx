export function LeafIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="7" fill="#5C8A5C" />
      <path
        d="M7 17c-1.2-3.6-.2-8 4.2-10.4C14.8 4.6 17.5 5 18.5 5.5c.4 2.9-.2 6.4-3.4 8.9C11.9 16.8 8.8 16.8 7 17Z"
        fill="#EAF2E4"
      />
      <path d="M7 17c2-2.6 4.4-4.7 7.5-6.8" stroke="#5C8A5C" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

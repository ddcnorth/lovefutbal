/** The little red corner flag used as a marker. */
export default function Flag({ className, pole = 'currentColor' }) {
  return (
    <svg className={className} viewBox="0 0 16 18" aria-hidden="true">
      <path d="M2 1v16" stroke={pole} strokeWidth="2" strokeLinecap="round" />
      <path d="M3 2l12 3.5L3 10z" fill="#ED1C24" />
    </svg>
  );
}

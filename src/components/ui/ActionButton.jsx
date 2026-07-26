const variants = {
  primary: 'rounded-[14px] bg-[var(--action-blue-face)] text-white! shadow-[0_6px_0_var(--action-blue-shadow),0_12px_16px_-6px_rgba(10,33,67,.35),inset_0_1px_0_rgba(255,255,255,.3)] hover:bg-[var(--action-blue-hover)] hover:-translate-y-0.5 active:translate-y-[6px] active:shadow-[0_0_0_var(--action-blue-shadow),0_6px_10px_-6px_rgba(10,33,67,.25),inset_0_1px_0_rgba(255,255,255,.3)]',
  premium: 'rounded-[54px] bg-[linear-gradient(86deg,#748fff_0%,#ff90e0_44.8%,#f7c325_100%)] text-[#170b29] shadow-[inset_0_-4px_0_rgba(20,37,99,.3)] hover:brightness-105 active:translate-y-1 active:shadow-[inset_0_-1px_0_rgba(20,37,99,.3)]',
  neutral: 'rounded-[14px] bg-[var(--surface-tile)] text-[var(--text-primary)] shadow-[0_4px_0_var(--border-hairline),inset_0_1px_0_rgba(255,255,255,.08)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-1 active:shadow-[inset_0_1px_0_rgba(255,255,255,.08)]',
}

export function ActionButton({ variant = 'primary', className = '', children, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`relative border-0 px-4 transition-[transform,filter,box-shadow] duration-75 focus-visible:outline-3 focus-visible:outline-[var(--action-blue-focus)] focus-visible:outline-offset-4 ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

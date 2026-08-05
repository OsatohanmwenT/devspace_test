const variants = {
  primary: 'rounded-xl border border-[#7c6ff1] bg-[#513deb] text-white! shadow-[0_4px_0_#19079b] hover:bg-[#624ff0] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none',
  premium: 'rounded-[54px] bg-[linear-gradient(86deg,#748fff_0%,#ff90e0_44.8%,#f7c325_100%)] text-[#170b29] shadow-[inset_0_-4px_0_rgba(20,37,99,.3)] hover:brightness-105 active:translate-y-1 active:shadow-[inset_0_-1px_0_rgba(20,37,99,.3)]',
  neutral: 'rounded-[14px] border border-[#666666] [[data-theme=light]_&]:border-[#b8b2a8] bg-[#262626] [[data-theme=light]_&]:bg-white text-[#f4f4f2] [[data-theme=light]_&]:text-[#202020] shadow-[0_4px_0_#3d3d3d] [[data-theme=light]_&]:shadow-[0_4px_0_#d8d4cd] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none',
}

export function ActionButton({ variant = 'primary', className = '', children, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`relative px-4 transition-[transform,filter,box-shadow] duration-75 focus-visible:outline-3 focus-visible:outline-[#93c5fd] focus-visible:outline-offset-4 ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

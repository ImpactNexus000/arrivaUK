const variants = {
  green:  'bg-[#E8F9EE] text-[#1A7A3A]',
  red:    'bg-[#FFEAEA] text-[#C0392B]',
  orange: 'bg-[#FFF3E0] text-[#B95C00]',
  blue:   'bg-[#E5F0FF] text-[#1558B0]',
  purple: 'bg-[#EEE9FF] text-[#4A35B0]',
  gray:   'bg-[#F0F0F5] text-[#6b6b70]',
};

export default function Badge({ variant = 'gray', children }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
}

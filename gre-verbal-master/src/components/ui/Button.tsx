import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'rust' | 'verdigris';
  children: ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-(--color-ink) text-(--color-paper) hover:opacity-90 dark:bg-(--color-gold) dark:text-(--color-ink)',
  secondary: 'bg-transparent border border-(--color-ink)/20 text-(--color-ink) hover:bg-(--color-ink)/5 dark:border-(--color-paper)/20 dark:text-(--color-paper) dark:hover:bg-(--color-paper)/5',
  ghost: 'bg-transparent text-(--color-slate) hover:text-(--color-ink) dark:hover:text-(--color-paper)',
  rust: 'bg-(--color-rust) text-white hover:opacity-90',
  verdigris: 'bg-(--color-verdigris) text-white hover:opacity-90',
};

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

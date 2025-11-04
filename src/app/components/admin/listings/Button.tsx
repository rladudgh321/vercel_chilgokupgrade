import { clsx } from "clsx";

interface IButtonProps {
  className?: string;
  children: React.ReactNode;
}

const Button = ({children, className}: IButtonProps) => {
  return (
    <button className={clsx([className, 'border border-slate-500 rounded-xl p-1 cursor-pointer'])}>{children}</button>
  )
}

export default Button
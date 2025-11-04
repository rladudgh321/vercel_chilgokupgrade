import { clsx } from "clsx"

interface ISelectProps {
  padding?: string;
  options?: string;
}

const Select = ({padding = 'p-2', options = '시 / 도'}: ISelectProps) => {
  return (
    <select className={clsx(['border border-slate-300 rounded-xl', padding])}>
      <option>{options}</option>
      <option>경북</option>
    </select>
  )
}

export default Select
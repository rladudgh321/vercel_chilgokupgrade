interface SideInputProps {
  letter?: string;
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const SideInput = ({letter, id, value, onChange, placeholder, className, required=false}: SideInputProps) => {
  return (
    <div className="mx-2">
      <div className="flex h-9">
        <div className="border border-slate-500 rounded-l-lg">
          <input 
            className={className} 
            type="text" 
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            />
        </div>
        {letter && <span className='w-8 bg-slate-400 rounded-r-lg h-full flex items-center justify-center'>{letter}</span>}
      </div>
    </div>
  )
}

export default SideInput
type InputWithButtonProps = {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  placeholder: string;
  buttonText: string;
  disabled?: boolean;
};

const InputWithButton = ({
  value,
  onChange,
  onAdd,
  placeholder,
  buttonText,
  disabled = false,
}: InputWithButtonProps) => {
  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`p-2 border border-gray-300 rounded-lg w-full ${
          disabled ? 'bg-gray-100 opacity-50' : ''
        }`}
      />
      <button
        onClick={onAdd}
        disabled={disabled}
        className={`p-2 bg-blue-500 text-white rounded-lg w-full sm:w-auto ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default InputWithButton;

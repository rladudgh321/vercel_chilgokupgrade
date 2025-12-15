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
        className={`p-2 border border-gray-300 rounded-lg w-full dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 ${
          disabled ? 'bg-gray-100 opacity-50 dark:bg-gray-800' : ''
        }`}
      />
      <button
        onClick={onAdd}
        disabled={disabled}
        className={`p-2 bg-blue-500 text-white rounded-lg w-full sm:w-auto dark:bg-blue-700 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600 dark:hover:bg-blue-800'
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default InputWithButton;

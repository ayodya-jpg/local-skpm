import React from 'react';

function FormInput({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    required = false,
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
        </div>
    );
}

export default FormInput;

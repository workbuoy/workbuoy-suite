import React from "react";

type SelectContextValue = {
  onValueChange?: (value: string) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  name?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

export function Select({ value, defaultValue, onValueChange, children, name, disabled, ...rest }: SelectProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const currentValue = isControlled ? value! : internal;

  const handleChange = (next: string) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <SelectContext.Provider value={{ onValueChange: handleChange }}>
      <select
        {...rest}
        name={name}
        value={currentValue}
        disabled={disabled}
        onChange={(event) => handleChange(event.target.value)}
        className="h-10 rounded-md border border-slate-800 bg-slate-900/60 px-3 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {children}
      </select>
    </SelectContext.Provider>
  );
}

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
};

export function SelectItem({ value, children }: SelectItemProps) {
  return <option value={value}>{children}</option>;
}

export default Select;

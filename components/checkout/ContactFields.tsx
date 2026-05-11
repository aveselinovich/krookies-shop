"use client";

type ContactFieldsProps = {
  name: string;
  phone: string;
  email: string;
  onChange: (field: "name" | "phone" | "email", value: string) => void;
  errors?: Partial<Record<"name" | "phone" | "email", string>>;
};

function getInputClassName(hasError: boolean) {
  return [
    "w-full rounded-2xl border bg-white px-4 py-3 text-[#54342C] outline-none transition",
    hasError ? "border-[#D05C63] focus:border-[#D05C63]" : "border-[#E6AECB] focus:border-[#54342C]",
  ].join(" ");
}

export function ContactFields({ name, phone, email, onChange, errors }: ContactFieldsProps) {
  return (
    <div className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5">
      <h2 className="text-2xl font-black text-[#54342C]">Контакты</h2>
      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Имя *</span>
          <input
            value={name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Например, Анна"
            aria-invalid={Boolean(errors?.name)}
            className={getInputClassName(Boolean(errors?.name))}
          />
          {errors?.name ? <span className="mt-2 block text-xs font-medium text-[#D05C63]">{errors.name}</span> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Телефон *</span>
          <input
            value={phone}
            onChange={(event) => onChange("phone", event.target.value)}
            placeholder="+7 999 000-00-00"
            inputMode="tel"
            aria-invalid={Boolean(errors?.phone)}
            className={getInputClassName(Boolean(errors?.phone))}
          />
          {errors?.phone ? <span className="mt-2 block text-xs font-medium text-[#D05C63]">{errors.phone}</span> : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Email</span>
          <input
            value={email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="Для чека, если нужен"
            inputMode="email"
            aria-invalid={Boolean(errors?.email)}
            className={getInputClassName(Boolean(errors?.email))}
          />
          {errors?.email ? (
            <span className="mt-2 block text-xs font-medium text-[#D05C63]">{errors.email}</span>
          ) : (
            <span className="mt-2 block text-xs text-[#54342C]">Необязательно. Можно оставить пустым</span>
          )}
        </label>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/cn";
import type { CategoryOption } from "@/lib/products";
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "./actions";

type ProductFormInitial = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  priceCents: number;
  stockQuantity: number;
  madeToOrder: boolean;
  isNew: boolean;
  description: string;
  materials: string;
  care: string;
  reference: string;
  sizes: string[] | null;
  details: string[];
  primaryImage: { url: string; alt: string } | null;
};

type Props = {
  categories: CategoryOption[];
  initial?: ProductFormInitial;
};

type FieldName =
  | "name"
  | "slug"
  | "categoryId"
  | "priceDollars"
  | "stockQuantity"
  | "description"
  | "materials"
  | "care"
  | "reference"
  | "sizes"
  | "details"
  | "imageUrl"
  | "imageAlt"
  | "madeToOrder"
  | "isNew";

export function ProductForm({ categories, initial }: Props) {
  const isEdit = Boolean(initial);
  const action = isEdit ? updateProductAction : createProductAction;
  const [state, formAction] = useActionState<
    ProductFormState | undefined,
    FormData
  >(action, undefined);

  // Reconstruct the initial values when the server echoed them back after a
  // validation failure; otherwise use the record (edit) or empty strings (new).
  const v = (name: FieldName): string => {
    const echoed = state?.values?.[name];
    if (typeof echoed === "string") return echoed;
    if (!initial) return "";
    switch (name) {
      case "name":
        return initial.name;
      case "slug":
        return initial.slug;
      case "categoryId":
        return initial.categoryId;
      case "priceDollars":
        return (initial.priceCents / 100).toFixed(2);
      case "stockQuantity":
        return String(initial.stockQuantity);
      case "description":
        return initial.description;
      case "materials":
        return initial.materials;
      case "care":
        return initial.care;
      case "reference":
        return initial.reference;
      case "sizes":
        return initial.sizes?.join(", ") ?? "";
      case "details":
        return initial.details.join("\n");
      case "imageUrl":
        return initial.primaryImage?.url ?? "";
      case "imageAlt":
        return initial.primaryImage?.alt ?? "";
      case "madeToOrder":
      case "isNew":
        return "";
    }
  };

  // Checkboxes read from the echoed state too so re-submits don't lose them.
  const checked = (name: "madeToOrder" | "isNew"): boolean => {
    const echoed = state?.values?.[name];
    if (typeof echoed === "string") return echoed === "on";
    return initial ? initial[name] : false;
  };

  const fieldErrors = state?.fieldErrors ?? {};
  const err = (name: FieldName): string | undefined => fieldErrors[name];

  return (
    <form action={formAction} className="flex flex-col gap-10" noValidate>
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <section className="flex flex-col gap-6">
        <Eyebrow>Essentials</Eyebrow>
        <Field label="Name" error={err("name")}>
          <TextInput name="name" defaultValue={v("name")} required />
        </Field>
        <Field
          label="Slug"
          hint="Lowercase letters, numbers, dashes. Lives in the URL."
          error={err("slug")}
        >
          <TextInput
            name="slug"
            defaultValue={v("slug")}
            required
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
          />
        </Field>
        <Field label="Category" error={err("categoryId")}>
          <Select name="categoryId" defaultValue={v("categoryId")} required>
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Reference" error={err("reference")}>
          <TextInput name="reference" defaultValue={v("reference")} required />
        </Field>
      </section>

      <section className="flex flex-col gap-6">
        <Eyebrow>Price &amp; availability</Eyebrow>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Price (GBP)" error={err("priceDollars")}>
            <TextInput
              type="number"
              name="priceDollars"
              defaultValue={v("priceDollars")}
              min="0"
              step="0.01"
              required
              inputMode="decimal"
            />
          </Field>
          <Field label="Stock quantity" error={err("stockQuantity")}>
            <TextInput
              type="number"
              name="stockQuantity"
              defaultValue={v("stockQuantity")}
              min="0"
              step="1"
              required
              inputMode="numeric"
            />
          </Field>
        </div>
        <CheckboxRow
          name="madeToOrder"
          label="Made to order"
          hint="Overrides stock — never shown as sold out."
          defaultChecked={checked("madeToOrder")}
        />
        <CheckboxRow
          name="isNew"
          label="Mark as new"
          hint="Shows the “new” tag on the storefront."
          defaultChecked={checked("isNew")}
        />
      </section>

      <section className="flex flex-col gap-6">
        <Eyebrow>Copy</Eyebrow>
        <Field label="Description" error={err("description")}>
          <TextArea
            name="description"
            defaultValue={v("description")}
            rows={4}
            required
          />
        </Field>
        <Field label="Materials" error={err("materials")}>
          <TextArea
            name="materials"
            defaultValue={v("materials")}
            rows={3}
            required
          />
        </Field>
        <Field label="Care" error={err("care")}>
          <TextArea
            name="care"
            defaultValue={v("care")}
            rows={3}
            required
          />
        </Field>
        <Field
          label="Sizes"
          hint="Comma-separated, e.g. XS, S, M, L. Leave blank for one-size pieces."
          error={err("sizes")}
        >
          <TextInput name="sizes" defaultValue={v("sizes")} />
        </Field>
        <Field
          label="Details"
          hint="One line per detail — rendered as a bulleted list."
          error={err("details")}
        >
          <TextArea name="details" defaultValue={v("details")} rows={4} />
        </Field>
      </section>

      <section className="flex flex-col gap-6">
        <Eyebrow>Primary image</Eyebrow>
        <Field
          label="Image URL"
          hint="Full https:// link. Appears as the packshot across the storefront."
          error={err("imageUrl")}
        >
          <TextInput
            type="url"
            name="imageUrl"
            defaultValue={v("imageUrl")}
            required
          />
        </Field>
        <Field label="Alt text" error={err("imageAlt")}>
          <TextInput name="imageAlt" defaultValue={v("imageAlt")} required />
        </Field>
      </section>

      <div className="hairline-t pt-8 flex flex-col gap-4">
        {state?.error && (
          <p role="alert" className="text-xs text-danger">
            {state.error}
          </p>
        )}
        {state?.ok && isEdit && (
          <p
            role="status"
            className="text-[0.6875rem] tracking-widest uppercase text-success"
          >
            Changes saved
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <SubmitButton isEdit={isEdit} />
          <Button
            as={Link}
            href="/admin/products"
            variant="secondary"
            size="md"
          >
            Cancel
          </Button>
        </div>
      </div>

    </form>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  const label = pending
    ? isEdit
      ? "Saving…"
      : "Creating…"
    : isEdit
      ? "Save changes"
      : "Create product";
  return (
    <Button type="submit" variant="primary" size="md" disabled={pending}>
      {label}
    </Button>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="eyebrow">{label}</label>
      {children}
      {hint && !error && (
        <p className="text-[0.6875rem] tracking-widest uppercase text-stone-400">
          {hint}
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = cn(
  "w-full bg-transparent border-b border-hairline py-2 text-base text-ink",
  "placeholder:text-stone-400 focus:outline-none focus:border-ink transition-colors",
  "aria-[invalid=true]:border-danger",
);

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type={props.type ?? "text"}
      className={cn(inputClass, props.className)}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        inputClass,
        "resize-y leading-relaxed",
        props.className,
      )}
    />
  );
}

function Select({
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={cn(inputClass, rest.className, "appearance-none pr-6")}>
      {children}
    </select>
  );
}

function CheckboxRow({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 border-hairline accent-ink"
      />
      <span className="flex flex-col gap-1">
        <span className="eyebrow">{label}</span>
        {hint && (
          <span className="text-xs text-stone-600 leading-relaxed">
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}

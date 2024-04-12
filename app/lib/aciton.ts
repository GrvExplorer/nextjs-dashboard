'use server';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const createInvoice = FormSchema.omit({ id: true, date: true });

export const handleCreateInvoice = async (formData: FormData) => {
  const invoiceData = createInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = invoiceData.amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${invoiceData.customerId}, ${amountInCents}, ${invoiceData.status}, ${date})
`;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
};

const updateInvoice = FormSchema.omit({ id: true, date: true });

export async function handleUpdateInvoice(id: string, formData: FormData) {
  const invoiceData = updateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = invoiceData.amount * 100;

  await sql`
   UPDATE invoices
   SET customer_id = ${invoiceData.customerId}, amount = ${amountInCents}, status = ${invoiceData.status}
   WHERE id = ${id}
 `;

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export const handleDeleteInvoice = async (id: string) => {
  await sql`
  DELETE FROM invoices WHERE id = ${id}
  `;

  revalidatePath('/dashboard/invoices');
};

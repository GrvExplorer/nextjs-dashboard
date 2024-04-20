'use server';
import { signIn } from '@/auth';
import { sql } from '@vercel/postgres';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater then $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const createInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
};

export const handleCreateInvoice = async (
  prevState: State,
  formData: FormData,
) => {
  const invoiceData = createInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!invoiceData.success) {
    return {
      errors: invoiceData.error.flatten().fieldErrors,
    };
  }

  const { amount, customerId, status } = invoiceData.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
`;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
};

const updateInvoice = FormSchema.omit({ id: true, date: true });

export async function handleUpdateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {

  console.log(`id: ${id} formData: ${formData}`);
  
  const invoiceData = updateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!invoiceData.success) {
    return {
      errors: invoiceData.error.flatten().fieldErrors,
    };
  }

  const { customerId, amount, status } = invoiceData.data;

  const amountInCents = amount * 100;
  try {
    await sql`
     UPDATE invoices
     SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
     WHERE id = ${id}
   `;
  } catch (error) {
    console.log(error);
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
  
}

export const handleDeleteInvoice = async (id: string) => {
  try {
    await sql`
  DELETE FROM invoices WHERE id = ${id}
  `;
    revalidatePath('/dashboard/invoices');

    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to delete Invoice.' };
  }
};


export const authenticate = async (prevState: string | undefined, formData: FormData) => {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
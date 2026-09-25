import { redirect } from 'next/navigation';

// Bank-transfer and payment actions live on each order in /admin/orders.
export default function AdminPaymentsPage() {
  redirect('/admin/orders');
}

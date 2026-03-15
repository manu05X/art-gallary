'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import { OrderStatus, PaymentStatus } from '@/types';

export default function MyOrdersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getMyOrders(1),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Failed to load orders. Please try again.</p>
      </div>
    );
  }

  const orders = data?.data || [];

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 mb-4">You haven't purchased any paintings yet.</p>
        <Link href="/gallery" className="text-accent font-semibold hover:underline">
          Start shopping →
        </Link>
      </div>
    );
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, string> = {
      [PaymentStatus.PENDING]: 'badge-warning',
      [PaymentStatus.COMPLETED]: 'badge-success',
      [PaymentStatus.FAILED]: 'badge-error',
      [PaymentStatus.REFUNDED]: 'badge-gray',
    };
    return config[status];
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    const config: Record<OrderStatus, string> = {
      [OrderStatus.PENDING_PAYMENT]: 'badge-warning',
      [OrderStatus.PAID]: 'badge-primary',
      [OrderStatus.PROCESSING]: 'badge-primary',
      [OrderStatus.SHIPPED]: 'badge-primary',
      [OrderStatus.DELIVERED]: 'badge-success',
      [OrderStatus.CANCELLED]: 'badge-error',
    };
    return config[status];
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-brand">My Orders</h1>
      </div>

      <div className="divide-y">
        {orders.map((order) => (
          <div key={order.id} className="p-6">
            <div className="flex gap-6">
              {order.painting.primaryImage && (
                <div className="flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={order.painting.primaryImage.url}
                    alt={order.painting.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex-1">
                <Link
                  href={`/painting/${order.painting.slug}`}
                  className="text-lg font-semibold text-brand hover:text-accent transition"
                >
                  {order.painting.title}
                </Link>

                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className={`badge ${getPaymentStatusBadge(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                  <span className={`badge ${getOrderStatusBadge(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-600">Total Price</p>
                    <p className="text-lg font-semibold text-accent">
                      ${order.totalPrice.toLocaleString()} {order.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Payment Method</p>
                    <p className="text-sm font-medium text-gray-800">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Ordered</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <p className="text-xs text-gray-600">Tracking</p>
                      <p className="text-sm font-medium text-gray-800">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

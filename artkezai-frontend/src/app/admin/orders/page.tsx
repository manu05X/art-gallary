'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders-page'],
    queryFn: () => ordersApi.getAllOrders(1),
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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-brand">All Orders</h1>
        <p className="text-sm text-gray-600 mt-2">{orders.length} total orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-600">No orders yet.</p>
        </div>
      ) : (
        <div className="divide-y">
          {orders.map((order) => (
            <div key={order.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex gap-6">
                {order.paintingThumbnailUrl && (
                  <div className="flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={order.paintingThumbnailUrl}
                      alt={order.paintingTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <Link
                    href="/gallery"
                    className="text-lg font-semibold text-brand hover:text-accent transition"
                  >
                    {order.paintingTitle}
                  </Link>

                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="font-semibold text-accent">
                        ${order.totalPrice.toLocaleString()} {order.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-semibold text-gray-800">{order.status}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment</p>
                      <p className="font-semibold text-gray-800">{order.paymentStatus}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

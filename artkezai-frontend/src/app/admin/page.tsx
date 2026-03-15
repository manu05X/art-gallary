'use client';

import { useQuery } from '@tanstack/react-query';
import { paintingsApi } from '@/lib/api/paintings';
import { offersApi } from '@/lib/api/offers';
import { ordersApi } from '@/lib/api/orders';
import { PaintingStatus, OrderStatus } from '@/types';
import { AlertCircle, Clock, ShoppingBag, CreditCard } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: paintings } = useQuery({
    queryKey: ['admin-paintings'],
    queryFn: () => paintingsApi.getGallery({}, 1),
  });

  const { data: offers } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: () => offersApi.getAllOffers(1),
  });

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => ordersApi.getAllOrders(1),
  });

  const paintingsList = paintings?.data || [];
  const offersList = offers?.data || [];
  const ordersList = orders?.data || [];

  const pendingReviewCount = paintingsList.filter((p) => p.status === PaintingStatus.UNDER_REVIEW).length;
  const activeOffersCount = offersList.length;
  const pendingPaymentsCount = ordersList.filter((o) => o.paymentStatus === 'PENDING').length;
  const totalOrdersCount = ordersList.length;

  const stats = [
    {
      label: 'Pending Review',
      value: pendingReviewCount,
      icon: AlertCircle,
      color: 'bg-red-100 text-red-700',
      href: '/admin/moderation',
    },
    {
      label: 'Active Offers',
      value: activeOffersCount,
      icon: ShoppingBag,
      color: 'bg-orange-100 text-orange-700',
      href: '/admin/offers',
    },
    {
      label: 'Pending Payments',
      value: pendingPaymentsCount,
      icon: CreditCard,
      color: 'bg-yellow-100 text-yellow-700',
      href: '/admin/payments',
    },
    {
      label: 'Total Orders',
      value: totalOrdersCount,
      icon: Clock,
      color: 'bg-blue-100 text-blue-700',
      href: '/admin/orders',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <a
              key={idx}
              href={stat.href}
              className={`rounded-lg p-6 cursor-pointer hover:shadow-lg transition ${stat.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon size={32} className="opacity-50" />
              </div>
            </a>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-brand mb-4">Quick Links</h2>
          <div className="space-y-3">
            <a
              href="/admin/moderation"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <p className="font-semibold text-brand">Review Paintings</p>
              <p className="text-sm text-gray-600">
                {pendingReviewCount} paintings awaiting approval
              </p>
            </a>
            <a
              href="/admin/offers"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <p className="font-semibold text-brand">Manage Offers</p>
              <p className="text-sm text-gray-600">{activeOffersCount} active offers</p>
            </a>
            <a
              href="/admin/payments"
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <p className="font-semibold text-brand">Process Payments</p>
              <p className="text-sm text-gray-600">{pendingPaymentsCount} pending payments</p>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-brand mb-4">System Health</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-semibold text-green-700">API Server</span>
              <span className="text-sm text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-semibold text-green-700">Database</span>
              <span className="text-sm text-green-600">Running</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-semibold text-green-700">File Storage</span>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

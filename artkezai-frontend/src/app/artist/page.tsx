'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import { useMyListings } from '@/lib/hooks/usePaintings';
import { PaintingStatus } from '@/types';
import { BarChart3, ShoppingBag, Eye, CheckCircle } from 'lucide-react';

export default function ArtistDashboardPage() {
  const { data: listings } = useMyListings(1);
  const { data: orders } = useQuery({
    queryKey: ['artist-orders'],
    queryFn: () => ordersApi.getAllOrders(1),
  });

  const allListings = listings?.data || [];
  const allOrders = orders?.data || [];

  const stats = [
    {
      label: 'Total Paintings',
      value: listings?.totalCount || 0,
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Live Paintings',
      value: allListings.filter((p) => p.status === PaintingStatus.LIVE).length,
      icon: Eye,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Sold',
      value: allListings.filter((p) => p.status === PaintingStatus.SOLD).length,
      icon: CheckCircle,
      color: 'bg-accent/20 text-accent',
    },
    {
      label: 'Orders',
      value: allOrders.length,
      icon: ShoppingBag,
      color: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`rounded-lg p-6 ${stat.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon size={32} className="opacity-50" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-brand mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-gray-600">
          <p>Activity will appear here as your paintings get views and orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-brand mb-4">Quick Tips</h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="text-accent font-bold">•</span>
            <span>Upload high-quality images of your paintings for better visibility</span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent font-bold">•</span>
            <span>Write detailed descriptions to help buyers understand your work</span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent font-bold">•</span>
            <span>Consider making offers competitive to attract more buyers</span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent font-bold">•</span>
            <span>Engage with potential buyers through messages</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

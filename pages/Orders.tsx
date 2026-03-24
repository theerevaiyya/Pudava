import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../services/firebase';
import { Order, OrderStatus } from '../types';
import { OrderCard } from '../components/OrderCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

const statusTabs: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getUserOrders(user.uid);
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user, navigate]);

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  return (
    <div className="min-h-screen pt-16 md:pt-24 pb-24 px-4 md:px-8 max-w-3xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/5 text-white md:hidden">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-white">My Orders</h1>
          <p className="text-xs text-gray-400 mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-4 px-4 pb-1">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === tab.value
                ? 'orchid-gradient text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <LoadingSkeleton type="order-card" count={3} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          type="orders"
          action={{ label: 'Start Shopping', onClick: () => navigate('/catalog') }}
        />
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

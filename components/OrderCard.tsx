import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Truck, CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react';
import { Order, OrderStatus } from '../types';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'text-yellow-400 bg-yellow-400/10', icon: <Clock size={14} /> },
  confirmed: { label: 'Confirmed', color: 'text-blue-400 bg-blue-400/10', icon: <CheckCircle size={14} /> },
  processing: { label: 'Processing', color: 'text-purple-400 bg-purple-400/10', icon: <Package size={14} /> },
  shipped: { label: 'Shipped', color: 'text-cyan-400 bg-cyan-400/10', icon: <Truck size={14} /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-400 bg-orange-400/10', icon: <Truck size={14} /> },
  delivered: { label: 'Delivered', color: 'text-green-400 bg-green-400/10', icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-400/10', icon: <XCircle size={14} /> },
  returned: { label: 'Returned', color: 'text-gray-400 bg-gray-400/10', icon: <RotateCcw size={14} /> },
};

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();
  const status = statusConfig[order.status];
  const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);
  const orderDate = order.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recent';

  return (
    <div
      onClick={() => navigate(`/orders/${order.id}`)}
      className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 cursor-pointer transition-all active:scale-[0.98]"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500">Order #{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-[10px] text-gray-600">{orderDate}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
          {status.icon}
          {status.label}
        </div>
      </div>

      {/* Product thumbnails */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex -space-x-2">
          {order.items.slice(0, 3).map((item, i) => (
            <div key={i} className="w-10 h-10 rounded-lg border-2 border-pudava-surface overflow-hidden bg-white/5">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="w-10 h-10 rounded-lg border-2 border-pudava-surface bg-white/10 flex items-center justify-center text-xs text-gray-300 font-medium">
              +{order.items.length - 3}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400 ml-1">{itemCount} item{itemCount > 1 ? 's' : ''}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-sm font-bold text-white">₹{order.total.toLocaleString('en-IN')}</span>
        <ChevronRight size={16} className="text-gray-500" />
      </div>
    </div>
  );
};

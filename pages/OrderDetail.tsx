import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Phone, CreditCard, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrderById } from '../services/firebase';
import { Order, OrderStatus } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

const statusSteps: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) { navigate('/login'); return; }

    const fetchOrder = async () => {
      setLoading(true);
      const data = await getOrderById(id);
      if (data && data.userId === user.uid) {
        setOrder(data);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id, user, navigate]);

  if (loading) return <LoadingSkeleton type="product-detail" />;
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Order not found.</p>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'returned';
  const orderDate = order.createdAt?.toDate?.()
    ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Recent';

  return (
    <div className="min-h-screen pt-14 md:pt-18 pb-20 px-4 md:px-8 max-w-3xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/orders')} className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-white">Order Details</h1>
          <p className="text-xs text-gray-500">#{order.id.slice(-8).toUpperCase()} · {orderDate}</p>
        </div>
      </div>

      {/* Status Tracker */}
      {!isCancelled && (
        <div className="glass-panel rounded-xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-white mb-4">Order Status</h3>
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-3 left-3 right-3 h-0.5 bg-white/10">
              <div
                className="h-full orchid-gradient transition-all duration-500"
                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>

            {statusSteps.map((step, i) => {
              const isCompleted = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step} className="relative flex flex-col items-center z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isCompleted ? 'orchid-gradient text-white' : 'bg-white/10 text-gray-500'
                  } ${isCurrent ? 'ring-2 ring-pudava-secondary/40' : ''}`}>
                    {isCompleted ? <CheckCircle size={12} /> : i + 1}
                  </div>
                  <span className={`text-[10px] md:text-xs mt-1.5 text-center leading-tight ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                    {statusLabels[step]}
                  </span>
                </div>
              );
            })}
          </div>

          {order.trackingId && (
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Tracking ID</p>
                <p className="text-sm text-white font-medium">{order.trackingId}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(order.trackingId || '')}
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white"
              >
                <Copy size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {isCancelled && (
        <div className="rounded-xl p-4 mb-4 border border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400 font-medium">
            This order has been {order.status}.
          </p>
        </div>
      )}

      {/* Items */}
      <div className="glass-panel rounded-xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Items ({order.items.length})</h3>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm text-white font-medium truncate">{item.name}</h4>
                <p className="text-xs text-gray-400">Size: {item.size} · Qty: {item.quantity}</p>
              </div>
              <p className="text-sm text-white font-semibold flex-shrink-0">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="glass-panel rounded-xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Price Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
              <span>-₹{order.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-400">
            <span>Delivery</span>
            <span>{order.deliveryFee === 0 ? 'Free' : `₹${order.deliveryFee}`}</span>
          </div>
          <div className="flex justify-between text-white font-bold pt-2 border-t border-white/5">
            <span>Total</span>
            <span>₹{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="glass-panel rounded-xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <MapPin size={14} /> Shipping Address
        </h3>
        <p className="text-sm text-gray-300">{order.shippingAddress.fullName}</p>
        <p className="text-xs text-gray-400 mt-1">
          {order.shippingAddress.addressLine1}
          {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
          <br />
          {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
        </p>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <Phone size={10} /> {order.shippingAddress.phone}
        </p>
      </div>

      {/* Payment */}
      <div className="glass-panel rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <CreditCard size={14} /> Payment
        </h3>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400 capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}</span>
          <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-400' : order.paymentStatus === 'refunded' ? 'text-orange-400' : 'text-yellow-400'}`}>
            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { GlassCard } from '../components/GlassCard';

export const About: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-6 mt-14 mb-20 md:mb-0">
            <GlassCard className="max-w-4xl mx-auto p-5 md:p-8">
                <h1 className="text-3xl font-bold mb-4 text-center">The Pudava Story</h1>
                <div className="space-y-4 text-gray-300 leading-relaxed text-base">
                    <p>
                        Born from a passion for India's rich textile heritage, <span className="text-pudava-gold font-bold">Pudava</span> was established to bridge the gap between traditional craftsmanship and modern sensibilities.
                    </p>
                    <p>
                        "Pudava", meaning *clothing* or *saree* in parts of South India, represents our commitment to authentic weaves, intricate embroideries, and sustainable fashion.
                    </p>
                    <div className="my-5 h-48 rounded-xl overflow-hidden relative">
                         <img 
                            src="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=1200&auto=format&fit=crop" 
                            alt="Textile Loom" 
                            className="w-full h-full object-cover"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                            <span className="text-white font-bold text-xl">Handwoven with Love</span>
                         </div>
                    </div>
                    <p>
                        Whether it's a Kanjeevaram silk for a wedding or a breezy linen shirt for a casual brunch, every piece in our collection tells a story of the artisan who made it.
                    </p>
                    
                    <h2 className="text-2xl font-bold text-white mt-5 mb-3">Contact Us</h2>
                    <div className="grid md:grid-cols-2 gap-4 text-base">
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h3 className="font-bold text-pudava-secondary">Studio Address</h3>
                            <p>12/A, Heritage Lane, Indiranagar<br/>Bangalore, KA 560038</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h3 className="font-bold text-pudava-secondary">Support</h3>
                            <p>hello@pudava.style<br/>+91 98765 43210</p>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
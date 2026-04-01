import React from 'react';
import { GlassCard } from '../components/GlassCard';

export const About: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-6 mt-14 mb-20 md:mb-0">
            <GlassCard className="max-w-4xl mx-auto p-5 md:p-8">
                <h1 className="text-3xl font-bold mb-4 text-center">The Pudava Story</h1>
                <div className="space-y-4 text-gray-300 leading-relaxed text-base">
                    <p>
                        <span className="text-pudava-gold font-bold">Pudava</span> began with a suitcase that always came back heavier.<br/>With every journey across India, there was one thing I would always bring home; a saree. Not just as a souvenir, but as a story. A story of the place, the people, the craft, and the culture woven into every thread.
From the soft whispers of cotton in quiet villages to the richness of silks found in bustling markets, each saree carried a piece of India’s living heritage. <br/>Over time, these weren’t just purchases. They became memories I could wear.
<br/><span className="text-pudava-gold font-bold">Pudava</span> was born from this love for discovering authentic sarees across the country and bringing them closer to women who value meaning as much as beauty.
Every piece at <span className="text-pudava-gold font-bold">Pudava</span> is thoughtfully sourced during real journeys, chosen not just for how it looks, but for how it feels, where it comes from, and the story it tells.
This is not fast fashion. <br/>This is slow, soulful collecting.<br/>
Because a saree is never just fabric.<br/>
It is a place. A moment. A memory waiting to be worn.</p>
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
                            <h3 className="font-bold text-pudava-secondary">Address</h3>
                            <p>1Pudava<br/>B1, 1111, Mahaveer Promenade<br/> Belathur Main Road, Kadugodi<br/>Bangalore, KA 560067</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <h3 className="font-bold text-pudava-secondary">Support</h3>
                            <p>pudava.in@gmail.com<br/>+91 7899418275</p>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
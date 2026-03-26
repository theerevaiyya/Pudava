import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Plus, Trash2, GripVertical, Image as ImageIcon, Save, Loader2, AlertCircle } from 'lucide-react';
import { Product, ProductCategory, ClothingType, FabricType, OccasionType, ProductVariant } from '../types';
import { uploadProductImage, deleteProductImage, saveProduct } from '../services/firebase';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const CATEGORIES: ProductCategory[] = ['Men', 'Women', 'Kids', 'Accessories'];

const CLOTHING_TYPES: ClothingType[] = [
  'Saree', 'Kurta', 'Lehenga', 'Salwar Kameez', 'Dhoti', 'Sherwani',
  'Blouse', 'Dupatta', 'Palazzo', 'Churidar', 'Anarkali', 'Kurti',
  'Shirt', 'Trouser', 'Jacket', 'Stole', 'Other',
];

const FABRIC_TYPES: FabricType[] = [
  'Silk', 'Cotton', 'Linen', 'Chiffon', 'Georgette', 'Velvet',
  'Satin', 'Crepe', 'Net', 'Organza', 'Rayon', 'Polyester',
  'Wool', 'Jute', 'Khadi', 'Banarasi', 'Chanderi', 'Other',
];

const OCCASION_TYPES: OccasionType[] = [
  'Casual', 'Festive', 'Wedding', 'Party', 'Office', 'Bridal',
  'Daily Wear', 'Traditional', 'Ceremonial', 'Other',
];

const PATTERNS = ['Solid', 'Printed', 'Floral', 'Striped', 'Checked', 'Embroidered', 'Woven', 'Abstract', 'Paisley', 'Geometric', 'Other'];
const WORK_TYPES = ['None', 'Zari', 'Embroidery', 'Sequin', 'Mirror Work', 'Thread Work', 'Stone Work', 'Beadwork', 'Lace', 'Applique', 'Other'];
const CARE_OPTIONS = ['Dry Clean Only', 'Hand Wash', 'Machine Wash', 'Gentle Wash', 'Do Not Bleach', 'Iron on Low Heat'];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];

const TEMP_PRODUCT_ID = () => `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ── Reusable form components (defined outside to prevent focus loss on re-render) ──
const FormInput = ({ label, value, onChange, type = 'text', placeholder, required, className = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
  placeholder?: string; required?: boolean; className?: string;
}) => (
  <div className={className}>
    <label className="block text-xs text-gray-400 mb-1.5">{label}{required && <span className="text-red-400">*</span>}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pudava-secondary/50 placeholder-gray-600 transition-colors"
    />
  </div>
);

const FormSelect = ({ label, value, onChange, options, placeholder, className = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  options: readonly string[]; placeholder?: string; className?: string;
}) => (
  <div className={className}>
    <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pudava-secondary/50 transition-colors appearance-none"
    >
      <option value="" className="bg-pudava-bg">{placeholder || 'Select...'}</option>
      {options.map(opt => (
        <option key={opt} value={opt} className="bg-pudava-bg">{opt}</option>
      ))}
    </select>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-base font-semibold text-white mt-6 mb-3 pb-2 border-b border-white/5">{children}</h3>
);

interface ImageUploadState {
  file?: File;
  preview: string;
  url?: string;        // Final Firebase URL
  progress: number;
  uploading: boolean;
  error?: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const isEditing = !!product;
  const [tempId] = useState(() => product?.id || TEMP_PRODUCT_ID());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Basic info
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice?.toString() || '');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'Women');
  const [sku, setSku] = useState(product?.sku || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '0');

  // Clothing metadata
  const [clothingType, setClothingType] = useState<ClothingType | ''>(product?.clothingType || '');
  const [fabric, setFabric] = useState<FabricType | ''>(product?.fabric || '');
  const [occasion, setOccasion] = useState<OccasionType | ''>(product?.occasion || '');
  const [color, setColor] = useState(product?.color || '');
  const [pattern, setPattern] = useState(product?.pattern || '');
  const [weight, setWeight] = useState(product?.weight || '');
  const [careInstructions, setCareInstructions] = useState(product?.careInstructions || '');
  const [countryOfOrigin, setCountryOfOrigin] = useState(product?.countryOfOrigin || 'India');
  const [brand, setBrand] = useState(product?.brand || 'Pudava');
  const [styleCode, setStyleCode] = useState(product?.styleCode || '');
  const [length, setLength] = useState(product?.length || '');
  const [work, setWork] = useState(product?.work || '');
  const [transparency, setTransparency] = useState(product?.transparency || '');

  // Sizes & Tags
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product?.sizes || []);
  const [tags, setTags] = useState<string[]>(product?.tags || []);
  const [tagInput, setTagInput] = useState('');

  // Flags
  const [isBestSeller, setIsBestSeller] = useState(product?.isBestSeller || false);
  const [isNewArrival, setIsNewArrival] = useState(product?.isNewArrival || false);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
  const [isPublished, setIsPublished] = useState(product?.isPublished ?? true);

  // Images
  const existingImages = (product?.images || (product?.image ? [product.image] : []));
  const [images, setImages] = useState<ImageUploadState[]>(
    existingImages.map(url => ({ preview: url, url, progress: 100, uploading: false }))
  );

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Image handling ──
  const handleImageSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const newImages: ImageUploadState[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} is too large. Maximum 10MB per image.`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview, progress: 0, uploading: true });
    }

    setImages(prev => [...prev, ...newImages]);

    // Upload each
    for (const img of newImages) {
      if (!img.file) continue;
      try {
        const url = await uploadProductImage(img.file, tempId, (progress) => {
          setImages(prev => prev.map(i =>
            i.preview === img.preview ? { ...i, progress } : i
          ));
        });
        setImages(prev => prev.map(i =>
          i.preview === img.preview ? { ...i, url, uploading: false, progress: 100 } : i
        ));
      } catch (err: any) {
        setImages(prev => prev.map(i =>
          i.preview === img.preview ? { ...i, uploading: false, error: err.message || 'Upload failed' } : i
        ));
      }
    }
  }, [tempId]);

  const handleRemoveImage = async (index: number) => {
    const img = images[index];
    if (img.url && img.url.includes('firebase')) {
      try { await deleteProductImage(img.url); } catch {}
    }
    if (img.preview && img.preview.startsWith('blob:')) {
      URL.revokeObjectURL(img.preview);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages(prev => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  // ── Size toggle ──
  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // ── Tags ──
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
    setTagInput('');
  };

  // ── Variants ──
  const addVariant = () => {
    setVariants(prev => [...prev, { color: '', colorHex: '#000000', image: '' }]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  // ── Save ──
  const handleSave = async () => {
    // Validation
    if (!name.trim()) { setError('Product name is required.'); return; }
    if (!price || parseFloat(price) <= 0) { setError('Valid price is required.'); return; }
    if (selectedSizes.length === 0) { setError('Select at least one size.'); return; }
    if (images.length === 0) { setError('Upload at least one product image.'); return; }
    const stillUploading = images.some(i => i.uploading);
    if (stillUploading) { setError('Please wait for all images to finish uploading.'); return; }
    const failedUploads = images.some(i => i.error);
    if (failedUploads) { setError('Some images failed to upload. Remove them and try again.'); return; }

    setError('');
    setSaving(true);

    try {
      const imageUrls = images.map(i => i.url!).filter(Boolean);

      const productData: Partial<Product> & { id?: string } = {
        ...(isEditing ? { id: product!.id } : {}),
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        category,
        image: imageUrls[0],
        images: imageUrls,
        sizes: selectedSizes,
        variants: variants.filter(v => v.color && v.colorHex),
        stock: parseInt(stock) || 0,
        sku: sku.trim() || undefined,
        tags,
        isBestSeller,
        isNewArrival,
        isFeatured,
        isPublished,
        clothingType: clothingType || undefined,
        fabric: fabric || undefined,
        occasion: occasion || undefined,
        color: color.trim() || undefined,
        pattern: pattern || undefined,
        weight: weight.trim() || undefined,
        careInstructions: careInstructions.trim() || undefined,
        countryOfOrigin: countryOfOrigin.trim() || undefined,
        brand: brand.trim() || undefined,
        styleCode: styleCode.trim() || undefined,
        length: length.trim() || undefined,
        work: work || undefined,
        transparency: transparency || undefined,
      };

      const savedId = await saveProduct(productData);
      onSave({ ...productData, id: savedId } as Product);
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-blur">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-white">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button onClick={onCancel} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl flex items-center gap-2 text-sm bg-red-500/10 border border-red-500/20 text-red-300">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* === Images Section === */}
      <GlassCard className="p-5">
        <SectionTitle>Product Images</SectionTitle>
        <p className="text-xs text-gray-500 mb-3">First image will be the cover. Drag to reorder. Max 10MB per image.</p>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-white/5">
              <img src={img.preview} alt="" className="w-full h-full object-cover" />

              {/* Upload overlay */}
              {img.uploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                  <Loader2 size={20} className="animate-spin text-pudava-secondary" />
                  <span className="text-xs text-white">{Math.round(img.progress)}%</span>
                </div>
              )}

              {/* Error overlay */}
              {img.error && (
                <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center p-2">
                  <span className="text-[10px] text-red-200 text-center">{img.error}</span>
                </div>
              )}

              {/* Controls */}
              {!img.uploading && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {i > 0 && (
                    <button onClick={() => moveImage(i, i - 1)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">←</button>
                  )}
                  <button onClick={() => handleRemoveImage(i)} className="w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white">
                    <Trash2 size={14} />
                  </button>
                  {i < images.length - 1 && (
                    <button onClick={() => moveImage(i, i + 1)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">→</button>
                  )}
                </div>
              )}

              {/* Cover badge */}
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 text-[9px] bg-pudava-primary/90 text-white px-2 py-0.5 rounded-full font-bold">COVER</span>
              )}
            </div>
          ))}

          {/* Add button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-pudava-secondary/40 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-pudava-secondary transition-colors"
          >
            <Upload size={20} />
            <span className="text-[10px]">Upload</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleImageSelect(e.target.files)}
        />
      </GlassCard>

      {/* === Basic Info === */}
      <GlassCard className="p-5">
        <SectionTitle>Basic Information</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Product Name" value={name} onChange={setName} placeholder="e.g. Banarasi Silk Saree" required className="md:col-span-2" />
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1.5">Description<span className="text-red-400">*</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Detailed product description..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pudava-secondary/50 placeholder-gray-600 transition-colors resize-none"
            />
          </div>
          <FormInput label="Selling Price (₹)" value={price} onChange={setPrice} type="number" placeholder="999" required />
          <FormInput label="MRP / Original Price (₹)" value={originalPrice} onChange={setOriginalPrice} type="number" placeholder="1499" />
          <FormSelect label="Category" value={category} onChange={v => setCategory(v as ProductCategory)} options={CATEGORIES} />
          <FormInput label="SKU" value={sku} onChange={setSku} placeholder="PUD-SAR-001" />
          <FormInput label="Stock Quantity" value={stock} onChange={setStock} type="number" placeholder="50" required />
          <FormInput label="Brand" value={brand} onChange={setBrand} placeholder="Pudava" />
        </div>
      </GlassCard>

      {/* === Clothing Details === */}
      <GlassCard className="p-5">
        <SectionTitle>Clothing Details</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormSelect label="Clothing Type" value={clothingType} onChange={v => setClothingType(v as ClothingType)} options={CLOTHING_TYPES} placeholder="Select type..." />
          <FormSelect label="Fabric" value={fabric} onChange={v => setFabric(v as FabricType)} options={FABRIC_TYPES} placeholder="Select fabric..." />
          <FormSelect label="Occasion" value={occasion} onChange={v => setOccasion(v as OccasionType)} options={OCCASION_TYPES} placeholder="Select occasion..." />
          <FormInput label="Color" value={color} onChange={setColor} placeholder="e.g. Maroon, Gold" />
          <FormSelect label="Pattern" value={pattern} onChange={setPattern} options={PATTERNS} placeholder="Select pattern..." />
          <FormSelect label="Work / Embellishment" value={work} onChange={setWork} options={WORK_TYPES} placeholder="Select work..." />
          <FormInput label="Length" value={length} onChange={setLength} placeholder="e.g. 5.5m, Floor Length" />
          <FormInput label="Weight" value={weight} onChange={setWeight} placeholder="e.g. 350g" />
          <FormSelect label="Transparency" value={transparency} onChange={setTransparency} options={['Opaque', 'Semi-Sheer', 'Sheer']} placeholder="Select..." />
          <FormInput label="Style Code" value={styleCode} onChange={setStyleCode} placeholder="e.g. BNR-SLK-2024" />
          <FormInput label="Country of Origin" value={countryOfOrigin} onChange={setCountryOfOrigin} placeholder="India" />
          <FormSelect label="Care Instructions" value={careInstructions} onChange={setCareInstructions} options={CARE_OPTIONS} placeholder="Select..." />
        </div>
      </GlassCard>

      {/* === Sizes === */}
      <GlassCard className="p-5">
        <SectionTitle>Available Sizes</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedSizes.includes(size)
                  ? 'orchid-gradient text-white shadow-lg'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* === Tags === */}
      <GlassCard className="p-5">
        <SectionTitle>Tags</SectionTitle>
        <div className="flex gap-2 mb-3">
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add a tag..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pudava-secondary/50 placeholder-gray-600"
          />
          <Button onClick={addTag} variant="outline" className="px-4">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pudava-secondary/10 text-pudava-secondary text-xs font-medium">
              {tag}
              <button onClick={() => setTags(prev => prev.filter((_, j) => j !== i))} className="hover:text-white">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </GlassCard>

      {/* === Variants === */}
      <GlassCard className="p-5">
        <SectionTitle>Color Variants (Optional)</SectionTitle>
        <div className="space-y-3 mb-3">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <input
                type="color"
                value={v.colorHex}
                onChange={e => updateVariant(i, 'colorHex', e.target.value)}
                className="w-10 h-10 rounded-lg border-none cursor-pointer bg-transparent"
              />
              <input
                value={v.color}
                onChange={e => updateVariant(i, 'color', e.target.value)}
                placeholder="Color name (e.g. Maroon)"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none placeholder-gray-600"
              />
              <input
                value={v.image}
                onChange={e => updateVariant(i, 'image', e.target.value)}
                placeholder="Image URL (optional)"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none placeholder-gray-600 hidden md:block"
              />
              <button onClick={() => removeVariant(i)} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addVariant}
          className="flex items-center gap-2 text-sm text-pudava-secondary hover:text-white transition-colors"
        >
          <Plus size={16} /> Add Variant
        </button>
      </GlassCard>

      {/* === Flags === */}
      <GlassCard className="p-5">
        <SectionTitle>Visibility & Flags</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Published', value: isPublished, set: setIsPublished },
            { label: 'Best Seller', value: isBestSeller, set: setIsBestSeller },
            { label: 'New Arrival', value: isNewArrival, set: setIsNewArrival },
            { label: 'Featured', value: isFeatured, set: setIsFeatured },
          ].map(flag => (
            <button
              key={flag.label}
              onClick={() => flag.set(!flag.value)}
              className={`p-3 rounded-xl text-sm font-medium transition-all text-center ${
                flag.value
                  ? 'orchid-gradient text-white shadow-lg'
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              {flag.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* === Actions === */}
      <div className="flex gap-3 pt-2 pb-4 sticky bottom-0 bg-gradient-to-t from-pudava-bg via-pudava-bg to-transparent">
        <Button fullWidth onClick={handleSave} variant="gold" disabled={saving} className="h-12">
          {saving ? (
            <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Saving...</span>
          ) : (
            <span className="flex items-center gap-2"><Save size={18} /> {isEditing ? 'Update Product' : 'Create Product'}</span>
          )}
        </Button>
        <Button onClick={onCancel} variant="ghost" className="h-12 px-6">Cancel</Button>
      </div>
    </div>
  );
};

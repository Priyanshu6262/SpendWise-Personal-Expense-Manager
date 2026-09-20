import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Calendar,
  Tag,
  FileText,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import { useTransactions } from '../context/TransactionContext';
import { useToast } from '../context/ToastContext';

const EXPENSE_CATEGORIES = ['Food', 'Shopping', 'Bills', 'Travel', 'Entertainment', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Other'];

const BillScanModal = ({ isOpen, onClose }) => {
  const { addTransaction } = useTransactions();
  const { showSuccess, showError } = useToast();

  const [mode, setMode] = useState('choose'); // 'choose' | 'camera' | 'preview'
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null); // base64 string
  const [mimeType, setMimeType] = useState('image/jpeg');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extracted, setExtracted] = useState(false);

  // Editable transaction form data
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'Expense',
    category: 'Bills',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Camera stream refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Cleanup on close or unmount
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetState();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const resetState = () => {
    stopCamera();
    setMode('choose');
    setImagePreview(null);
    setImageData(null);
    setMimeType('image/jpeg');
    setIsAnalyzing(false);
    setIsSubmitting(false);
    setExtracted(false);
    setFormData({
      title: '',
      amount: '',
      type: 'Expense',
      category: 'Bills',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  // Start live webcam
  const startCamera = async () => {
    try {
      setMode('camera');
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Webcam access error, falling back to camera file input:', err);
      stopCamera();
      // Fallback: trigger native device camera input
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        showError('Could not open camera stream. Please upload an image instead.');
        setMode('choose');
      }
    }
  };

  // Capture still from video stream
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();

    setImagePreview(dataUrl);
    setImageData(dataUrl);
    setMimeType('image/jpeg');
    setMode('preview');

    // Auto-trigger AI analysis on capture
    analyzeBill(dataUrl, 'image/jpeg');
  };

  // Handle file input (drag/drop or file picker)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      stopCamera();
      setImagePreview(dataUrl);
      setImageData(dataUrl);
      setMimeType(file.type || 'image/jpeg');
      setMode('preview');

      // Auto-trigger AI analysis
      analyzeBill(dataUrl, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Send image to Gemini AI backend
  const analyzeBill = async (imgData, mime) => {
    setIsAnalyzing(true);
    setExtracted(false);

    try {
      const res = await api.post('/ai/scan-bill', {
        image: imgData,
        mimeType: mime,
      });

      if (res.data && res.data.success && res.data.data) {
        const item = res.data.data;
        setFormData({
          title: item.title || 'Scanned Bill',
          amount: item.amount !== undefined ? String(item.amount) : '',
          type: item.type || 'Expense',
          category: item.category || 'Bills',
          date: item.date || new Date().toISOString().split('T')[0],
          notes: item.notes || '',
        });
        setExtracted(true);
        showSuccess('AI extracted bill details successfully!');
      } else {
        throw new Error('AI analysis failed to extract details');
      }
    } catch (err) {
      console.error('Bill OCR error:', err);
      showError(err.response?.data?.message || 'Could not extract bill details with AI. You can still fill the fields manually.');
      setExtracted(true); // Allow manual completion
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (newType) => {
    const defaultCat = newType === 'Expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0];
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: defaultCat,
    }));
  };

  // Submit transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date || !formData.category) {
      showError('Please provide a title, amount, category, and date.');
      return;
    }

    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showError('Amount must be a positive number.');
      return;
    }

    setIsSubmitting(true);
    const success = await addTransaction({
      ...formData,
      amount: amountNum,
    });
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const categories = formData.type === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1220]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#111C2E] border border-[#263449] rounded-2xl shadow-2xl p-5 sm:p-7 z-10 my-auto text-[#F8FAFC] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#263449]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#F8FAFC] flex items-center gap-2">
                Scan Bill with AI
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                  Gemini Vision
                </span>
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Upload or capture a receipt — AI extracts merchant, amount, category & date automatically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-5">
          {/* State 1: Choose Method (Upload or Camera) */}
          {mode === 'choose' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              {/* Option 1: File Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border-2 border-dashed border-[#263449] hover:border-[#10B981] bg-[#0F172A]/60 hover:bg-[#10B981]/5 cursor-pointer transition-all duration-200 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1E293B] group-hover:bg-[#10B981]/20 text-[#94A3B8] group-hover:text-[#10B981] flex items-center justify-center mb-3 transition-colors">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold text-[#F8FAFC] group-hover:text-[#10B981] transition-colors">
                  Upload Bill / Receipt
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 max-w-[200px]">
                  Select PNG, JPG, or WebP photo from your device
                </p>
                <span className="mt-4 text-xs font-medium text-[#10B981] px-3 py-1 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
                  Browse Files
                </span>
              </div>

              {/* Option 2: Live Camera */}
              <div
                onClick={startCamera}
                className="group flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border-2 border-dashed border-[#263449] hover:border-[#10B981] bg-[#0F172A]/60 hover:bg-[#10B981]/5 cursor-pointer transition-all duration-200 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1E293B] group-hover:bg-[#10B981]/20 text-[#94A3B8] group-hover:text-[#10B981] flex items-center justify-center mb-3 transition-colors">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold text-[#F8FAFC] group-hover:text-[#10B981] transition-colors">
                  Take Photo / Camera
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 max-w-[200px]">
                  Use webcam or mobile camera to snap the bill
                </p>
                <span className="mt-4 text-xs font-medium text-[#10B981] px-3 py-1 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
                  Open Camera
                </span>
              </div>
            </div>
          )}

          {/* State 2: Live Camera Viewfinder */}
          {mode === 'camera' && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[360px] flex items-center justify-center border border-[#263449]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Viewfinder Overlay Guide */}
                <div className="absolute inset-6 border-2 border-dashed border-[#10B981]/60 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="bg-[#0B1220]/75 text-xs text-[#F8FAFC] px-3 py-1 rounded-full backdrop-blur-sm border border-[#263449]">
                    Align bill within the frame
                  </span>
                </div>
              </div>

              {/* Camera Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setMode('choose');
                  }}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-[#0F172A] border border-[#263449] text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#10B981] text-white font-semibold text-xs hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20"
                >
                  <Camera className="w-4 h-4" />
                  Capture Photo
                </button>
              </div>
            </div>
          )}

          {/* State 3: Preview + AI Processing / Verification Form */}
          {mode === 'preview' && (
            <div className="space-y-5">
              {/* Image Preview Card & Retake Button */}
              <div className="relative rounded-xl overflow-hidden bg-[#0F172A] border border-[#263449] p-3 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-36 h-36 rounded-lg overflow-hidden bg-black/40 border border-[#263449] flex-shrink-0">
                  <img
                    src={imagePreview}
                    alt="Scanned Bill Preview"
                    className="w-full h-full object-contain"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-[#0B1220]/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center">
                      <RefreshCw className="w-5 h-5 text-[#10B981] animate-spin mb-1" />
                      <span className="text-[10px] font-medium text-[#10B981]">Analyzing...</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#10B981]" />
                      Receipt Captured
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setMode('choose');
                        setImagePreview(null);
                        setImageData(null);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#F8FAFC] px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#263449] transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Change / Retake
                    </button>
                  </div>

                  {isAnalyzing ? (
                    <div className="space-y-1.5">
                      <p className="text-xs text-[#10B981] font-medium animate-pulse flex items-center gap-1.5 justify-center sm:justify-start">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI is reading merchant, total amount, category and date...
                      </p>
                      <div className="w-full bg-[#1E293B] rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#10B981] h-1.5 rounded-full w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  ) : extracted ? (
                    <div className="inline-flex items-center gap-1.5 text-xs text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/25 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Extracted details ready for review
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => analyzeBill(imageData, mimeType)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#10B981] text-white hover:bg-[#059669]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Re-scan with AI
                    </button>
                  )}
                </div>
              </div>

              {/* Editable Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                {/* Type Selection Tabs */}
                <div className="flex bg-[#0F172A] p-1 rounded-xl border border-[#263449]">
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('Expense')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      formData.type === 'Expense'
                        ? 'bg-[#EF4444] text-white shadow-sm'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('Income')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      formData.type === 'Income'
                        ? 'bg-[#10B981] text-white shadow-sm'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    Income / Credit
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Title / Merchant */}
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                      Merchant / Description *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Swiggy, Electricity Bill"
                      required
                      className="w-full px-3 py-2 bg-[#0F172A] border border-[#263449] rounded-lg text-xs text-[#F8FAFC] focus:outline-none focus:border-[#10B981] transition-colors"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                      Amount (₹) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                        <IndianRupee className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                        className="w-full pl-8 pr-3 py-2 bg-[#0F172A] border border-[#263449] rounded-lg text-xs text-[#F8FAFC] focus:outline-none focus:border-[#10B981] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                      Category *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3 py-2 bg-[#0F172A] border border-[#263449] rounded-lg text-xs text-[#F8FAFC] focus:outline-none focus:border-[#10B981] transition-colors"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                      Date *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full pl-8 pr-3 py-2 bg-[#0F172A] border border-[#263449] rounded-lg text-xs text-[#F8FAFC] focus:outline-none focus:border-[#10B981] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes / Item Summary */}
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                    Items / Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Items bought, invoice number, or receipt remarks..."
                    className="w-full px-3 py-2 bg-[#0F172A] border border-[#263449] rounded-lg text-xs text-[#F8FAFC] focus:outline-none focus:border-[#10B981] transition-colors resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#263449]">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-[#0F172A] border border-[#263449] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isAnalyzing}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#10B981] text-white font-semibold text-xs hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving Transaction...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-3.5 h-3.5" />
                        Add to Transactions
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillScanModal;

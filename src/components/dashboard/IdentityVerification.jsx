import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import Button from '../common/Button';
import Card from '../common/Card';

const IdentityVerification = ({ profile, isOpen, onClose, onComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus('uploading');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('identity-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Update Profile Status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          verification_status: 'Pending',
          verification_document_url: filePath
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setStatus('success');
      setTimeout(() => {
        onComplete();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error uploading document:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="p-8 border border-primary/20 shadow-2xl relative overflow-hidden" glass>
          <div className="absolute top-0 right-0 p-4">
             <button onClick={onClose} className="text-secondary hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
             </button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Identity Verification</h2>
            <p className="text-sm text-secondary">Please upload a valid document (ID Card, Passport, or License) to verify your institutional account.</p>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
               <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-success text-3xl">check_circle</span>
               </div>
               <h3 className="text-lg font-bold text-white mb-2">Document Submitted</h3>
               <p className="text-xs text-secondary">Our compliance team will review your document within 24 hours.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div 
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                  file ? 'border-primary bg-primary/5' : 'border-outline hover:border-primary/50'
                }`}
              >
                <input 
                  type="file" 
                  id="doc-upload" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
                <label htmlFor="doc-upload" className="cursor-pointer">
                  <span className="material-symbols-outlined text-4xl text-secondary mb-4">cloud_upload</span>
                  <p className="text-sm font-bold text-white">{file ? file.name : 'Select Document'}</p>
                  <p className="text-[10px] text-secondary mt-2 uppercase tracking-widest">Supports PNG, JPG, PDF (Max 10MB)</p>
                </label>
              </div>

              {status === 'error' && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3">
                   <span className="material-symbols-outlined text-error text-sm">error</span>
                   <p className="text-[10px] font-bold text-error uppercase tracking-wider">Failed to upload. Please try again.</p>
                </div>
              )}

              <Button 
                variant="primary" 
                className="w-full py-4 font-bold"
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? 'Processing Document...' : 'Submit for Verification'}
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default IdentityVerification;

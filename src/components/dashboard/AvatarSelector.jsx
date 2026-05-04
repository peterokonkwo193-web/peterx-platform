import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import Button from '../common/Button';
import Card from '../common/Card';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha',
];

const AvatarSelector = ({ profile, isOpen, onClose, onUpdate }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(profile?.avatar_url);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSelected(null); // Clear preset selection if file is chosen
    }
  };

  const handleSave = async () => {
    if (!selected && !file) return;
    setLoading(true);
    setUploading(true);
    try {
      let finalUrl = selected;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        finalUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: finalUrl })
        .eq('id', profile.id);
      
      if (error) throw error;
      onUpdate(finalUrl);
      onClose();
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Failed to update avatar: ' + error.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <Card className="p-8 border border-primary/20 shadow-2xl relative overflow-hidden" glass>
          <div className="absolute top-0 right-0 p-6">
             <button onClick={onClose} className="text-secondary hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
             </button>
          </div>

          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Protocol Identity</h2>
            <p className="text-sm text-secondary">Select a unique avatar to represent your institutional account.</p>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-10">
            {PRESET_AVATARS.map((url, i) => (
              <button 
                key={i}
                onClick={() => {
                  setSelected(url);
                  setFile(null);
                }}
                className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 hover:scale-105 ${
                  selected === url ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:border-white/20'
                }`}
              >
                <img src={url} alt="Avatar" className="w-full h-full rounded-xl" />
              </button>
            ))}
          </div>

          <div className="mb-10">
             <div className="flex items-center gap-4 mb-4">
                <div className="h-px flex-1 bg-white/5"></div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Or Upload Custom</span>
                <div className="h-px flex-1 bg-white/5"></div>
             </div>
             <div className={`relative border-2 border-dashed rounded-2xl p-6 transition-all ${file ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/10'}`}>
                <input 
                  type="file" 
                  id="avatar-upload" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <label htmlFor="avatar-upload" className="flex flex-col items-center justify-center cursor-pointer">
                   <span className="material-symbols-outlined text-secondary text-2xl mb-2">{file ? 'check_circle' : 'add_photo_alternate'}</span>
                   <p className="text-xs font-bold text-white">{file ? file.name : 'Choose Custom Photo'}</p>
                   <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-[0.2em]">Institutional Identity Standard (Max 5MB)</p>
                </label>
             </div>
          </div>

          <div className="flex gap-4">
             <Button variant="outline" className="flex-1 py-4 font-bold" onClick={onClose}>Cancel</Button>
             <Button 
               variant="primary" 
               className="flex-2 py-4 font-bold px-12" 
               onClick={handleSave}
               disabled={loading || (!selected && !file)}
             >
               {uploading ? 'Securing Identity...' : 'Confirm Identity'}
             </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default AvatarSelector;

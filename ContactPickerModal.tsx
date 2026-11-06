import React, { useState } from "react";
import { Users, Phone, X, Check, ShieldAlert, Smartphone } from "lucide-react";
import { detectPlatformCapabilities, requestBrowserContact } from "../utils/capabilities";

interface ContactPickerModalProps {
  isOpen: boolean;
  initialName?: string;
  onSelectContact: (name: string, phone: string) => void;
  onClose: () => void;
}

export const ContactPickerModal: React.FC<ContactPickerModalProps> = ({
  isOpen,
  initialName = "",
  onSelectContact,
  onClose,
}) => {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const caps = detectPlatformCapabilities();

  if (!isOpen) return null;

  const handleBrowserPicker = async () => {
    const res = await requestBrowserContact();
    if (res && res.name) {
      setName(res.name);
      if (res.tel) setPhone(res.tel);
      onSelectContact(res.name, res.tel || "");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSelectContact(name.trim(), phone.trim());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-slate-900 border border-sky-500/40 rounded-3xl shadow-2xl p-5 space-y-4 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 id="contact-modal-title" className="font-bold text-white text-base">
                Contact & Phone Dialing
              </h3>
              <span className="text-[10px] text-slate-400">Platform Capability Center</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Contact Picker"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Browser Contact Picker Button if supported */}
        {caps.hasContactPicker && (
          <div className="p-3 bg-slate-950 rounded-2xl border border-sky-500/30 space-y-2">
            <span className="text-xs text-sky-300 font-semibold block">
              Browser Contact Picker API Supported
            </span>
            <button
              onClick={handleBrowserPicker}
              className="w-full py-2 px-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>Select from Device Address Book</span>
            </button>
          </div>
        )}

        {/* Accessible Manual Contact Input Form */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contact Name or Nickname:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahim, MD Kamruzzaman, Fahim"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Phone Number (Optional):
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1700 000000"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-sky-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Contact</span>
            </button>
          </div>
        </form>

        {/* Honest Disclosure Banner */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1 leading-relaxed">
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Browser Privacy Architecture</span>
          </div>
          <p>
            Web applications do not have permanent, unrestricted background access to your contacts. When placing a call, KARIN prepares a user-initiated <code>tel:</code> link to trigger your phone dialer safely.
          </p>
        </div>
      </div>
    </div>
  );
};

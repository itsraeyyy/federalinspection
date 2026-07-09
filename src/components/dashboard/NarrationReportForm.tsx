"use client";

import { useState, useRef } from "react";
import { saveReportFormAction, submitReportAction } from "@/app/actions/reports";
import { ReportPeriod } from "@/lib/et-calendar";
import { IconDeviceFloppy, IconSend, IconLoader2, IconFileUpload, IconX, IconFileText } from "@tabler/icons-react";
import { supabase } from "@/lib/supabaseClient";

interface NarrationReportFormProps {
  userId: string;
  region: string;
  year: number;
  period: ReportPeriod;
  existingData?: any;
  onSuccess: () => void;
  isReadOnly?: boolean;
}

export function NarrationReportForm({
  userId,
  region,
  year,
  period,
  existingData,
  onSuccess,
  isReadOnly = false
}: NarrationReportFormProps) {
  const [narrationText, setNarrationText] = useState(existingData?.narration_report?.text || "");
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(existingData?.narration_report?.attachment_url || null);
  const [attachmentName, setAttachmentName] = useState<string | null>(existingData?.narration_report?.attachment_name || null);
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<'save' | 'submit' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB
        setError("የፋይሉ መጠን ከ50MB መብለጥ የለበትም (File size must not exceed 50MB)");
        return;
      }
      setFile(selectedFile);
      setAttachmentName(selectedFile.name);
      setError(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setAttachmentName(null);
    setAttachmentUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadAttachment = async (): Promise<string | null> => {
    if (!file) return attachmentUrl;

    const fileExt = file.name.split('.').pop() || '';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `${year}/${region}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('report_attachments')
      .upload(storagePath, file, { upsert: true });

    if (error) {
      throw new Error(`ፋይል ማያያዝ አልተቻለም (Upload failed): ${error.message}`);
    }

    const { data: publicData } = supabase.storage
      .from('report_attachments')
      .getPublicUrl(storagePath);

    return publicData.publicUrl;
  };

  const handleSave = async () => {
    setLoading('save');
    setError(null);
    try {
      const url = await uploadAttachment();
      const narrationData = { text: narrationText, attachment_url: url, attachment_name: attachmentName };
      const fullData = { ...existingData, narration_report: narrationData };
      
      const res = await saveReportFormAction(userId, region, year, period, fullData);
      if (res.error) setError(res.error);
      else alert("በተሳካ ሁኔታ ተቀምጧል! (Saved successfully)");
      
      if (!res.error && url && url !== attachmentUrl) {
        setAttachmentUrl(url);
        setFile(null);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(null);
  };

  const handleSubmit = async () => {
    if (!narrationText.trim()) {
      setError("እባክዎ የጽሁፍ ሪፖርትዎን ያስገቡ (Please enter your narration report text)");
      return;
    }
    
    if (!confirm("እርግጠኛ ነዎት ሪፖርቱን መላክ ይፈልጋሉ? አንዴ ከተላከ በኋላ ማስተካከል አይቻልም።")) return;
    
    setLoading('submit');
    setError(null);
    try {
      const url = await uploadAttachment();
      const narrationData = { text: narrationText, attachment_url: url, attachment_name: attachmentName };
      const fullData = { ...existingData, narration_report: narrationData };
      
      const res = await submitReportAction(userId, region, year, period, fullData);
      if (res.error) {
        setError(res.error);
        setLoading(null);
      } else {
        alert("በተሳካ ሁኔታ ተልኳል! (Submitted successfully)");
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
      {error && (
        <div className="p-4 bg-status-error/10 border border-status-error/20 text-status-error rounded-xl font-medium text-sm flex items-center gap-2">
          <IconLoader2 size={16} className="hidden" />
          {error}
        </div>
      )}

      <div className="bg-surface-primary border border-border-light rounded-2xl overflow-hidden shadow-sm p-6">
        <label className="block text-sm font-semibold text-text-primary mb-3">
          የጽሁፍ ሪፖርት ማቅረቢያ (Narration Report)
        </label>
        <textarea
          value={narrationText}
          onChange={(e) => setNarrationText(e.target.value)}
          placeholder={isReadOnly ? "" : "እባክዎ የጽሁፍ ሪፖርትዎን እዚህ ላይ ይፃፉ..."}
          disabled={isReadOnly}
          className={`w-full min-h-[200px] px-5 py-4 bg-surface-secondary/50 border border-border-medium rounded-xl focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue outline-none transition-all text-sm text-text-primary resize-y leading-relaxed ${isReadOnly ? 'opacity-90 cursor-not-allowed' : ''}`}
        />

        <div className="mt-6 border-t border-border-light pt-6">
          <label className="block text-sm font-semibold text-text-primary mb-3">
            አባሪ ፋይል (Attachment) - እስከ 50MB (Optional)
          </label>
          
          {!file && !attachmentUrl && !isReadOnly ? (
            <div 
              className="border-2 border-dashed border-border-medium hover:border-brand-blue/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-surface-secondary/30 hover:bg-brand-blue/5 transition-all group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform border border-border-light">
                <IconFileUpload size={24} className="text-brand-blue" />
              </div>
              <p className="text-sm font-medium text-text-primary mb-1">ፋይል ለማያያዝ እዚህ ይጫኑ</p>
              <p className="text-xs text-text-muted">PDF, Word, Excel, Images (Max 50MB)</p>
            </div>
          ) : (attachmentUrl || file) ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-xl gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                  <IconFileText size={20} className="text-brand-blue" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-text-primary truncate">{attachmentName || "Attached File"}</p>
                  <p className="text-xs text-brand-blue font-medium mt-0.5">
                    {file ? 'አዲስ ፋይል (New File)' : 'የተያያዘ (Already attached)'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                {attachmentUrl && (
                  <a
                    href={attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none text-center px-4 py-2 bg-white text-brand-blue font-bold rounded-lg hover:bg-brand-blue/10 border border-brand-blue/20 transition-all text-sm shadow-sm"
                  >
                    አውርድ (Download)
                  </a>
                )}
                {!isReadOnly && (
                  <button 
                    onClick={clearFile}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-text-secondary hover:text-status-error transition-all shrink-0 shadow-sm"
                  >
                    <IconX size={16} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-surface-secondary/30 border border-border-light rounded-xl text-sm text-text-muted text-center">
              ምንም ፋይል አልተያያዘም (No file attached)
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            disabled={isReadOnly}
          />
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border-light">
          <button
            onClick={handleSave}
            disabled={loading !== null}
            className="flex-1 px-4 py-3 bg-surface-secondary hover:bg-border-light text-text-secondary font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-border-medium shadow-sm"
          >
            {loading === 'save' ? <IconLoader2 size={20} className="animate-spin" /> : <IconDeviceFloppy size={20} />}
            በመሰራት ላይ አቆይ (Save Draft)
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading !== null || !narrationText.trim()}
            className="flex-1 px-4 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue/90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === 'submit' ? <IconLoader2 size={20} className="animate-spin" /> : <IconSend size={20} />}
            ወደ አድሚን ላክ (Submit Report)
          </button>
        </div>
      )}
    </div>
  );
}

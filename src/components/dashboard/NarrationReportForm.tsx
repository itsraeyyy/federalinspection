"use client";

import { useState, useRef } from "react";
import { saveReportFormAction, submitReportAction, uploadReportAttachmentAction } from "@/app/actions/reports";
import { ReportPeriod } from "@/lib/et-calendar";
import { IconDeviceFloppy, IconSend, IconLoader2, IconFileUpload, IconX, IconFileText } from "@tabler/icons-react";
import { supabase } from "@/lib/supabaseClient";

interface NarrationReportFormProps {
  userId?: string;
  region?: string;
  year?: number;
  period?: ReportPeriod;
  existingData?: any;
  initialData?: any;
  onChange?: (data: any) => void;
  onSuccess?: () => void;
  isReadOnly?: boolean;
  hideActions?: boolean;
}

export function NarrationReportForm({
  userId,
  region,
  year,
  period,
  existingData,
  initialData,
  onChange,
  onSuccess,
  isReadOnly = false,
  hideActions = false
}: NarrationReportFormProps) {
  const [narrationText, setNarrationText] = useState(initialData?.text || existingData?.narration_report?.text || "");
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(initialData?.attachment_url || existingData?.narration_report?.attachment_url || null);
  const [attachmentName, setAttachmentName] = useState<string | null>(initialData?.attachment_name || existingData?.narration_report?.attachment_name || null);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState<'save' | 'submit' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sanitizeSegment = (str: string) => {
    return encodeURIComponent((str || '').trim())
      .replace(/%/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_') || 'default';
  };

  const handleTextChange = (text: string) => {
    setNarrationText(text);
    onChange?.({ text, attachment_url: attachmentUrl, attachment_name: attachmentName });
  };

  const uploadFileDirectly = async (selectedFile: File): Promise<string | null> => {
    const safeYear = sanitizeSegment(year ? year.toString() : 'general');
    const safeRegion = sanitizeSegment(region || 'all');
    const fileExt = selectedFile.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `${safeYear}/${safeRegion}/${fileName}`;

    let uploadedUrl: string | null = null;

    // 1. Try client-side upload
    try {
      const { data, error: clientErr } = await supabase.storage
        .from('report_attachments')
        .upload(storagePath, selectedFile, { upsert: true });

      if (!clientErr) {
        const { data: publicData } = supabase.storage
          .from('report_attachments')
          .getPublicUrl(storagePath);
        if (publicData?.publicUrl) uploadedUrl = publicData.publicUrl;
      }
    } catch (clientEx) {
      console.warn("Client upload exception:", clientEx);
    }

    // 2. Fallback to Server Action
    if (!uploadedUrl) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (year) formData.append('year', year.toString());
      if (region) formData.append('region', region);

      const res = await uploadReportAttachmentAction(formData);
      if (res.url) uploadedUrl = res.url;
      else throw new Error(res.error || 'Upload failed');
    }

    return uploadedUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("የፋይል መጠኑ ከ 50MB መብለጥ የለበትም (File size must be under 50MB)");
        return;
      }
      setFile(selectedFile);
      setAttachmentName(selectedFile.name);
      setError(null);
      setIsUploading(true);

      try {
        const url = await uploadFileDirectly(selectedFile);
        setAttachmentUrl(url);
        onChange?.({ text: narrationText, attachment_url: url, attachment_name: selectedFile.name });
      } catch (err: any) {
        setError(`ፋይል ማያያዝ አልተቻለም: ${err.message}`);
        setFile(null);
        setAttachmentName(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setAttachmentName(null);
    setAttachmentUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onChange?.({ text: narrationText, attachment_url: null, attachment_name: null });
  };

  const handleSave = async () => {
    setLoading('save');
    setError(null);
    try {
      let url = attachmentUrl;
      if (file && !url) {
        url = await uploadFileDirectly(file);
        setAttachmentUrl(url);
      }
      const narrationData = { text: narrationText, attachment_url: url, attachment_name: attachmentName };
      onChange?.(narrationData);

      if (userId && region && year && period) {
        const fullData = { ...existingData, narration_report: narrationData };
        const res = await saveReportFormAction(userId, region, year, period, fullData);
        if (res.error) setError(res.error);
        else alert("በተሳካ ሁኔታ ተቀምጧል! (Saved successfully)");
      } else {
        alert("በተሳካ ሁኔታ ተቀምጧል! (Saved locally)");
      }
    } catch (err: any) {
      setError(err.message || 'Save error');
    } finally {
      setLoading(null);
    }
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
      let url = attachmentUrl;
      if (file && !url) {
        url = await uploadFileDirectly(file);
        setAttachmentUrl(url);
      }
      const narrationData = { text: narrationText, attachment_url: url, attachment_name: attachmentName };
      onChange?.(narrationData);

      if (userId && region && year && period) {
        const fullData = { ...existingData, narration_report: narrationData };
        const res = await submitReportAction(userId, region, year, period, fullData);
        if (res.error) {
          setError(res.error);
        } else {
          alert("በተሳካ ሁኔታ ተልኳል! (Submitted successfully)");
          onSuccess?.();
        }
      } else {
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'Submit error');
    } finally {
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
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={isReadOnly ? "" : "እባክዎ የጽሁፍ ሪፖርትዎን እዚህ ላይ ይፃፉ..."}
          rows={10}
          disabled={isReadOnly}
          className="w-full p-4 bg-surface-secondary border border-border-medium rounded-xl text-text-primary focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all resize-y text-base leading-relaxed disabled:opacity-80"
        />

        <div className="mt-6 pt-6 border-t border-border-light">
          <label className="block text-sm font-semibold text-text-primary mb-2">
            አባሪ ፋይል (Attachment) - እስከ 50MB (Optional)
          </label>

          {!isReadOnly && !attachmentUrl && !file ? (
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
                  {isUploading ? (
                    <IconLoader2 size={20} className="text-brand-blue animate-spin" />
                  ) : (
                    <IconFileText size={20} className="text-brand-blue" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-text-primary truncate">{attachmentName || "Attached File"}</p>
                  <p className="text-xs text-brand-blue font-medium mt-0.5">
                    {isUploading ? 'በመጫን ላይ... (Uploading...)' : attachmentUrl ? 'የተያያዘ (Attached)' : 'አዲስ ፋይል'}
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
                {!isReadOnly && !isUploading && (
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
            disabled={isReadOnly || isUploading}
          />
        </div>
      </div>

      {!isReadOnly && !hideActions && (
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border-light">
          <button
            onClick={handleSave}
            disabled={loading !== null || isUploading}
            className="flex-1 px-4 py-3 bg-surface-secondary hover:bg-border-light text-text-secondary font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-border-medium shadow-sm"
          >
            {loading === 'save' ? <IconLoader2 size={20} className="animate-spin" /> : <IconDeviceFloppy size={20} />}
            በመሰራት ላይ አቆይ (Save Draft)
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading !== null || isUploading || !narrationText.trim()}
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

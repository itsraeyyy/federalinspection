"use client";

import { useState, useRef } from "react";
import { FileText, Send, UploadCloud, CheckCircle2, Copy, ArrowRight, ArrowLeft, X, FileIcon, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { complaintService } from "@/services/complaints";
import { regionsData } from "@/lib/regions-data";
import Link from "next/link";

const TOS_ABETUTA = `የአቤቱታ አቀራረብ ስርአት

አቤቱታ ማለት በየደረጃው ላለው የፓርቲ መዋቅር ቅሬታ አቅርቦ በውሳኔው ባልረኩ አባላት ወይም አመራር ወይም አካላት በየደረጃው ላሉት የኮሚሽን መዋቅር የሚቀርብ አቤቱታ ነው

የአቤቱታ አቅራቢው የሚኖረው ግዴታ:
  1) አቤቱታውን በጽሁፍ ማቅረብ አለበት
  2) የአቤቱታ አቅራቢው ሙሉ ስም
  3) የአቤቱታው ጭብጥና የምቃወምበት ምክንያቶች
  4) የውሳኔ ግልባጭ እና ሌሎች ደጋፊ ማስረጃዎች

ማንኛውም አቤቱታ አቅራቢ ለሚያቀርበው አቤቱታ ተገቢውን የሰነድ ማስረጃዎች በተጠየቀ ጊዜ የማቅረብ ግዴታ አለበት

ማንኛውም አቤቱታ አቅራቢ የሚያቀርበው ሰነድ ህጋዊ ስለመሆኑ የማረጋገጥና በተጠየቀበት ጊዜ የማስረዳት ግዴታ አለበት

ማንኛውም አቤቱታ አቅራቢ ከራሱ የግል ፍላጎት በመነሳት የፓርቲውን ወይም አባል ወይም አመራር መልካም ስም በሚጎዳ መልኩ ለሚያቀርበው አቤቱታ በፓርቲው የዲስፕሊን መመሪያ ተጠያቂ ይሆናል

የአቤቱታ ማቅረቢያ ጊዜ:
  1) አቤቱታ አቅራቢው የሚቀርበው አቤቱታ ለአቤቱታ መነሻ የሆነ ውሳኔ ከሰጠበት ጊዜው አንስቶ ባሉት ተከታታይ ስድስት ወራት ውስጥ ማቅረብ አለበት
  2) ከተጠቀሰው ጊዜ አቤቱታውን ካልቀረበ አቤቱታው በይርጋ የታገደ ይሆናል

በአቤቱታ የማይታዩ ጉዳዮች:
  1) በይርጋ የታገዱ ጉዳዮች
  2) በፓርቲ መዋቅር ቅሬታው ቀርቦ ውሳኔ ያልተሰጠው ጉዳዮች
  3) በፍርድ ቤት የተያዘ ጉዳይ
  4) በፍርድ ቤት መብቱ የተገፈፈ አባል ጉዳዮች`;

type Step = 'tos' | 'personal' | 'details' | 'submitting' | 'success';

export function AbetutaForm() {
  const tosContent = TOS_ABETUTA;

  // Step state
  const [step, setStep] = useState<Step>('tos');
  const [tosAgreed, setTosAgreed] = useState(false);

  // Form data
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submissionType, setSubmissionType] = useState<'በግል' | 'በቡድን'>('በግል');
  const [memberCount, setMemberCount] = useState('');
  const [institution, setInstitution] = useState('');
  const [targetRegion, setTargetRegion] = useState('');
  const [targetZone, setTargetZone] = useState('');
  const [mainSubject, setMainSubject] = useState('');
  const [requestedResolution, setRequestedResolution] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [error, setError] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  // Validation
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});
  const [detailErrors, setDetailErrors] = useState<Record<string, string>>({});

  const validatePersonal = (): boolean => {
    const errs: Record<string, string> = {};
    if (!phone.trim()) errs.phone = 'ስልክ ቁጥርዎን ያስገቡ';
    setPersonalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateDetails = (): boolean => {
    const errs: Record<string, string> = {};
    if (!targetRegion.trim()) errs.targetRegion = 'ክልል ይምረጡ';
    if (!targetZone.trim()) errs.targetZone = 'ዞን/ክፍለ ከተማ ይምረጡ';
    if (!institution.trim()) errs.institution = 'የተቋሙን ስም ያስገቡ';
    if (!mainSubject.trim()) errs.mainSubject = 'ዝርዝር ሁኔታውን ያስገቡ';
    setDetailErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateDetails()) return;
    setStep('submitting');
    setError('');

    try {
      const result = await complaintService.submitComplaint({
        name: fullName,
        phone,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        address: address || undefined,
        submissionMode: submissionType,
        memberCount: submissionType === 'በቡድን' && memberCount ? parseInt(memberCount) : undefined,
        institution,
        targetRegion,
        targetZone,
        type: 'Complaint',
        subject: institution,
        message: mainSubject,
        requestedResolution: requestedResolution || undefined,
        files: files.length > 0 ? files : undefined,
      });

      if (result) {
        setTrackingCode(result.trackingCode);
        setStep('success');
      } else {
        setError('ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።');
        setStep('details');
      }
    } catch {
      setError('ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።');
      setStep('details');
    }
  };

  const copyTrackingCode = () => {
    navigator.clipboard.writeText(trackingCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const pageTitle = "አቤቱታ ማቅረቢያ";
  const formTitle = "የአቤቱታ ማቅረቢያ ቅጽ";
  const submitterLabel = "የአቤቱታ አቅራቢው ሙሉ ስም";
  const subTypeLabel = "አቤቱታው የቀረበው";
  const instLabel = "አቤቱታ የቀረበበት ተቋም / የሚመለከተው አካል ስም";
  const subjectLabel = "የአቤቱታው ዋና ጭብጥ";
  const submitLabel = "አቤቱታ አስገባ";
  const tosTitle = "የአቤቱታ አቀራረብ ስርአት";
  const accentColor = '#B45309';

  // Progress indicator
  const stepLabels = ['ውል', 'የግል መረጃ', 'ዝርዝር'];
  const stepIndex = step === 'tos' ? 0 : step === 'personal' ? 1 : 2;

  if (step === 'success') {
    return (
      <div className="container-site mx-auto max-w-2xl py-12 md:py-20 px-4">
        <div className="rounded-3xl bg-white p-8 sm:p-12 shadow-lg ring-1 ring-slate-100 text-center">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}10` }}>
            <CheckCircle2 className="size-10" style={{ color: accentColor }} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            አቤቱታዎ በተሳካ ሁኔታ ቀርቧል!
          </h2>
          <p className="text-slate-600 mb-8">
            የእርስዎ አቤቱታ ተቀብለናል። ከታች ያለውን የክትትል ኮድ ይጠቀሙ ሁኔታውን ለመከታተል።
          </p>

          {/* Tracking Code Card */}
          <div className="rounded-2xl border-2 border-dashed p-6 mb-6" style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}05` }}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">የክትትል ኮድ</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-mono font-bold tracking-widest" style={{ color: accentColor }}>
                {trackingCode}
              </span>
              <button
                onClick={copyTrackingCode}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                title="ይቅዱ"
              >
                {codeCopied ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : (
                  <Copy className="size-5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-8 text-left">
            <p className="text-sm text-amber-800 font-semibold mb-1">⚠️ ይህን ኮድ ያስቀምጡ!</p>
            <p className="text-sm text-amber-700">
              ይህ ኮድ አቤቱታዎን ለመከታተል ያስፈልጋል። ቅጽበታዊ ቅጂ ያድርጉ ወይም ይቅዱ — ለወደፊት ያስፈልጋል።
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/track?code=${trackingCode}`}
              className="flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              style={{ backgroundColor: accentColor }}
            >
              <Search className="size-4" />
              ሁኔታ ይከታተሉ
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              ወደ መነሻ ይመለሱ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'submitting') {
    return (
      <div className="container-site mx-auto max-w-2xl py-12 md:py-20 px-4">
        <div className="rounded-3xl bg-white p-12 shadow-lg ring-1 ring-slate-100 text-center">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-slate-200 border-t-[#B45309] animate-spin" />
          <p className="text-lg font-semibold text-slate-700">
            አቤቱታዎ በመላክ ላይ...
          </p>
          <p className="text-sm text-slate-500 mt-2">እባክዎ ይጠብቁ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-site mx-auto max-w-4xl py-8 md:py-16 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {pageTitle}
        </h1>
        {step !== 'tos' ? (
          <p className="mt-3 text-base text-slate-600">
            እባክዎትን ቅጹን በጥንቃቄ ይሙሉ።
          </p>
        ) : (
          <div className="mt-6 flex justify-center">
            <Link
              href="/track"
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors border border-slate-200 shadow-sm"
            >
              <Search className="size-4" style={{ color: accentColor }} />
              የቀድሞ አቤቱታ ሁኔታ ይከታተሉ (Check Status)
            </Link>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      {step !== 'tos' && (
        <div className="mb-8 flex items-center justify-center gap-2">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    i < stepIndex
                      ? "bg-green-500 text-white"
                      : i === stepIndex
                      ? "text-white shadow-md"
                      : "bg-slate-100 text-slate-400"
                  )}
                  style={i === stepIndex ? { backgroundColor: accentColor } : undefined}
                >
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={cn(
                  "text-xs font-medium hidden sm:inline",
                  i === stepIndex ? "text-slate-900" : "text-slate-400"
                )}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={cn(
                  "w-8 sm:w-16 h-0.5 rounded-full transition-colors",
                  i < stepIndex ? "bg-green-400" : "bg-slate-200"
                )} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 1: TOS Agreement */}
      {step === 'tos' && (
        <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
              <FileText className="size-5" style={{ color: accentColor }} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">{tosTitle}</h2>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 sm:p-8 mb-6 max-h-[50vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-amharic" style={{ fontFamily: 'inherit' }}>
              {tosContent}
            </pre>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group mb-6 p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
            <input
              type="checkbox"
              checked={tosAgreed}
              onChange={(e) => setTosAgreed(e.target.checked)}
              className="mt-0.5 size-5 rounded-md border-slate-300 focus:ring-offset-0"
              style={{ accentColor }}
            />
            <span className="text-sm text-slate-700 font-medium leading-relaxed">
              ከላይ የተጠቀሰውን የአቤቱታ አቀራረብ ስርአት አንብቤ ተረድቻለሁ። ሁሉንም ግዴታዎች ለመቀበል ስምምነቴን አረጋግጣለሁ።
            </span>
          </label>

          <button
            onClick={() => tosAgreed && setStep('personal')}
            disabled={!tosAgreed}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold transition-all",
              tosAgreed
                ? "text-white shadow-lg hover:shadow-xl"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
            style={tosAgreed ? { backgroundColor: accentColor } : undefined}
          >
            ቀጣይ
            <ArrowRight className="size-5" />
          </button>
        </div>
      )}

      {/* Step 2: Personal Information */}
      {step === 'personal' && (
        <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-slate-800">
              የግል መረጃ
            </h2>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              አማራጭ
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            የአቤቱታ አቅራቢውን መረጃ ያስገቡ
          </p>

          <div className="mb-8 rounded-2xl bg-[#014BAA]/5 border border-[#014BAA]/10 p-5 flex items-start gap-4">
            <div className="rounded-full bg-white p-2 shadow-sm shrink-0">
              <ShieldCheck className="size-6 text-[#014BAA]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">ሚስጥራዊነትዎ የተጠበቀ ነው (100% Anonymous)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ማንነትዎን መግለጽ ካልፈለጉ <strong>ስምዎን ብቻ</strong> ባዶ መተው ይችላሉ።
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                የአቤቱታ አቅራቢው ሙሉ ስም 
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] uppercase tracking-wider font-bold text-slate-500">አማራጭ (Optional)</span>
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setPersonalErrors(p => ({ ...p, fullName: '' })); }}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm hover:border-slate-300 focus:bg-white focus:border-[#014BAA] focus:ring-1 focus:ring-[#014BAA] transition-all duration-200"
                placeholder="ማንነትዎን መግለጽ ካልፈለጉ ይህን ባዶ ይተዉት"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="age" className="text-sm font-medium text-slate-700">እድሜ</label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-[#B45309] focus:ring-[#B45309] focus:bg-white transition-colors"
                  placeholder="እድሜ"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">ጾታ</label>
                <div className="flex h-[50px] items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" value="ወንድ" checked={gender === 'ወንድ'} onChange={(e) => setGender(e.target.value)} className="text-[#B45309] focus:ring-[#B45309]" />
                    <span className="text-sm text-slate-600">ወንድ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="gender" value="ሴት" checked={gender === 'ሴት'} onChange={(e) => setGender(e.target.value)} className="text-[#B45309] focus:ring-[#B45309]" />
                    <span className="text-sm text-slate-600">ሴት</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  ስልክ ቁጥር <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPersonalErrors(p => ({ ...p, phone: '' })); }}
                  className={cn(
                    "block w-full rounded-xl border bg-slate-50 px-4 py-3.5 text-sm focus:bg-white transition-colors",
                    personalErrors.phone ? "border-red-300 focus:border-red-400 focus:ring-red-400" : "border-slate-200 focus:border-[#014BAA] focus:ring-[#014BAA]"
                  )}
                  placeholder="+251 9..."
                />
                {personalErrors.phone && <p className="text-xs text-red-500">{personalErrors.phone}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium text-slate-700">አድራሻ</label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-[#B45309] focus:ring-[#B45309] focus:bg-white transition-colors"
                  placeholder="የመኖሪያ አድራሻ"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setStep('tos')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="size-4" />
              ተመለስ
            </button>
            <button
              onClick={() => { if (validatePersonal()) setStep('details'); }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: accentColor }}
            >
              ቀጣይ
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Submission Details */}
      {step === 'details' && (
        <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-2 text-xl font-bold text-slate-800">
            ዝርዝር መረጃ
          </h2>
          <p className="text-sm text-slate-500 mb-8">
            የአቤቱታውን ዝርዝር ይሙሉ
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="targetRegion" className="text-sm font-medium text-slate-700">ክልል <span className="text-red-500">*</span></label>
                <select
                  id="targetRegion"
                  value={targetRegion}
                  onChange={(e) => {
                    setTargetRegion(e.target.value);
                    setTargetZone('');
                    setDetailErrors(p => ({ ...p, targetRegion: '' }));
                  }}
                  className={cn(
                    "block w-full rounded-xl border bg-slate-50 px-4 py-3.5 text-sm focus:bg-white transition-colors",
                    detailErrors.targetRegion ? "border-red-300 focus:border-red-400 focus:ring-red-400" : "border-slate-200 focus:border-[#B45309] focus:ring-[#B45309]"
                  )}
                >
                  <option value="">ክልል ይምረጡ</option>
                  {Object.keys(regionsData).map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                {detailErrors.targetRegion && <p className="text-xs text-red-500">{detailErrors.targetRegion}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="targetZone" className="text-sm font-medium text-slate-700">
                  {targetRegion === 'አዲስ አበባ' ? 'ክፍለ ከተማ' : 'ዞን'} <span className="text-red-500">*</span>
                </label>
                <select
                  id="targetZone"
                  value={targetZone}
                  onChange={(e) => {
                    setTargetZone(e.target.value);
                    setDetailErrors(p => ({ ...p, targetZone: '' }));
                  }}
                  disabled={!targetRegion}
                  className={cn(
                    "block w-full rounded-xl border bg-slate-50 px-4 py-3.5 text-sm transition-colors",
                    !targetRegion ? "opacity-50 cursor-not-allowed" : "focus:bg-white",
                    detailErrors.targetZone ? "border-red-300 focus:border-red-400 focus:ring-red-400" : "border-slate-200 focus:border-[#B45309] focus:ring-[#B45309]"
                  )}
                >
                  <option value="">{targetRegion === 'አዲስ አበባ' ? 'ክፍለ ከተማ ይምረጡ' : 'ዞን ይምረጡ'}</option>
                  {targetRegion && regionsData[targetRegion]?.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
                {detailErrors.targetZone && <p className="text-xs text-red-500">{detailErrors.targetZone}</p>}
              </div>
            </div>

            {/* Submission Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{subTypeLabel}</label>
              <div className="flex gap-3">
                {(['በግል', 'በቡድን'] as const).map(val => (
                  <label
                    key={val}
                    className={cn(
                      "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium transition-all",
                      submissionType === val
                        ? "border-[#B45309] bg-[#B45309]/5 text-[#B45309] shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <input type="radio" name="subType" value={val} className="hidden" checked={submissionType === val} onChange={() => setSubmissionType(val)} />
                    {val}
                  </label>
                ))}
              </div>
            </div>

            {submissionType === 'በቡድን' && (
              <div className="space-y-2">
                <label htmlFor="memberCount" className="text-sm font-medium text-slate-700">የአባላት ብዛት</label>
                <input
                  type="number"
                  id="memberCount"
                  value={memberCount}
                  onChange={(e) => setMemberCount(e.target.value)}
                  className="block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-[#B45309] focus:ring-[#B45309] focus:bg-white transition-colors"
                  placeholder="ብዛት ያስገቡ"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="institution" className="text-sm font-medium text-slate-700">{instLabel}</label>
              <input
                type="text"
                id="institution"
                value={institution}
                onChange={(e) => { setInstitution(e.target.value); setDetailErrors(p => ({ ...p, institution: '' })); }}
                className={cn(
                  "block w-full rounded-xl border bg-slate-50 px-4 py-3.5 text-sm focus:bg-white transition-colors",
                  detailErrors.institution ? "border-red-300 focus:border-red-400 focus:ring-red-400" : "border-slate-200 focus:border-[#B45309] focus:ring-[#B45309]"
                )}
                placeholder="የተቋሙ ስም"
              />
              {detailErrors.institution && <p className="text-xs text-red-500">{detailErrors.institution}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="mainSubject" className="text-sm font-medium text-slate-700">{subjectLabel}</label>
              <textarea
                id="mainSubject"
                value={mainSubject}
                onChange={(e) => { setMainSubject(e.target.value); setDetailErrors(p => ({ ...p, mainSubject: '' })); }}
                rows={4}
                className={cn(
                  "block w-full resize-none rounded-xl border bg-slate-50 px-4 py-3.5 text-sm focus:bg-white transition-colors",
                  detailErrors.mainSubject ? "border-red-300 focus:border-red-400 focus:ring-red-400" : "border-slate-200 focus:border-[#B45309] focus:ring-[#B45309]"
                )}
                placeholder="ዝርዝር ሁኔታውን ያስገቡ..."
              />
              {detailErrors.mainSubject && <p className="text-xs text-red-500">{detailErrors.mainSubject}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="resolution" className="text-sm font-medium text-slate-700">
                እንዲደረግለት / እንዲፈጸምለት የሚፈልገው መፍትሄ
              </label>
              <textarea
                id="resolution"
                value={requestedResolution}
                onChange={(e) => setRequestedResolution(e.target.value)}
                rows={3}
                className="block w-full resize-none rounded-xl border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-[#B45309] focus:ring-[#B45309] focus:bg-white transition-colors"
                placeholder="የሚጠብቁትን መፍትሄ ያስገቡ..."
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                ተያያዥ ማስረጃዎች (ካሉ)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-[#B45309]/50 transition-colors"
              >
                <UploadCloud className="mb-2 size-7 text-slate-400" />
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-[#B45309]">ጫን</span> ወይም ፋይሉን እዚህ ይጎትቱ
                </p>
                <p className="text-xs text-slate-400">PDF, JPG, PNG, DOC (ከ 10MB ያልበለጠ)</p>
                <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileSelect} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
              </div>
              {files.length > 0 && (
                <div className="space-y-2 mt-3">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <FileIcon className="size-4 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700 truncate flex-1">{file.name}</span>
                      <span className="text-xs text-slate-400 shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                      <button onClick={() => removeFile(i)} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setStep('personal')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="size-4" />
              ተመለስ
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 group flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: accentColor }}
            >
              <Send className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              {submitLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

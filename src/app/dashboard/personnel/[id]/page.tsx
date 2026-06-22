'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconDeviceFloppy, IconTrash, IconCamera } from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personnelSchema } from "@/lib/validations";
import { personnelService } from "@/services/personnel";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import * as z from "zod";
import { COMMISSION_POSITIONS, OFFICE_CATEGORIES, Personnel } from "@/types";

const editPersonnelSchema = z.object({
  positionId: z.string().min(1, 'ሹመት ያስፈልጋል።'),
  officeId: z.string().min(1, 'ምድብ ያስፈልጋል።'),
  fullName: z.string().min(1, 'ሙሉ ስም ያስፈልጋል።'),
  gender: z.string().min(1, 'ፆታ ያስፈልጋል።'),
  age: z.coerce.number().min(18, 'ዕድሜ ያስፈልጋል።'),
  ethnicity: z.string().optional(),
  educationLevel: z.string().optional(),
  educationType: z.string().optional(),
  expProfessional: z.string().optional(),
  expLeadership: z.string().optional(),
  workplace: z.string().optional(),
  membershipYears: z.string().optional(),
  responsibility: z.string().optional(),
  commissionTenure: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  photoFile: z.any().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
});

type EditPersonnelFormValues = z.infer<typeof editPersonnelSchema>;

export default function EditPersonnelPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [personnelData, setPersonnelData] = useState<Personnel | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{type: 'error' | 'success', text: string} | null>(null);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(editPersonnelSchema),
  });

  const positionId = watch('positionId');

  useEffect(() => {
    personnelService.getPersonnelById(id).then(data => {
      if (data) {
        setPersonnelData(data);
        const pos = COMMISSION_POSITIONS.find(p => p.nameEn === data.position) || COMMISSION_POSITIONS[0];
        const off = OFFICE_CATEGORIES.find(o => o.nameEn === data.officeCategory) || OFFICE_CATEGORIES[0];
        
        reset({
          positionId: pos.id,
          officeId: off.id,
          fullName: data.nameAm || data.name,
          gender: 'male', // default or derived if existed
          age: 30, // default or derived
          educationType: data.department,
          phone: data.phone,
          message: data.message || '',
          status: data.status,
        });

        if (data.photo) {
          setPhotoPreview(data.photo);
        }
      }
      setLoading(false);
    });
  }, [id, reset]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      setStatusMsg(null);
      const pos = COMMISSION_POSITIONS.find(p => p.id === formData.positionId);
      const off = OFFICE_CATEGORIES.find(o => o.id === formData.officeId);
      if (!pos || !off) {
        setStatusMsg({ type: 'error', text: 'እባክዎ ሹመት እና ምድብ በትክክል ይምረጡ።' });
        return;
      }

      let photoUrl = personnelData?.photo || '';
      if (formData.photoFile && formData.photoFile.length > 0) {
        photoUrl = await personnelService.uploadPhoto(formData.photoFile[0]);
      }

      const payload = {
        name: formData.fullName,
        nameAm: formData.fullName,
        position: pos.nameEn,
        positionAm: pos.nameAm,
        officeCategory: off.nameEn,
        officeCategoryAm: off.nameAm,
        department: formData.educationType || '',
        phone: formData.phone || '',
        photo: photoUrl,
        message: pos.id === 'chief' ? formData.message : undefined,
        status: formData.status || 'Active',
      };
      await personnelService.updatePersonnel(id, payload);
      setStatusMsg({ type: 'success', text: 'መረጃው በትክክል ተሻሽሏል!' });
      setTimeout(() => {
        router.push('/dashboard/personnel');
      }, 1500);
    } catch (error: any) {
      console.error(error);
      setStatusMsg({ type: 'error', text: error.message || 'መረጃ ማሻሻል አልተቻለም። እባክዎ እንደገና ይሞክሩ።' });
    }
  };

  const handleDelete = async () => {
    if (confirm(' እርግጠኛ ነዎት ይህን መረጃ ማጥፋት ይፈልጋሉ?')) {
      await personnelService.deletePersonnel(id);
      router.push('/dashboard/personnel');
    }
  };

  if (loading) return <DashboardLayout><div className="flex h-full items-center justify-center text-text-muted">በማምጣት ላይ...</div></DashboardLayout>;
  if (!personnelData) return <DashboardLayout><div className="flex h-full items-center justify-center text-text-muted">መረጃ አልተገኘም</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div>
            <Link href="/dashboard/personnel" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> ወደ ዝርዝር ተመለስ
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">መረጃ አስተካክል</h1>
            <p className="text-sm text-text-muted mt-1">{personnelData.nameAm || personnelData.name} መረጃ ማስተካከያ</p>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={handleDelete} className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger px-5 py-2.5 rounded-full text-sm font-semibold transition-colors">
              <IconTrash size={18} />
              አጥፋ
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow/90 text-[#3D352E] px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm disabled:opacity-50">
              <IconDeviceFloppy size={18} />
              {isSubmitting ? 'በማስቀመጥ ላይ...' : 'ለውጦችን አስቀምጥ'}
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className={`p-4 rounded-xl text-sm font-semibold ${statusMsg.type === 'error' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>
            {statusMsg.text}
          </div>
        )}

        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-8">
          {/* Photo Upload */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የአባል ፎቶ (Photo)</h3>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-surface-primary border border-border/50 flex items-center justify-center overflow-hidden shrink-0 relative group">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-text-muted text-center px-2">ምንም ፎቶ የለም</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <IconCamera size={24} className="text-white" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <input 
                  type="file" 
                  accept="image/*"
                  {...register('photoFile')}
                  onChange={(e) => {
                    handlePhotoChange(e);
                    register('photoFile').onChange(e);
                  }}
                  className="text-sm text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 cursor-pointer"
                />
                <p className="text-xs text-text-muted">የሚፈቀደው መጠን: እስከ 5MB.</p>
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* ሹመት እና ምድብ */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሹመት እና ምድብ</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሹመት</label>
                <select {...register('positionId')} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors appearance-none cursor-pointer">
                  <option value="">ሹመት ይምረጡ...</option>
                  {COMMISSION_POSITIONS.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.nameAm}</option>
                  ))}
                </select>
                {errors.positionId && <span className="text-xs text-danger">{errors.positionId.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ምድብ</label>
                <select {...register('officeId')} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors appearance-none cursor-pointer">
                  <option value="">ምድብ ይምረጡ...</option>
                  {OFFICE_CATEGORIES.map(off => (
                    <option key={off.id} value={off.id}>{off.nameAm}</option>
                  ))}
                </select>
                {errors.officeId && <span className="text-xs text-danger">{errors.officeId.message}</span>}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሁኔታ</label>
                <select {...register('status')} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors appearance-none cursor-pointer">
                  <option value="Active">ገቢር (Active)</option>
                  <option value="Inactive">ታግዷል (Inactive)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* የግል መረጃ */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የግል መረጃ</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የአባሉ ሙሉ ስም</label>
                <input {...register('fullName')} type="text" placeholder="የአባሉ ሙሉ ስም" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors" />
                {errors.fullName && <span className="text-xs text-danger">{errors.fullName.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የትምህርት አይነት (Department)</label>
                <input {...register('educationType')} type="text" placeholder="ለምሳሌ፦ ህግ፣ ኢንጂነሪንግ" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ስልክ ቁጥር</label>
                <input {...register('phone')} type="tel" placeholder="+251 911 123 456" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors" />
              </div>
            </div>
          </div>

          {positionId === 'chief' && (
            <>
              <div className="w-full h-[1px] bg-border/20"></div>
              {/* Conditional Message for Chief Commissioner */}
              <div className="flex flex-col gap-6">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">መልዕክት (ዋና ኮሚሽነር ብቻ)</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">መልዕክት</label>
                  <textarea {...register('message')} placeholder="ዋና ኮሚሽነሩ የሚያስተላልፉት መልዕክት ካለ እዚህ ያስገቡ..." rows={4} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors resize-none" />
                  <p className="text-xs text-text-muted">ይህ ክፍል የሚሞላው ለዋና ኮሚሽነር ብቻ ነው</p>
                </div>
              </div>
            </>
          )}

        </div>
      </form>
    </DashboardLayout>
  );
}

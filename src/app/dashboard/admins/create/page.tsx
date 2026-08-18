'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconShieldCheck,
  IconShield,
  IconScale,
  IconInbox,
  IconNews,
  IconClipboardCheck,
  IconChartBar,
  IconSchool,
  IconUsers,
  IconAdjustmentsHorizontal,
  IconCheck
} from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminSchema } from "@/lib/validations";
import { provisionAdmin } from "@/app/actions/admin-provisioning";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";
import { ALL_MODULES } from "@/types";

type AdminFormValues = z.infer<typeof adminSchema>;
type SpecificRoleType =
  | 'committee_leader'
  | 'complaint_receiver'
  | 'content_manager'
  | 'assessment_coordinator'
  | 'reports_officer'
  | 'training_coordinator'
  | 'personnel_manager'
  | 'custom';

const ACCESS_OPTIONS = [
  {
    value: 'specific' as const,
    label: 'የተወሰነ መዳረሻ',
    desc: 'የኮሚሽን ጽ/ቤት ሃላፊ፣ አቤቱታ ተቀባይ ወይም ሌሎች የተወሰኑ የስራ ሚናዎችን ይምረጡ።',
    icon: IconShield,
  },
  {
    value: 'all' as const,
    label: 'ሙሉ መዳረሻ',
    desc: 'ሁሉንም ሞጁሎች እና የስርዓት ቅንብሮች ሙሉ በሙሉ ማስተዳደር የሚችል ጠቅላላ አስተዳዳሪ።',
    icon: IconShieldCheck,
  },
];

const SPECIFIC_ROLE_OPTIONS = [
  {
    id: 'committee_leader' as SpecificRoleType,
    title: '1. የኮሚሽን ጽ/ቤት ሃላፊ',
    badge: 'ልዩ መግቢያ — /complaint/login',
    desc: 'አቤቱታዎችን ይመረምራል፣ ለአጣሪ ኮሚቴ ይመራል፣ የውሳኔ ሀሳቦችን ያጸድቃል እንዲሁም የመጨረሻ ውሳኔ ይሰጣል።',
    icon: IconScale,
  },
  {
    id: 'complaint_receiver' as SpecificRoleType,
    title: '2. የአቤቱታ ተቀባይ / አስተናጋጅ',
    badge: 'አስተዳዳሪ ዴስክ — /dashboard/complaints',
    desc: 'አዳዲስ አቤቱታዎችንና ጥቆማዎችን ይቀበላል፣ አጣሪ ኮሚቴ ይመድባል፣ ምርመራ አካሂዶ ረቂቅ ውሳኔ ያዘጋጃል።',
    icon: IconInbox,
  },
  {
    id: 'content_manager' as SpecificRoleType,
    title: '3. የይዘት እና ሚዲያ አስተዳዳሪ',
    badge: 'አስተዳዳሪ ዴስክ — /dashboard/news',
    desc: 'ዜናዎችን፣ መግለጫዎችን፣ የኮሚሽኑን መልዕክቶች እና ይፋዊ ሰነዶችን ያትማል፣ ያስተዳድራል።',
    icon: IconNews,
  },
  {
    id: 'assessment_coordinator' as SpecificRoleType,
    title: '4. የምዘና አስተባባሪ',
    badge: 'አስተዳዳሪ ዴስክ — /dashboard/assessment',
    desc: 'የምዘና ጊዜዎችን፣ የምዘና ቡድኖችን፣ አባላትን፣ የ 360° አፈጻጸም ምዘናዎችንና ውጤቶችን ያስተዳድራል።',
    icon: IconClipboardCheck,
  },
  {
    id: 'reports_officer' as SpecificRoleType,
    title: '5. የሪፖርት እና ስታቲስቲክስ ሃላፊ',
    badge: 'አስተዳዳሪ ዴስክ — /dashboard/forms',
    desc: 'የክልል ተወካዮች ሪፖርቶችን፣ የቅጽ አሞላል ሁኔታዎችን፣ የስታቲስቲክስ ዳታና ግራፎችን ይከታተላል፣ ያጸድቃል።',
    icon: IconChartBar,
  },
  {
    id: 'training_coordinator' as SpecificRoleType,
    title: '6. የስልጠና እና አቅም ግንባታ አስተባባሪ',
    badge: 'አስተዳዳሪ ዴስክ — /dashboard/sletena',
    desc: 'የስልጠና ፍላጎት ዳሰሳዎችን፣ የተሳታፊዎችን የስልጠና እርካታ እና የክህሎት ማጎልበቻ ፕሮግራሞችን ያስተዳድራል።',
    icon: IconSchool,
  },
  {
    id: 'personnel_manager' as SpecificRoleType,
    title: '7. የአመራር አካላት አስተባባሪ',
    badge: 'አስተዳዳሪ ዴስክ — /dashboard/personnel',
    desc: 'የኮሚሽኑን የአመራር አካላት ፕሮፋይል፣ የኃላፊነት ደረጃና አደረጃጀት ያስተዳድራል።',
    icon: IconUsers,
  },
  {
    id: 'custom' as SpecificRoleType,
    title: '8. ብጁ የተመረጡ ሞጁሎች',
    badge: 'የተመረጡ ሞጁሎች',
    desc: 'ከተዘረዘሩት ሞጁሎች መካከል የሚፈለጉትን የተወሰኑ ሞጁሎች በተናጠል መርጦ የመስጠት አማራጭ።',
    icon: IconAdjustmentsHorizontal,
  },
];

export default function CreateAdminPage() {
  const router = useRouter();
  const [specificRole, setSpecificRole] = useState<SpecificRoleType>('committee_leader');

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      accessLevel: 'specific',
      specificRoleType: 'committee_leader',
      role: 'committee_leader',
      modules: ['complaints', 'committee-leader', 'abetuta', 'tikoma'],
      status: 'Active',
    },
  });

  const accessLevel = watch('accessLevel');
  const selectedModules = watch('modules') || [];

  const handleAccessLevelChange = (level: 'all' | 'specific') => {
    setValue('accessLevel', level, { shouldValidate: true });
    if (level === 'all') {
      setValue('role', 'super_admin');
      setValue('modules', []);
    } else {
      handleSpecificRoleSelect(specificRole);
    }
  };

  const handleSpecificRoleSelect = (roleType: SpecificRoleType) => {
    setSpecificRole(roleType);
    setValue('specificRoleType', roleType);
    if (roleType === 'committee_leader') {
      setValue('role', 'committee_leader');
      setValue('modules', ['complaints', 'committee-leader', 'abetuta', 'tikoma'], { shouldValidate: true });
    } else if (roleType === 'complaint_receiver') {
      setValue('role', 'admin');
      setValue('modules', ['complaints'], { shouldValidate: true });
    } else if (roleType === 'content_manager') {
      setValue('role', 'admin');
      setValue('modules', ['news', 'documents'], { shouldValidate: true });
    } else if (roleType === 'assessment_coordinator') {
      setValue('role', 'admin');
      setValue('modules', ['assessment', 'personnel', 'statistics'], { shouldValidate: true });
    } else if (roleType === 'reports_officer') {
      setValue('role', 'admin');
      setValue('modules', ['forms', 'admin_forms', 'statistics', 'map'], { shouldValidate: true });
    } else if (roleType === 'training_coordinator') {
      setValue('role', 'admin');
      setValue('modules', ['sletena', 'feedback', 'qr-access'], { shouldValidate: true });
    } else if (roleType === 'personnel_manager') {
      setValue('role', 'admin');
      setValue('modules', ['personnel', 'qr-access'], { shouldValidate: true });
    } else {
      setValue('role', 'admin');
    }
  };

  const toggleModule = (moduleId: string) => {
    const current = [...selectedModules];
    const idx = current.indexOf(moduleId);
    if (idx > -1) { current.splice(idx, 1); }
    else { current.push(moduleId); }
    setValue('modules', current, { shouldValidate: true });
  };

  const onSubmit = async (data: AdminFormValues) => {
    try {
      if (data.accessLevel === 'all') {
        data.role = 'super_admin';
        data.modules = [];
      } else {
        data.specificRoleType = specificRole;
        if (specificRole === 'committee_leader') {
          data.role = 'committee_leader';
          data.modules = ['complaints', 'committee-leader', 'abetuta', 'tikoma'];
        } else if (specificRole === 'complaint_receiver') {
          data.role = 'admin';
          data.modules = ['complaints'];
        } else if (specificRole === 'content_manager') {
          data.role = 'admin';
          data.modules = ['news', 'documents'];
        } else if (specificRole === 'assessment_coordinator') {
          data.role = 'admin';
          data.modules = ['assessment', 'personnel', 'statistics'];
        } else if (specificRole === 'reports_officer') {
          data.role = 'admin';
          data.modules = ['forms', 'admin_forms', 'statistics', 'map'];
        } else if (specificRole === 'training_coordinator') {
          data.role = 'admin';
          data.modules = ['sletena', 'feedback', 'qr-access'];
        } else if (specificRole === 'personnel_manager') {
          data.role = 'admin';
          data.modules = ['personnel', 'qr-access'];
        }
      }
      
      const res = await provisionAdmin(data);
      if (!res.success) {
        console.error(res.error);
        alert(res.error);
        return;
      }
      
      router.push('/dashboard/admins');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <Link href="/dashboard/admins" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> ወደ አስተዳዳሪዎች ተመለስ
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">አዲስ አስተዳዳሪ</h1>
            <p className="text-sm text-text-muted mt-1">የስራ ሚና እና የስርዓት መዳረሻ ፍቃድ ይስጡ።</p>
          </div>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer">
            <IconDeviceFloppy size={18} />
            {isSubmitting ? 'በማስቀመጥ ላይ...' : 'አስቀምጥ'}
          </button>
        </div>

        {/* 1. TOP SECTION: የመዳረሻ ደረጃ (Role & Access Level) */}
        <div className="bg-surface-primary/40 rounded-[2rem] border border-border/30 p-7 md:p-8 backdrop-blur-md flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">የመዳረሻ ደረጃ</h3>
            <p className="text-xs text-text-muted mt-1">ይህ አስተዳዳሪ ምን ዓይነት የስራ ሚና እና መዳረሻ እንደሚኖረው ይምረጡ።</p>
          </div>

          {/* Primary Access Level Switch: Specific vs Full */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {ACCESS_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = accessLevel === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleAccessLevelChange(opt.value)}
                  className={`relative flex flex-col gap-2.5 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brand-blue/60 bg-brand-blue/5 shadow-xs'
                      : 'border-border/30 hover:border-border/60 bg-surface-primary/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${isSelected ? 'border-brand-blue/30 text-brand-blue bg-surface-primary' : 'border-border/40 text-text-muted bg-surface-secondary/40'}`}>
                        <Icon size={20} stroke={1.8} />
                      </div>
                      <span className={`text-sm font-bold ${isSelected ? 'text-brand-blue' : 'text-text-primary'}`}>{opt.label}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-brand-blue bg-brand-blue' : 'border-border/50'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="text-[11px] text-text-muted leading-relaxed pl-0.5">{opt.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Specific Roles List (When 'specific' is active) */}
          {accessLevel === 'specific' && (
            <div className="flex flex-col gap-3.5 pt-2">
              <div className="w-full h-[1px] bg-border/20" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">የተወሰነ አስተዳዳሪ አማራጮች</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {SPECIFIC_ROLE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = specificRole === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSpecificRoleSelect(opt.id)}
                      className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-blue/60 bg-brand-blue/5 shadow-xs'
                          : 'border-border/30 hover:border-border/60 bg-surface-primary/30'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                        isSelected ? 'border-brand-blue/30 text-brand-blue bg-surface-primary' : 'border-border/40 text-text-muted bg-surface-secondary/40'
                      }`}>
                        <Icon size={22} stroke={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={`text-sm font-bold ${isSelected ? 'text-brand-blue' : 'text-text-primary'}`}>
                            {opt.title}
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface-secondary border border-border/40 font-medium text-text-muted">
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-all ${
                        isSelected ? 'border-brand-blue bg-brand-blue text-white' : 'border-border/50'
                      }`}>
                        {isSelected && <IconCheck size={12} stroke={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Modules Selection Grid */}
              {specificRole === 'custom' && (
                <div className="mt-2 p-5 rounded-2xl border border-border/30 bg-surface-secondary/20 flex flex-col gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-text-secondary uppercase tracking-widest">ሞጁሎችን ይምረጡ</h5>
                    <p className="text-xs text-text-muted mt-0.5">ይህ አስተዳዳሪ ማግኘት የሚችላቸውን የተናጠል ሞጁሎች ይምረጡ።</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {ALL_MODULES.map(mod => {
                      const isSelected = selectedModules.includes(mod.id);
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => toggleModule(mod.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-blue/10 border-brand-blue/40 text-brand-blue font-medium'
                              : 'bg-surface-primary border-border/30 hover:border-border/60 text-text-secondary'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'bg-brand-blue border-brand-blue text-white' : 'border-border/60'
                          }`}>
                            {isSelected && <IconCheck size={10} stroke={3} />}
                          </div>
                          <span className="text-xs truncate">{mod.labelAm}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Minimal Role Summary */}
          <div className="w-full h-[1px] bg-border/20" />
          <div className="flex items-center gap-3 bg-surface-secondary/40 rounded-xl p-3.5 border border-border/20">
            <IconShieldCheck size={18} className="text-brand-blue shrink-0" />
            <div className="text-xs text-text-muted leading-relaxed">
              {accessLevel === 'all' && 'ይህ አስተዳዳሪ ሁሉንም ሞጁሎችና ቅንብሮች ሙሉ በሙሉ ማስተዳደር የሚችል ዋና አስተዳዳሪ (Super Admin) ይሆናል።'}
              {accessLevel === 'specific' && specificRole === 'committee_leader' && 'የኮሚሽን ጽ/ቤት ሃላፊ — በልዩ ፖርታል (/complaint/dashboard) አቤቱታዎችን ይመረምራል፣ የመጨረሻ ውሳኔዎችን ያጸድቃል።'}
              {accessLevel === 'specific' && specificRole === 'complaint_receiver' && 'የአቤቱታ ተቀባይ — አዳዲስ አቤቱታዎችን ይቀበላል፣ አጣሪ ኮሚቴ ይመድባል፣ የውሳኔ ረቂቅ ያዘጋጃል።'}
              {accessLevel === 'specific' && specificRole === 'custom' && (
                <>የተመረጡ ሞጁሎች፦ {selectedModules.length > 0 ? selectedModules.map(m => ALL_MODULES.find(mod => mod.id === m)?.labelAm || m).join(', ') : 'እስካሁን አልተመረጡም።'}</>
              )}
            </div>
          </div>
        </div>

        {/* 2. BOTTOM SECTION: የአስተዳዳሪ መረጃ (Admin Profile Information) */}
        <div className="bg-surface-primary/40 rounded-[2rem] border border-border/30 p-7 md:p-8 backdrop-blur-md flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">የአስተዳዳሪ መረጃ</h3>
            <p className="text-xs text-text-muted mt-1">የአስተዳዳሪውን የግል እና የመገናኛ መረጃ ያስገቡ።</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሙሉ ስም</label>
              <input {...register('name')} type="text" placeholder="ለምሳሌ፦ ዶ/ር ታደሰ ወርቁ" className="w-full bg-surface-primary border border-border/50 rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
              {errors.name && <span className="text-xs text-danger">{errors.name.message}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ኢሜይል</label>
              <input {...register('email')} type="email" placeholder="admin@commission.gov" className="w-full bg-surface-primary border border-border/50 rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
              {errors.email && <span className="text-xs text-danger">{errors.email.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ስልክ</label>
              <input {...register('phone')} type="tel" placeholder="+251-911-123-456" className="w-full bg-surface-primary border border-border/50 rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
              {errors.phone && <span className="text-xs text-danger">{errors.phone.message}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሁኔታ</label>
              <select {...register('status')} className="w-full bg-surface-primary border border-border/50 rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                <option value="Active">ንቁ (Active)</option>
                <option value="Inactive">እንቅስቃሴ የለም (Inactive)</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}

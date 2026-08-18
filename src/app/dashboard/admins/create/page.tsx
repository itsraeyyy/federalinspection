'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconShieldCheck,
  IconShield,
  IconScale,
  IconInbox,
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

type SpecificRoleType = 'committee_leader' | 'complaint_receiver' | 'custom';

const ACCESS_OPTIONS = [
  {
    value: 'all' as const,
    label: 'ሙሉ መዳረሻ (Super Admin)',
    desc: 'ሁሉንም ሞጁሎች እና የስርዓት ቅንብሮች ሙሉ በሙሉ ማስተዳደር ይችላል።',
    icon: IconShieldCheck,
    color: 'text-success',
    border: 'border-success/30',
    bg: 'bg-success/5',
  },
  {
    value: 'specific' as const,
    label: 'የተወሰነ መዳረሻ (Specific Access)',
    desc: 'እንደ የኮሚሽን ጽ/ቤት ሃላፊ፣ አቤቱታ ተቀባይ ወይም ብጁ ሞጁሎችን ይምረጡ።',
    icon: IconShield,
    color: 'text-warning',
    border: 'border-warning/30',
    bg: 'bg-warning/5',
  },
];

const SPECIFIC_ROLE_OPTIONS = [
  {
    id: 'committee_leader' as SpecificRoleType,
    title: '1. የኮሚሽን ጽ/ቤት ሃላፊ (Committee Leader)',
    badge: 'ልዩ መግቢያ — /complaint/login',
    desc: 'አቤቱታዎችን ይመረምራል፣ ለአጣሪ ኮሚቴ ይመራል፣ የውሳኔ ሀሳቦችን ያጸድቃል እንዲሁም የመጨረሻ ውሳኔ ይሰጣል።',
    icon: IconScale,
    color: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-500/40',
    bgActive: 'bg-purple-500/10 dark:bg-purple-500/15',
  },
  {
    id: 'complaint_receiver' as SpecificRoleType,
    title: '2. የአቤቱታ ተቀባይ / አስተናጋጅ (Complaint Accepter)',
    badge: 'አስተዳዳሪ ዴስክ — /dashboard/complaints',
    desc: 'አዳዲስ አቤቱታዎችንና ጥቆማዎችን ይቀበላል፣ አጣሪ ኮሚቴ ይመድባል፣ ምርመራ አካሂዶ ረቂቅ ውሳኔ ያዘጋጃል።',
    icon: IconInbox,
    color: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500/40',
    bgActive: 'bg-blue-500/10 dark:bg-blue-500/15',
  },
  {
    id: 'custom' as SpecificRoleType,
    title: '3. ብጁ መዳረሻ (Custom Modules)',
    badge: 'የተመረጡ ሞጁሎች',
    desc: 'የሚፈለጉትን ሌሎች ሞጁሎች (ዜና፣ ሰነዶች፣ ሪፖርቶች፣ ምዘና፣ ስታቲስቲክስ ወዘተ) በተናጠል ይምረጡ።',
    icon: IconAdjustmentsHorizontal,
    color: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/40',
    bgActive: 'bg-amber-500/10 dark:bg-amber-500/15',
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
        <div className="flex justify-between items-end">
          <div>
            <Link href="/dashboard/admins" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> ወደ አስተዳዳሪዎች ተመለስ
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">አዲስ አስተዳዳሪ</h1>
            <p className="text-sm text-text-muted mt-1">የስርዓት መዳረሻ ፍቃድ ይስጡ።</p>
          </div>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer">
            <IconDeviceFloppy size={18} />
            {isSubmitting ? 'በማስቀመጥ ላይ...' : 'አስቀምጥ'}
          </button>
        </div>

        {/* Basic Info */}
        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የአስተዳዳሪ መረጃ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሙሉ ስም</label>
                <input {...register('name')} type="text" placeholder="ለምሳሌ፦ ዶ/ር ታደሰ ወርቁ" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.name && <span className="text-xs text-danger">{errors.name.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ኢሜይል</label>
                <input {...register('email')} type="email" placeholder="admin@commission.gov" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.email && <span className="text-xs text-danger">{errors.email.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ስልክ</label>
                <input {...register('phone')} type="tel" placeholder="+251-911-123-456" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.phone && <span className="text-xs text-danger">{errors.phone.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሁኔታ</label>
                <select {...register('status')} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                  <option value="Active">ንቁ (Active)</option>
                  <option value="Inactive">እንቅስቃሴ የለም (Inactive)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Roles & Access Level */}
        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የመዳረሻ ደረጃ</h3>
            <p className="text-xs text-text-muted -mt-4">ይህ አስተዳዳሪ ምን ዓይነት የስራ ሚና እና መዳረሻ እንደሚኖረው ይምረጡ።</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACCESS_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = accessLevel === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleAccessLevelChange(opt.value)}
                    className={`relative flex flex-col gap-3 p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${isSelected ? `${opt.border} ${opt.bg}` : 'border-border/30 hover:border-border/60 bg-surface-primary/50'}`}
                  >
                    <div className={`${opt.color} ${isSelected ? 'opacity-100' : 'opacity-40'}`}>
                      <Icon size={28} stroke={1.5} />
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{opt.label}</div>
                      <div className="text-[11px] text-text-muted mt-1 leading-relaxed">{opt.desc}</div>
                    </div>
                    {isSelected && (
                      <div className={`absolute top-3 right-3 w-5 h-5 rounded-full ${opt.color.replace('text-', 'bg-')} flex items-center justify-center`}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Under Specific Access */}
          {accessLevel === 'specific' && (
            <>
              <div className="w-full h-[1px] bg-border/20" />
              <div className="flex flex-col gap-5">
                <div>
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">የተወሰነ አስተዳዳሪ ሚና ይምረጡ</h4>
                  <p className="text-xs text-text-muted mt-1">የኮሚሽን ጽ/ቤት ሃላፊ፣ አቤቱታ ተቀባይ ወይም ብጁ ሞጁሎችን ይምረጡ።</p>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {SPECIFIC_ROLE_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    const isSelected = specificRole === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSpecificRoleSelect(opt.id)}
                        className={`flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? `${opt.borderColor} ${opt.bgActive} shadow-sm`
                            : 'border-border/30 hover:border-border/60 bg-surface-primary/40'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl border border-border/40 shrink-0 mt-0.5 ${isSelected ? opt.color + ' bg-surface-primary' : 'text-text-muted bg-surface-secondary/40'}`}>
                          <Icon size={22} stroke={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-sm font-bold ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                              {opt.title}
                            </span>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-surface-secondary/70 border border-border/40 font-medium text-text-muted">
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                          isSelected ? 'border-brand-blue bg-brand-blue text-white' : 'border-border/50'
                        }`}>
                          {isSelected && <IconCheck size={12} stroke={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Modules Selection (Shown only when 'custom' is selected) */}
                {specificRole === 'custom' && (
                  <div className="mt-4 p-5 rounded-2xl border border-border/30 bg-surface-secondary/20 flex flex-col gap-4">
                    <div>
                      <h5 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">ሞጁሎችን ይምረጡ</h5>
                      <p className="text-xs text-text-muted mt-0.5">ይህ አስተዳዳሪ ማግኘት የሚችላቸውን የተናጠል ሞጁሎች ይምረጡ።</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {ALL_MODULES.map(mod => {
                        const isSelected = selectedModules.includes(mod.id);
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => toggleModule(mod.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected ? 'bg-warning/10 border-warning/40 text-text-primary' : 'bg-surface-primary border-border/30 hover:border-border/60 text-text-secondary'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                              isSelected ? 'bg-warning border-warning text-white' : 'border-border/60'
                            }`}>
                              {isSelected && <IconCheck size={10} stroke={3} />}
                            </div>
                            <span className="text-xs font-medium truncate">{mod.labelAm}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Access Summary Badge */}
          <div className="w-full h-[1px] bg-border/20" />
          <div className="flex items-center gap-3 bg-surface-secondary/40 rounded-xl p-4 border border-border/30">
            <IconShieldCheck size={20} className="text-text-muted shrink-0" />
            <div className="text-xs text-text-muted leading-relaxed">
              {accessLevel === 'all' && 'ይህ አስተዳዳሪ ሁሉንም ሞጁሎችና ቅንብሮች ሙሉ በሙሉ ማስተዳደር የሚችል ዋና አስተዳዳሪ (Super Admin) ይሆናል።'}
              {accessLevel === 'specific' && specificRole === 'committee_leader' && 'ይህ አስተዳዳሪ እንደ የኮሚሽን ጽ/ቤት ሃላፊ (Committee Leader) ተመዝግቦ በልዩ ፖርታል (/complaint/dashboard) አቤቱታዎችን ይመረምራል፣ የመጨረሻ ውሳኔዎችን ያጸድቃል።'}
              {accessLevel === 'specific' && specificRole === 'complaint_receiver' && 'ይህ አስተዳዳሪ እንደ አቤቱታ ተቀባይ (Complaint Accepter) ተመዝግቦ አዳዲስ አቤቱታዎችን ይቀበላል፣ አጣሪ ኮሚቴ ይመድባል፣ የውሳኔ ረቂቅ ያዘጋጃል።'}
              {accessLevel === 'specific' && specificRole === 'custom' && (
                <>የተመረጡ ሞጁሎች፦ {selectedModules.length > 0 ? selectedModules.map(m => ALL_MODULES.find(mod => mod.id === m)?.labelAm || m).join(', ') : 'እስካሁን አልተመረጡም።'}</>
              )}
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}

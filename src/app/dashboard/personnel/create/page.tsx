'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconDeviceFloppy, IconCamera } from "@tabler/icons-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personnelSchema } from "@/lib/validations";
import { personnelService } from "@/services/personnel";
import { useRouter } from "next/navigation";
import * as z from "zod";

type PersonnelFormValues = z.infer<typeof personnelSchema>;

export default function CreatePersonnelPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PersonnelFormValues>({
    resolver: zodResolver(personnelSchema),
    defaultValues: {
      name: "",
      position: "",
      officeCategory: "Main Office",
      department: "",
      email: "",
      phone: ""
    }
  });

  const onSubmit = async (data: PersonnelFormValues) => {
    try {
      await personnelService.createPersonnel(data);
      router.push('/dashboard/personnel');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div>
            <Link href="/dashboard/personnel" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> Back to Personnel
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">Add New Staff Member</h1>
            <p className="text-sm text-text-muted mt-1">Create a new personnel entry in the directory.</p>
          </div>
          <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm disabled:opacity-50">
            <IconDeviceFloppy size={18} />
            {isSubmitting ? 'Saving...' : 'Save Member'}
          </button>
        </div>
        
        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-8">
          {/* Photo Upload */}
          <div className="flex items-center gap-8">
            <div className="relative group cursor-pointer">
              <div className="w-28 h-28 rounded-2xl bg-surface-secondary border-2 border-dashed border-border/50 flex items-center justify-center text-text-muted group-hover:border-brand-blue/50 group-hover:text-brand-blue transition-all">
                <IconCamera size={32} stroke={1.5} />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">Upload</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-text-primary">Staff Photo</h3>
              <p className="text-xs text-text-muted">Upload a professional headshot. JPG or PNG, max 2MB.</p>
              <p className="text-[10px] text-text-muted mt-1">Recommended: 400×400px square crop.</p>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* Personal Info */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Personal Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Full Name</label>
                <input {...register("name")} type="text" placeholder="e.g., Dr. Abebe Bekele" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.name && <span className="text-xs text-danger">{errors.name.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Department</label>
                <input {...register("department")} type="text" placeholder="e.g., HR" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.department && <span className="text-xs text-danger">{errors.department.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Email Address</label>
                <input {...register("email")} type="email" placeholder="e.g., abebe.b@cidms.gov.et" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.email && <span className="text-xs text-danger">{errors.email.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Phone Number</label>
                <input {...register("phone")} type="tel" placeholder="e.g., +251 911 123 456" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.phone && <span className="text-xs text-danger">{errors.phone.message}</span>}
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* Role & Assignment */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Role & Assignment</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Role/Position</label>
                <input {...register("position")} type="text" placeholder="e.g., Chief Commissioner" className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors" />
                {errors.position && <span className="text-xs text-danger">{errors.position.message}</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Office Category</label>
                <select {...register("officeCategory")} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer">
                  <option value="Main Office">ኮሚሽን ዋና ጽ/ቤት (Main Office)</option>
                  <option value="Branch">የኮሚሽን ቅርንጫፍ ጽ/ቤቶች (Branch Offices)</option>
                </select>
                {errors.officeCategory && <span className="text-xs text-danger">{errors.officeCategory.message}</span>}
              </div>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}

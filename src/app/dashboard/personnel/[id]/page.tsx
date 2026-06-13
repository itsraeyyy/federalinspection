import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconArrowLeft, IconDeviceFloppy, IconTrash, IconCamera } from "@tabler/icons-react";
import Link from "next/link";

export default function EditPersonnelPage({ params }: { params: { id: string } }) {
  // In a real app, fetch by params.id
  const person = {
    name: 'Dr. Abebe Bekele',
    nameAmharic: 'ዶ/ር አበበ በቀለ',
    role: 'Chief Commissioner',
    title: 'ዋና ኮሚሽነር',
    status: 'Active',
    email: 'abebe.b@cidms.gov.et',
    phone: '+251 911 123 456',
    office: 'ኮሚሽን ዋና ጽ/ቤት (Main Office)',
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full max-w-4xl mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div>
            <Link href="/dashboard/personnel" className="text-xs font-semibold text-brand-blue uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">
              <IconArrowLeft size={14} stroke={2} /> Back to Personnel
            </Link>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">Edit Staff Member</h1>
            <p className="text-sm text-text-muted mt-1">Updating record for {person.name}</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger px-5 py-2.5 rounded-full text-sm font-semibold transition-colors">
              <IconTrash size={18} />
              Delete Member
            </button>
            <button className="flex items-center gap-2 bg-brand-yellow hover:bg-brand-yellow/90 text-[#3D352E] px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              <IconDeviceFloppy size={18} />
              Save Changes
            </button>
          </div>
        </div>
        
        <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-8">
          {/* Photo Upload */}
          <div className="flex items-center gap-8">
            <div className="relative group cursor-pointer">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-surface-secondary to-surface-primary border border-border/50 flex items-center justify-center font-bold text-text-primary text-3xl shadow-sm">
                {person.name.charAt(0)}{person.name.split(' ')[1]?.charAt(0)}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <IconCamera size={24} className="text-brand-blue" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-text-primary">{person.name}</h3>
              <p className="text-xs text-text-muted">{person.title} • {person.role}</p>
              <button className="text-xs text-brand-blue hover:underline mt-2 w-fit font-medium">Change Photo</button>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* Personal Info */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Personal Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Full Name (English)</label>
                <input type="text" defaultValue={person.name} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Full Name (Amharic)</label>
                <input type="text" defaultValue={person.nameAmharic} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Email Address</label>
                <input type="email" defaultValue={person.email} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Phone Number</label>
                <input type="tel" defaultValue={person.phone} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors" />
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border/20"></div>

          {/* Role & Assignment */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Role & Assignment</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Official Title (Amharic)</label>
                <input type="text" defaultValue={person.title} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Role (English)</label>
                <input type="text" defaultValue={person.role} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Office</label>
                <select defaultValue={person.office} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors appearance-none cursor-pointer">
                  <option>ኮሚሽን ዋና ጽ/ቤት (Main Office)</option>
                  <option>የኮሚሽን ቅርንጫፍ ጽ/ቤቶች (Branch Offices)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Status</label>
                <select defaultValue={person.status} className="w-full bg-surface-primary border border-border/50 rounded-xl p-4 text-sm text-text-primary focus:outline-none focus:border-brand-yellow/50 transition-colors appearance-none cursor-pointer">
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { IconUserPlus, IconSearch, IconFilter, IconBuilding, IconEdit, IconTrash, IconCamera } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { personnelService } from "@/services/personnel";
import { Personnel } from "@/types";
import Image from "next/image";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    idToDelete: string | null;
  }>({ isOpen: false, idToDelete: null });

  const fetchPersonnel = async () => {
    setLoading(true);
    try {
      const data = await personnelService.getPersonnel();
      setPersonnel(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const handleDelete = (id: string) => {
    setConfirmDialog({ isOpen: true, idToDelete: id });
  };

  const confirmDelete = async () => {
    if (confirmDialog.idToDelete) {
      await personnelService.deletePersonnel(confirmDialog.idToDelete);
      setConfirmDialog({ isOpen: false, idToDelete: null });
      fetchPersonnel();
    }
  };

  const mainOffice = personnel.filter(p => p.officeCategory === 'Main Office' || p.officeCategoryAm === 'ኮሚሽን ጽ/ቤት');
  const branchOffices = personnel.filter(p => p.officeCategory !== 'Main Office' && p.officeCategoryAm !== 'ኮሚሽን ጽ/ቤት');

  const PersonnelCard = ({ person }: { person: Personnel }) => (
    <div className="bg-surface-primary/50 border border-border/30 rounded-2xl p-6 flex flex-col gap-4 hover:border-brand-blue/30 transition-colors shadow-sm relative group">
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/dashboard/personnel/${person.id}`} className="p-2 bg-surface-primary text-text-muted hover:text-brand-blue border border-border/50 rounded-lg shadow-sm transition-colors">
          <IconEdit size={16} />
        </Link>
        <button onClick={() => handleDelete(person.id)} className="p-2 bg-surface-primary text-text-muted hover:text-danger border border-border/50 rounded-lg shadow-sm transition-colors">
          <IconTrash size={16} />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          {person.photo ? (
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-[3px] border-surface-primary shadow-lg relative ring-1 ring-border/20">
              <Image src={person.photo} alt={person.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-surface-secondary to-surface-primary border-2 border-border/30 flex items-center justify-center font-bold text-text-primary text-3xl shadow-sm">
              {person.name.charAt(0)}{person.name.split(' ')[1]?.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-text-primary text-lg line-clamp-1">{person.nameAm || person.name}</h3>
          <p className="text-sm text-brand-blue font-semibold">{person.positionAm || person.position}</p>
        </div>
      </div>

      <div className="w-full h-[1px] bg-border/20"></div>

      <div className="flex flex-col gap-2 text-xs text-text-secondary">
        <div className="flex justify-between">
          <span className="text-text-muted">መምሪያ/ክፍል:</span>
          <span className="font-medium text-text-primary truncate max-w-[150px] text-right">{person.department || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">ስልክ:</span>
          <span className="font-medium text-text-primary">{person.phone || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">ኢሜል:</span>
          <span className="font-medium text-text-primary truncate max-w-[150px] text-right">{person.email || '-'}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-text-muted">ሁኔታ:</span>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${person.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {person.status === 'Active' ? 'ገቢር' : person.status}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 h-full max-w-7xl mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-light text-text-primary tracking-tight">የአመራር አካላት</h1>
            <p className="text-sm text-text-muted mt-1">የአመራር እና የሰራተኞች መረጃ አስተዳደር በማዕከል እና በቅርንጫፍ</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <IconSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="ሰራተኛ ፈልግ..." className="bg-surface-primary/50 border border-border/30 rounded-full pl-11 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-blue/50 w-64 transition-colors backdrop-blur-sm" />
            </div>
            <button className="flex items-center justify-center p-2.5 rounded-full border border-border/30 text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors backdrop-blur-sm">
              <IconFilter size={18} />
            </button>
            <Link href="/dashboard/personnel/create" className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              <IconUserPlus size={18} />
              አዲስ አባል
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-48 text-text-muted text-sm">በማምጣት ላይ...</div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Main Office Group */}
            <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-6">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <IconBuilding size={16} />
                ኮሚሽን ጽ/ቤት (Main Office)
              </h2>
              <div className="w-full h-[1px] bg-border/20"></div>
              {mainOffice.length === 0 ? (
                <div className="text-sm text-text-muted py-8 text-center">ምንም መረጃ አልተገኘም</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mainOffice.map(p => <PersonnelCard key={p.id} person={p} />)}
                </div>
              )}
            </div>

            {/* Branch Offices Group */}
            <div className="bg-surface-primary/30 rounded-[2rem] border border-border/20 p-8 backdrop-blur-md flex flex-col gap-6">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <IconBuilding size={16} />
                የኮሚሽን ቅርንጫፍ ጽ/ቤቶች (Branch Offices)
              </h2>
              <div className="w-full h-[1px] bg-border/20"></div>
              {branchOffices.length === 0 ? (
                <div className="text-sm text-text-muted py-8 text-center">ምንም መረጃ አልተገኘም</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {branchOffices.map(p => <PersonnelCard key={p.id} person={p} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title="መረጃ ማጥፋት"
        message="እርግጠኛ ነዎት ይህን መረጃ ማጥፋት ይፈልጋሉ?"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, idToDelete: null })}
      />
    </DashboardLayout>
  );
}

import { supabase } from '@/lib/supabaseClient';
import { Document, DocumentFile } from '../types';

export const MAIN_CATEGORIES = [
  { code: '000', name: 'መተዳደሪያ ደንብ' },
  { code: '100', name: 'የፓርቲ መመሪያዎች' },
  { code: '200', name: 'የኮሚሽን መመሪያዎች' },
  { code: '300', name: 'ዕቅድ' },
  { code: '400', name: 'ሪፖርት' },
  { code: '500', name: 'ቼክ ሊስት' },
  { code: '600', name: 'ግብረ-መልስ' },
  { code: '700', name: 'ልዩ ልዩ ሰነዶች' },
  { code: '800', name: 'ቃለ ጉባዔ' },
  { code: '900', name: 'የመረጃ ቅጾች' },
] as const;

export const SUB_CATEGORIES: Record<string, { code: string; name: string }[]> = {
  '000': [
    { code: '010', name: 'የ2012 መተዳደሪያ ደንብ' },
    { code: '020', name: 'የ2014 መተዳደሪያ ደንብ' },
    { code: '030', name: 'የ2017 መተዳደሪያ ደንብ' },
  ],
  '100': [
    { code: '110', name: 'የዲሲፕሊን መመሪያ' },
    { code: '120', name: 'የኢንስፔክሽንና የቁጥጥር መመሪያ' },
    { code: '130', name: 'የአመራር የምደባ መመሪያ' },
    { code: '140', name: 'የአመራር የምዘና መመሪያ' },
    { code: '150', name: 'የአደረጃጀትና አሰራር መመሪያ' },
    { code: '160', name: 'የአባላት መዋጮ አሰባሰብ መመሪያ' },
    { code: '170', name: 'የፓርቲ አባላት ምልመላ፣ ግንባታና ስንብት መመሪያ' },
    { code: '180', name: 'የፓርቲ ሀብቶች መመሪያዎች' },
    { code: '190', name: 'የተተኪና ኮር አመራር ምልመላ መመሪያ' },
  ],
  '200': [
    { code: '210', name: 'የአደረጃጀትና አሰራር መመሪያ ቁጥር 1/2014' },
    { code: '220', name: 'የተሻሻለ የአደረጃጀትና አሰራር መመሪያ ቁጥር 2/2016' },
    { code: '230', name: 'የግምገማና ምዘና መመሪያ ቁጥር 3/2016' },
    { code: '240', name: 'የአቤቱታ አቀራረብ መመሪያ ቁጥር 4/2016' },
  ],
  '300': [
    { code: '310', name: 'የ2016 በጀት ዓመት ዕቅድ' },
    { code: '320', name: 'የ2017 በጀት ዓመት ዕቅድ' },
    { code: '330', name: 'የ2018 በጀት ዓመት ዕቅድ' },
  ],
  '400': [
    { code: '410', name: 'የሩብ ዓመት ሪፖርት' },
    { code: '420', name: 'የዓመት ሪፖርት' },
    { code: '430', name: 'ለኮንፈረንስ የቀረበ ሪፖርት' },
    { code: '440', name: 'ለኮሚሽን መዋቅር የተላከ ሪፖርት' },
    { code: '450', name: 'የኢንስፔክሽን ግኝቶች ምክረ-ሃሳብ የግብረ-መልስ ሪፖርት' },
    { code: '460', name: 'ለፓርቲ ቅ/ጽ/ቤት የተላከ ሪፖርት' },
    { code: '470', name: 'ለጉባዔ የቀረበ ሪፖርት' },
  ],
  '500': [
    { code: '510', name: 'የሱፐርቪዥንና የኢንስፔክሽን ቼክ ሊስት' },
    { code: '520', name: 'የዕቅድ ቼክ ሊስት' },
    { code: '530', name: 'የምዘና ቼክ ሊስት' },
  ],
  '600': [
    { code: '610', name: 'ለፓርቲ መዋቅር የተሰጠ የኢንስፔክሽን ግብረ-መልስ' },
    { code: '620', name: 'ለኮሚሽን መዋቅር የተሰጠ የሱፐርቪዥን ግብረ መልስ' },
    { code: '630', name: 'የእቅድ ግብረ መልስ' },
    { code: '640', name: 'የሪፖርት ግብረ-መልስ' },
    { code: '650', name: 'የግምገማ ግብረ-መልስ' },
    { code: '660', name: 'ከፓርቲ ጽ/ቤቶች የተሰጠ የግብረ-መልስ ግብረ-መልስ' },
  ],
  '700': [
    { code: '710', name: 'የአቅም ግንባታ ስልጠና ሰነድ' },
    { code: '720', name: 'የሥነ-ምግባር ግንባታ ሰነድ' },
    { code: '730', name: 'የጸረ-ሙስና ስልጠና ሰነድ' },
    { code: '740', name: 'የተቀመረ ልምድ ሰነድ' },
    { code: '750', name: 'ፎቶግራፎች' },
    { code: '760', name: 'የማህበራዊ ሚዲያ አጠቃቀም ሰነድ' },
    { code: '770', name: 'የመግባቢያ ሰነድ እና የጅግጅጋ/አዲስ አበባ ስምምነት' },
    { code: '780', name: 'የስልጠና/የኦሬንተሽን/የጋራ መድረክ ተሳታፊ አቴንዳንስ' },
    { code: '790', name: 'ከፓርቲ ዋና ጽ/ቤትና ለዞኖች/ከተሞች/ልዩ ወረዳ የተላከ ስራ መመሪያ/ሰርኩላር' },
  ],
  '800': [
    { code: '810', name: 'የኮሚሽን' },
    { code: '820', name: 'የሥራ አመራር ኮሚቴ' },
    { code: '830', name: 'የጽ/ቤት ማኔጅመንት ኮሚቴ' },
    { code: '840', name: 'የሱፐርቪዥንና ኢንስፔክሽን' },
    { code: '850', name: 'የስልጠና ቃለ-ጉባዬ' },
    { code: '860', name: 'ክ/ከተማ ፓርቲ ጋር መደበኛ ግኑኘነት ቃለ-ጉባዔ' },
    { code: '870', name: 'ከወረዳ ኮሚሽን ቅ/ቤት ጋር መደበኛ ግኑኘነት ቃለ-ጉባዔ' },
    { code: '880', name: 'የልዩ ወረዳ ኮሚሽን ቃለ-ጉባዬ' },
    { code: '890', name: 'የፕሮቶኮል መዝገብ' },
    { code: '891', name: 'አስተያየት መስጫ' },
  ],
  '900': [
    { code: '910', name: 'ቅጽ 1 – 20' },
    { code: '920', name: 'የምዘና ቅጾች' },
    { code: '930', name: 'የስልጠና እርካታ ቅጾች' },
    { code: '940', name: 'የጽሁፍ መጠይቅ ቅጾች' },
    { code: '950', name: 'ልዩ ልዩ ደብዳቤዎች' },
    { code: '960', name: 'የምስጋናና የዕውቅና የምስክር ወረቀቶች' },
  ],
};

export const documentService = {
  getDocuments: async (): Promise<Document[]> => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
    
    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      description: d.description || '',
      office: d.office,
      mainCategory: d.main_category,
      subCategory: d.sub_category,
      year: d.year,
      uploadedBy: d.uploaded_by,
      uploadDate: d.upload_date,
      files: d.files || []
    })) as Document[];
  },

  getDocumentById: async (id: string): Promise<Document | undefined> => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching document:', error);
      return undefined;
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      office: data.office,
      mainCategory: data.main_category,
      subCategory: data.sub_category,
      year: data.year,
      uploadedBy: data.uploaded_by,
      uploadDate: data.upload_date,
      files: data.files || []
    } as Document;
  },

  uploadDocument: async (docData: {
    title: string;
    description: string;
    office: string;
    mainCategory: string;
    subCategory: string;
    year: string;
  }, file: File): Promise<Document> => {
    
    const fileExt = file.name.split('.').pop() || '';
    const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
    const storagePath = `${docData.office}/${docData.year}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file);
      
    if (uploadError) throw uploadError;

    const documentFile: DocumentFile = {
      id: fileName,
      fileType: fileExt.toUpperCase(),
      name: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    };

    const { data, error } = await supabase
      .from('documents')
      .insert([{
        title: docData.title || file.name,
        description: docData.description || '',
        office: docData.office,
        main_category: docData.mainCategory,
        sub_category: docData.subCategory,
        year: docData.year,
        uploaded_by: 'Current Admin', // This should be fetched from context normally
        upload_date: new Date().toLocaleDateString('am-ET', { month: 'short', day: 'numeric', year: 'numeric' }),
        files: [documentFile]
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      office: data.office,
      mainCategory: data.main_category,
      subCategory: data.sub_category,
      year: data.year,
      uploadedBy: data.uploaded_by,
      uploadDate: data.upload_date,
      files: data.files || []
    } as Document;
  },

  deleteDocument: async (id: string): Promise<boolean> => {
    // Delete the database record. 
    // In a full implementation, you should also delete the files from storage here.
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting document:', error);
      return false;
    }
    return true;
  }
};

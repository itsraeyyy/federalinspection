"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface FormSchema {
  id: string;
  table_title: string;
  columns: {
    key: string;
    subKeys: string[];
  }[];
}

export async function getFormSchemas() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("form_schemas")
    .select("*")
    .order("id");

  if (error) {
    console.error("Error fetching form schemas:", error);
    return { data: null, error: error.message };
  }

  // Sort them naturally if they have standard names like form_01, form_02, form_02_1
  data.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return { data: data as FormSchema[], error: null };
}

export async function updateFormSchema(id: string, table_title: string, columns: any[]) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("form_schemas")
    .update({ 
      table_title, 
      columns,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating form schema:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin/forms");
  revalidatePath("/dashboard/reports");
  return { error: null };
}

export async function createFormSchema(id: string, table_title: string, columns: any[]) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("form_schemas")
    .insert({ 
      id,
      table_title, 
      columns
    });

  if (error) {
    console.error("Error creating form schema:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin/forms");
  revalidatePath("/dashboard/reports");
  return { error: null };
}

export async function deleteFormSchema(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("form_schemas")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting form schema:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin/forms");
  revalidatePath("/dashboard/reports");
  return { error: null };
}

const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/data/forms-schema.json', 'utf8'));

let sql = `-- Seed initial form schemas\n`;
sql += `INSERT INTO public.form_schemas (id, table_title, columns)\nVALUES\n`;

const values = data.map(form => {
  const id = form.id.replace(/'/g, "''");
  const title = form.table_title.replace(/'/g, "''");
  const cols = JSON.stringify(form.columns).replace(/'/g, "''");
  return `  ('${id}', '${title}', '${cols}'::jsonb)`;
});

sql += values.join(',\n') + ';\n';

fs.writeFileSync('supabase/migrations/20260709094600_seed_form_schemas.sql', sql);
console.log('Seed migration created.');

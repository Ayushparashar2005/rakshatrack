const fs = require('fs');
const path = require('path');

const dir = 'd:/rak/src/routes';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => path.join(dir, f));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace Header 1
  content = content.replace(
    /className="bg-\[--color-surface-raised\] p-5 rounded-2xl border border-\[--color-border-subtle\] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"/g,
    'className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4"'
  );

  // Replace Header 2 (reviews.tsx)
  content = content.replace(
    /className="bg-\[--color-surface-raised\] p-5 rounded-\[--radius-lg\] border border-\[--color-border-subtle\] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ boxShadow: 'var\(--shadow-sm\)', borderLeft: '3px solid var\(--color-flagged\)' }}/g,
    'className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ borderLeft: "4px solid var(--color-flagged)" }}'
  );
  
  // Replace Header 3 (attendance.tsx)
  content = content.replace(
    /className="bg-\[--color-surface-raised\] p-5 rounded-\[--radius-lg\] border border-\[--color-border-subtle\] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"/g,
    'className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4"'
  );

  // Replace Section Tags
  content = content.replace(/className="text-\[11px\] font-bold uppercase tracking-wider text-[a-z]+-[0-9]+ bg-[a-z]+-[0-9]+ border border-[a-z]+-[0-9]+ px-2\.5 py-0\.5 rounded-full font-mono"/g, 'className="section-tag"');

  fs.writeFileSync(file, content);
});
console.log('Replaced headers and tags in routes.');

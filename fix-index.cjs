const fs = require('fs');
let file = 'd:/rak/src/routes/index.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.split('text-[11px] font-medium text-[--color-text-muted]').join('text-[11px] font-medium text-[--color-text-secondary]');
fs.writeFileSync(file, content);
console.log('Updated index.tsx stat cards');

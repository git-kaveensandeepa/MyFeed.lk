const fs = require('fs');
const file = 'src/app/admin.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "{{ audioService.latestEdition()?.title || 'No active brief' }}",
  "{{ audioService.latestEdition().title || 'No active brief' }}"
);

code = code.replace(
  "{{ audioService.latestEdition()?.timeWindowText || '4:00 AM - 4:00 AM' }}",
  "{{ audioService.latestEdition().timeWindowText || '4:00 AM - 4:00 AM' }}"
);

fs.writeFileSync(file, code);

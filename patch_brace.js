const fs = require('fs');
let code = fs.readFileSync('src/app/learn.component.ts', 'utf8');

// The regex replacement left some messy braces at the end. Let's fix them.
code = code.replace(
  '  getEarnedBadgesCount(): number {\n    return this.tracks.filter(t => this.getTrackCompletedCount(t) === t.lessons.length && t.lessons.length > 0).length;\n  }    }\n  }  }\n}',
  '  getEarnedBadgesCount(): number {\n    return this.tracks.filter(t => this.getTrackCompletedCount(t) === t.lessons.length && t.lessons.length > 0).length;\n  }\n}'
);

fs.writeFileSync('src/app/learn.component.ts', code);

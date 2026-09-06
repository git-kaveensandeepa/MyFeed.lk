const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.html') || file.endsWith('.json')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');
files.push('metadata.json');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  // Replace MyFeed.lk (case insensitive but preserving casing in regex isn't needed if we just replace it)
  // We'll use a regex with case insensitivity to catch all variations, but we don't want to break actual code if any.
  
  newContent = newContent.replace(/MyFeed\.lk/gi, 'My Feed LK');
  newContent = newContent.replace(/My Feed\.lk/gi, 'My Feed LK');
  newContent = newContent.replace(/My Feed Lk/g, 'My Feed LK');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated:', file);
  }
});

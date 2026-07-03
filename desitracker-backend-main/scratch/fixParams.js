const fs = require('fs');
const path = require('path');

function fixFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixFiles(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // In Express types, req.params can sometimes be inferred as having string|string[] values.
      // We'll explicitly cast usages of req.params.xxx to (req.params.xxx as string) when passed to services.
      
      const newContent = content.replace(/req\.params\?\.(slug|reviewId|businessId|id|itemId|voidId|optionId|productId)(?! as)/g, '(req.params?.$1 as string)');
      const newContent2 = newContent.replace(/req\.params\.(slug|reviewId|businessId|id|itemId|voidId|optionId|productId)(?! as)/g, '(req.params.$1 as string)');

      if (content !== newContent2) {
        content = newContent2;
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed req.params in: ${fullPath}`);
      }
    }
  }
}

fixFiles(path.join(__dirname, '../src/modules'));
console.log('Done fixing req.params TS errors.');

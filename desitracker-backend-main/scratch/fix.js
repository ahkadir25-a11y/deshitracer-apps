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

      // Fix `req.query as {`
      if (content.includes('req.query as {')) {
        content = content.replace(/req\.query as \{/g, '(req.query as any) as {');
        changed = true;
      }
      
      // Fix specific Review controller error where req.query is passed directly
      if (fullPath.includes('review.controller.ts')) {
        if (content.includes('req.query,')) {
           content = content.replace(/req\.query,/g, 'req.query as any,');
           changed = true;
        }
        if (content.includes('getAllReviews(req.query)')) {
           content = content.replace(/getAllReviews\(req\.query\)/g, 'getAllReviews(req.query as any)');
           changed = true;
        }
      }

      // Fix specific order.service.ts errors
      if (fullPath.includes('order.service.ts')) {
         if (content.includes('order.membershipDiscount.payable = order.subtotal - (order.membershipDiscount.discountAmount || 0);')) {
            content = content.replace(
              /if \(order\.membershipDiscount\?\.applied\) \{([\s\S]*?)\} else \{([\s\S]*?order\.membershipDiscount\.payable = order\.subtotal;\s*)\}/,
              'if (order.membershipDiscount?.applied) {$1} else if (order.membershipDiscount) {$2}'
            );
            changed = true;
         }
         if (content.includes('item.kitchenStatus = status;')) {
            content = content.replace(/item\.kitchenStatus = status;/g, 'item.kitchenStatus = status as any;');
            changed = true;
         }
      }

      // Fix user controllers where req.query is passed directly
      if (fullPath.includes('user.controllers.ts')) {
         if (content.includes('getUsers(req.query)')) {
            content = content.replace(/getUsers\(req\.query\)/g, 'getUsers(req.query as any)');
            changed = true;
         }
      }

      // Fix specific issues in auth.controllers.ts if any
      if (fullPath.includes('auth.controllers.ts') || fullPath.includes('subcategory.controller.ts') || fullPath.includes('testimonial.controller.ts') || fullPath.includes('table.controller.ts') || fullPath.includes('productOption.controller.ts')) {
         // Some controllers pass req.query.xxx to services. A blanket fix for `req.query.` assignments
         // We will just let `req.query as any as {` fix handle most.
         // Wait, `req.query?.userId as string` in productOption.controller.ts:
         if (content.includes('(req.query?.userId as string)')) {
            content = content.replace(/\(req\.query\?\.userId as string\)/g, '((req.query?.userId as any) as string)');
            changed = true;
         }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed: ${fullPath}`);
      }
    }
  }
}

fixFiles(path.join(__dirname, '../src/modules'));
console.log('Done fixing TS errors.');

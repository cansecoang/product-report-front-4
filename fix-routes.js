const fs = require('fs');
const path = require('path');

// Lista de archivos a corregir
const apiRoutes = [
  'src/app/api/work-packages/route.ts',
  'src/app/api/product-phases/route.ts', 
  'src/app/api/explore-tasks/route.ts',
  'src/app/api/test-tasks/route.ts',
  'src/app/api/test-products/route.ts',
  'src/app/api/task-details/route.ts',
  'src/app/api/statuses/route.ts',
  'src/app/api/organizations/route.ts',
  'src/app/api/add-task/route.ts',
  'src/app/api/delete-task/route.ts',
  'src/app/api/update-task/route.ts',
  'src/app/api/indicators-metrics/route.ts',
  'src/app/api/indicators/route.ts', 
  'src/app/api/responsibles/route.ts',
  'src/app/api/add-product/route.ts'
];

console.log('🔧 Fixing hardcoded database connections...\n');

apiRoutes.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Reemplazar import de Pool por import del pool configurado
    content = content.replace(
      /import { Pool } from 'pg';/g,
      "import { pool } from '@/lib/db';"
    );
    
    // Remover la configuración hardcodeada del pool
    content = content.replace(
      /const pool = new Pool\({[\s\S]*?}\);/g,
      ''
    );
    
    // Limpiar líneas vacías extra
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('\n🎉 All API routes fixed!');
console.log('💡 All routes now use the centralized database configuration from src/lib/db.ts');

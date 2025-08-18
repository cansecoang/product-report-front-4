#!/bin/bash

# Script para reemplazar todas las conexiones hardcodeadas por import del pool centralizado

# Lista de archivos a modificar
files=(
  "src/app/api/work-packages/route.ts"
  "src/app/api/product-tasks/route.ts" 
  "src/app/api/product-phases/route.ts"
  "src/app/api/explore-tasks/route.ts"
  "src/app/api/test-tasks/route.ts"
  "src/app/api/test-products/route.ts"
  "src/app/api/task-details/route.ts"
  "src/app/api/statuses/route.ts"
  "src/app/api/organizations/route.ts"
  "src/app/api/add-task/route.ts"
  "src/app/api/delete-task/route.ts"
  "src/app/api/update-task/route.ts"
  "src/app/api/indicators-metrics/route.ts"
  "src/app/api/indicators/route.ts"
  "src/app/api/responsibles/route.ts"
  "src/app/api/add-product/route.ts"
)

echo "🔧 Fixing hardcoded database connections..."

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processing: $file"
    
    # Backup original
    cp "$file" "$file.backup"
    
    # Replace hardcoded Pool import and configuration
    sed -i 's/import { Pool } from '\''pg'\'';/import { pool } from '\''@\/lib\/db'\'';/g' "$file"
    sed -i '/const pool = new Pool({/,/});/d' "$file"
    
    echo "✅ Fixed: $file"
  else
    echo "❌ File not found: $file"
  fi
done

echo "🎉 All files processed!"
echo "💡 Don't forget to commit and push the changes"

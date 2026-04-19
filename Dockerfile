FROM node:24-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --prefer-offline --no-audit || npm ci

COPY . .

# Build with proper error handling (fail fast)
RUN npm run build || \
    (echo "❌ Primary build failed" >&2; \
     cd services/aukro-service && \
     npm install && \
     npm run build && \
     cd ../.. && \
     cp -r services/aukro-service/dist ./dist) || \
    (echo "❌ Fallback build also failed" >&2; exit 1)

# Verify dist/ was created successfully
RUN test -f dist/main.js || \
    (echo "❌ Build completed but dist/main.js not found" >&2; exit 1) && \
    echo "✅ dist/main.js successfully created"

EXPOSE 3000

ENTRYPOINT ["node"]
CMD ["dist/main.js"]

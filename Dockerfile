FROM node:24-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --prefer-offline --no-audit || npm ci

COPY . .

# Build shared module first (required dependency)
RUN cd /app/shared && npm run build

# Build aukro-service and copy its dist
RUN cd services/aukro-service && \
    npm run build && \
    cd ../.. && \
    cp -r services/aukro-service/dist ./dist

# Verify dist/ was created successfully
RUN test -f dist/main.js || \
    (echo "❌ Build completed but dist/main.js not found" >&2; exit 1) && \
    echo "✅ dist/main.js successfully created"

EXPOSE 3000

ENTRYPOINT ["node"]
CMD ["dist/main.js"]

FROM node:20-alpine

WORKDIR /app

COPY app/package.json ./package.json
COPY app/package-lock.json ./package-lock.json
COPY app/.env.example ./.env.example
COPY app/frontend ./frontend
COPY app/backend ./backend
COPY app/.monkeycode ./.monkeycode
COPY app/README.md ./README.md

RUN npm install && npm install --workspace frontend && npm install --workspace backend
RUN npm run build --workspace frontend && npm run build --workspace backend

EXPOSE 3001

CMD ["npm", "run", "start", "--workspace", "backend"]

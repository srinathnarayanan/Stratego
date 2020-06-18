backend:
ts-node src\app.tsx

frontend:
npm start

ngrok usage: ngrok http 8080 -host-header="localhost:8080"
create ngrok for backend, add as REACT_APP_BACKEND_URL='<NGROK URL>' in frontend's .env
create ngrok for frontend now and share!
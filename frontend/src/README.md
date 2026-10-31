## Run Locally

Backend:
```
pip install fastapi uvicorn sqlalchemy python-multipart python-jose "passlib[bcrypt]" "bcrypt==4.0.1"
python create_tables.py
uvicorn main:app --reload
```

Frontend:
```
cd frontend
npm install
npm run dev
```